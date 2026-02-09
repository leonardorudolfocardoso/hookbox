# Hookbox

SST v3 (Ion) monorepo on AWS.

## Project Structure

```
sst.config.ts          # SST app entry point — all infra is imported here
infra/                 # Infrastructure definitions (not a workspace package)
packages/
  core/                # @hookbox/core — shared business logic
  functions/           # @hookbox/functions — Lambda handlers
```

## Commands

- `npm install` — install all workspace dependencies
- `npx sst dev` — start SST dev mode (live Lambda, linked resources)
- `npx sst deploy --stage <stage>` — deploy a stage
- `npx sst remove --stage <stage>` — tear down a stage
- `npx sst shell <cmd>` — run a command with linked resource access (e.g. `npx sst shell vitest`)

## Code Conventions

- ESM throughout (`"type": "module"` in every package.json)
- TypeScript with strict mode, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`
- Module system: `nodenext` module + moduleResolution
- Use `import type` for type-only imports (enforced by `verbatimModuleSyntax`)
- Workspace packages reference each other with `"*"` version (e.g. `"@hookbox/core": "*"`)
- `@hookbox/core` exports via subpath pattern — import as `@hookbox/core/foo` (maps to `src/foo/index.ts` or `src/foo.ts`)

## SST Patterns

- Infrastructure lives in `infra/`, imported dynamically in `sst.config.ts` via `await import("./infra/...")`
- SST components (`sst.aws.*`) are globals provided by the `config.d.ts` reference — no import needed in infra files
- Use `link` to connect resources to functions; access at runtime via `import { Resource } from "sst"`
- Lambda handlers go in `packages/functions/src/`
- No CDK — SST v3 uses Pulumi/Terraform providers internally
