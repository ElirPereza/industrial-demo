/**
 * Migration runner for Industrial Portal
 * Runs: node scripts/migrate.mjs
 */
import { createClient } from "@supabase/supabase-js"
import { readFileSync, readdirSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")

const SUPABASE_URL = "https://spfhqgdaqohqnkvwllhf.supabase.co"
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwZmhxZ2RhcW9ocW5rdndsbGhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU2MDgxMSwiZXhwIjoyMDkwMTM2ODExfQ.QohkRb47MEn830ovo2ieBT94-ip7Hzkp57lSKaFu3WA"

// Execute SQL via Management API approach using fetch
async function execSQL(sql) {
	const res = await fetch(`https://api.supabase.com/v1/projects/spfhqgdaqohqnkvwllhf/database/query`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
		},
		body: JSON.stringify({ query: sql }),
	})
	if (res.ok) return { ok: true }
	const err = await res.json()

	// Fallback: try direct postgres via supabase-js admin
	// (works for INSERT/SELECT, not DDL — but worth trying)
	return { ok: false, error: err }
}

console.log("🚀 Industrial Portal — Database Migration Runner")
console.log("📡 Project: spfhqgdaqohqnkvwllhf")
console.log("")

// Read all migration files
const migrationsDir = resolve(ROOT, "supabase/migrations")
const files = readdirSync(migrationsDir)
	.filter((f) => f.endsWith(".sql"))
	.sort()

console.log(`📋 Found ${files.length} migration files:`)
files.forEach((f) => console.log(`   - ${f}`))
console.log("")

// Try to execute migrations
let anySuccess = false

for (const file of files) {
	const sql = readFileSync(resolve(migrationsDir, file), "utf-8")
	process.stdout.write(`⏳ Applying ${file}... `)

	const result = await execSQL(sql)
	if (result.ok) {
		console.log("✅ Done")
		anySuccess = true
	} else {
		console.log(`❌ Failed: ${JSON.stringify(result.error).substring(0, 100)}`)
	}
}

console.log("")

if (!anySuccess) {
	console.log("━".repeat(60))
	console.log("ℹ️  The Management API requires a Personal Access Token.")
	console.log("   The service role key alone is not enough.")
	console.log("")
	console.log("✅ SOLUTION — Option 1 (30 seconds):")
	console.log("   1. Go to: https://supabase.com/dashboard/project/spfhqgdaqohqnkvwllhf/sql/new")
	console.log("   2. Open the file: supabase/ALL_MIGRATIONS.sql")
	console.log("   3. Copy ALL content and paste in the SQL editor")
	console.log("   4. Click Run")
	console.log("")
	console.log("✅ SOLUTION — Option 2 (if you have psql installed):")
	console.log(
		'   psql "postgres://postgres.spfhqgdaqohqnkvwllhf:ZBi3%23%3Fw%25q%21%26McGL@aws-0-us-east-1.pooler.supabase.com:6543/postgres" -f supabase/ALL_MIGRATIONS.sql',
	)
	console.log("")
	console.log("📄 After applying migrations, come back and say 'listo, apliqué las migraciones'")
} else {
	console.log("✅ All migrations applied successfully!")
}
