# INDUSTRIAL-MANAGEMENT-DEMO

**Generated:** 2026-02-10 | **Commit:** 79248b8 | **Branch:** master

## OVERVIEW

Industrial management portal for form management, QR codes, digital signatures, equipment tracking, and analytics. Next.js 16 + React 19 + Tailwind 4 + shadcn/ui. Currently UI showcase only - Phase 2 features pending.

## STRUCTURE

```
./
├── app/               # Next.js App Router (layout + single page)
├── components/
│   ├── ui/            # shadcn/ui components (13 files, standard)
│   └── *.tsx          # Demo wrappers
├── lib/               # Utilities (cn helper only)
├── docs/              # Requirements docs (Spanish)
│   └── project.md     # Phase 2 functional requirements (RF-01 to RF-19)
└── public/            # Static assets
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add new page | `app/[route]/page.tsx` | App Router convention |
| Add API endpoint | `app/api/[route]/route.ts` | None exist yet |
| Add UI component | `components/ui/` | Use shadcn CLI |
| Global styles/theme | `app/globals.css` | OKLCH color variables |
| Path aliases | `tsconfig.json` | `@/*` → root |
| Linting rules | `biome.json` | Biome, not ESLint |
| Requirements | `docs/project.md` | 7 modules planned |

## STACK

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Next.js 16.1.6 | App Router, RSC enabled |
| React | 19.2.3 | Latest with Server Components |
| Styling | Tailwind CSS 4 | PostCSS, no tailwind.config |
| UI Components | shadcn/ui | radix-lyra style |
| Icons | Phosphor | NOT Lucide |
| Linter/Formatter | Biome 2.3.14 | Replaces ESLint + Prettier |
| Package Manager | pnpm | Workspace configured |

## CONVENTIONS

### Formatting (Biome)
- **Tabs** not spaces
- **Double quotes** for strings
- **No semicolons** (asNeeded)
- **Auto-organize imports** on save

### TypeScript
- **Strict mode** enabled
- `@/*` path alias for all imports
- Prefer `type` imports: `import type { X }` 

### Components
- Use `cn()` from `@/lib/utils` for class merging
- `data-slot` attributes on component roots
- Phosphor icons, not Lucide

### Styling
- **OKLCH color space** in CSS variables
- `--radius: 0` (sharp corners default)
- Dark mode via `.dark` class

## ANTI-PATTERNS

| Pattern | Why Forbidden |
|---------|---------------|
| `any` type | Biome warns - use proper types |
| Non-null assertion `!` | Biome warns - handle nulls |
| Unused imports/vars | Biome warns - clean up |
| Hooks outside top level | Biome **errors** |
| ESLint/Prettier | Use Biome instead |
| Lucide icons | Project uses Phosphor |

## COMMANDS

```bash
# Development
pnpm dev              # Start dev server (localhost:3000)

# Code Quality
pnpm lint             # Check with Biome
pnpm lint:fix         # Auto-fix issues
pnpm format           # Format with Biome

# Production
pnpm build            # Build for production
pnpm start            # Start production server
```

## CRITICAL GAPS (Phase 2 Required)

| Gap | Status | Required For |
|-----|--------|--------------|
| Database/ORM | Missing | All modules |
| Authentication | Missing | User tracking, permissions |
| API routes | Missing | Form submissions, data |
| State management | Missing | Global app state |
| Form validation | Missing | Form builder, submissions |
| Testing | Missing | Quality assurance |
| CI/CD | Missing | Automated deployment |

## PHASE 2 MODULES (docs/project.md)

1. **Form Management** (RF-01 to RF-03) - Centralized form submission/storage
2. **Form Builder** (RF-04 to RF-06) - Visual dynamic form constructor
3. **Form Admin** (RF-07 to RF-09) - Real-time form activation/deactivation
4. **QR Codes** (RF-10 to RF-11) - Auto-generate QR for forms
5. **Digital Signatures** (RF-12 to RF-14) - Legal traceability
6. **Equipment History** (RF-15 to RF-16) - Audit trail per equipment
7. **Analytics Dashboard** (RF-17 to RF-19) - Supervisor metrics

## NOTES

- **Spanish documentation**: `docs/project.md` contains requirements in Spanish
- **Demo only**: Current code is UI component showcase, no business logic
- **No .env files**: Add `.env.local` before implementing API features
- **No tests**: Add Vitest/Jest before Phase 2 implementation
