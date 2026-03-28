import { readdirSync, readFileSync } from "fs"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")
const ENV_PATH = resolve(ROOT, ".env.local")
const MIGRATIONS_DIR = resolve(ROOT, "supabase", "migrations")

function parseEnvFile(content) {
	return Object.fromEntries(
		content
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter((line) => line && !line.startsWith("#") && line.includes("="))
			.map((line) => {
				const [key, ...rest] = line.split("=")
				return [key.trim(), rest.join("=").trim()]
			}),
	)
}

function getProjectRef(url) {
	try {
		return new URL(url).hostname.split(".")[0]
	} catch {
		return "unknown"
	}
}

function extractTableNames(sql) {
	const matches = [
		...sql.matchAll(
			/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?([a-zA-Z0-9_]+)"?/gi,
		),
	]
	return [...new Set(matches.map((match) => match[1]))]
}

async function fetchJson(url, options) {
	const response = await fetch(url, options)
	const text = await response.text()
	let body = text
	try {
		body = text ? JSON.parse(text) : null
	} catch {
		body = text
	}
	return { response, body }
}

const envContent = readFileSync(ENV_PATH, "utf-8")
const env = parseEnvFile(envContent)

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
	console.error("Missing Supabase credentials in .env.local")
	process.exit(1)
}

const projectRef = getProjectRef(SUPABASE_URL)
const restBase = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1`

console.log(`Connecting to: ${SUPABASE_URL}`)
console.log(`Project ref: ${projectRef}`)

const migrations = readdirSync(MIGRATIONS_DIR)
	.filter((file) => file.endsWith(".sql"))
	.sort()
	.map((file) => {
		const sql = readFileSync(resolve(MIGRATIONS_DIR, file), "utf-8")
		return {
			file,
			tables: extractTableNames(sql),
		}
	})

const headers = {
	Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
	apikey: SERVICE_ROLE_KEY,
}

console.log("\n1) REST API connectivity check")
const { response: rootResponse, body: rootBody } = await fetchJson(restBase, {
	headers,
})

console.log(`   Status: ${rootResponse.status} ${rootResponse.statusText}`)
if (typeof rootBody === "string" && rootBody) {
	console.log(`   Body: ${rootBody.slice(0, 180)}`)
}

console.log("\n2) Tables inferred from local migrations")
const allTables = [...new Set(migrations.flatMap((item) => item.tables))]

if (allTables.length === 0) {
	console.log("   No CREATE TABLE statements found in migration files.")
} else {
	for (const table of allTables) {
		const { response } = await fetchJson(
			`${restBase}/${table}?select=*&limit=1`,
			{
				headers,
			},
		)
		const status = response.ok ? "present" : "missing or inaccessible"
		console.log(`   - ${table}: ${status} (${response.status})`)
	}
}

console.log("\n3) Migration status")
for (const migration of migrations) {
	if (migration.tables.length === 0) {
		console.log(`   - ${migration.file}: unknown (no table creation detected)`)
		continue
	}

	const checks = await Promise.all(
		migration.tables.map(async (table) => {
			const { response } = await fetchJson(
				`${restBase}/${table}?select=*&limit=1`,
				{
					headers,
				},
			)
			return response.ok
		}),
	)

	const status = checks.every(Boolean) ? "likely applied" : "needs attention"
	console.log(`   - ${migration.file}: ${status}`)
}

console.log("\n4) SQL Editor URL")
console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new`)

console.log("\nDone.")
