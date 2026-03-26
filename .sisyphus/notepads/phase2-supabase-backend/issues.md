# Issues Log

## [2026-03-26] Session Start — DB Connectivity

**Issue**: Supabase project `ewoavayvfqiphdwjztqr` is TIMING OUT on all SQL queries.
**Cause**: Project is likely PAUSED (Supabase pauses free-tier projects after inactivity).
**Impact**: Tasks T2, T7, T8, T9, T10 cannot run until DB is responsive.
**Resolution**: User must unpause the project from https://supabase.com/dashboard
**Workaround**: Proceeding with code-only tasks T1, T3, T4, T5, T6 that don't need DB.

## [2026-03-26] proxy.ts Naming

**Issue**: Plan specifies `proxy.ts` as the auth middleware filename for Next.js 16.
**Reality**: Standard Next.js middleware is still `middleware.ts` in all versions including 16.
**Decision**: Using `middleware.ts` (standard Next.js convention). The `proxy.ts` naming from planning agents was incorrect.
**Impact**: T4 will create `middleware.ts`, not `proxy.ts`. All plan references to proxy.ts mean middleware.ts.

## [T1 Complete]
Packages installed: @supabase/supabase-js, @supabase/ssr, zod
Removed: lucide-react
Build status: PASS
.env.local: Created (anon key placeholder — needs real key from dashboard)
