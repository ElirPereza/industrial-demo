# Decisions Log

## [2026-03-26] Database Audit Fix Scope

- Applied only additive/safe SQL changes (indexes, ALTER POLICY expressions, ALTER FUNCTION config).
- Avoided destructive changes (no table drops, no data deletion, no enum modification, no column renames).
- Deferred policy command-level refactors (which require drop/recreate) to preserve current authorization behavior during audit.
