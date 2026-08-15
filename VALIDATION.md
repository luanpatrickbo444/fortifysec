# FortifySec Unified — Validation

## Executed checks

- 38 `.ts`/`.tsx` application files were passed through the TypeScript transpiler for syntax validation.
- Result: **0 syntax-error files**.
- SQL migrations are separated into `001_final_schema.sql` and `002_labs_challenges_ctf.sql`; run them in that order.
- No `node_modules` directory is bundled in the deliverable.

## Build status

A full `npm install` / `next build` could not be completed in the execution environment because dependency installation timed out. Therefore this validation does **not** claim a successful production build or full type-check.

Before deploying, run locally or in CI:

```bash
npm install
npm run build
```

Then apply the Supabase migrations and configure the environment variables described in `.env.example` and `VERCEL_CHECKLIST.md`.

## Infrastructure note

The Labs module supports either:

1. a fixed connection endpoint configured by an administrator; or
2. a dynamic external lab provider through `LAB_PROVIDER_API_URL` and `LAB_PROVIDER_API_KEY`.

Dynamic VM/container provisioning requires an actual provider/adapter and credentials; the application cannot create infrastructure without them.
