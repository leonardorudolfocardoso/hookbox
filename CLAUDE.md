# Hookbox

Webhook inspection tool built with SST v3 (Ion) on AWS. Users sign up, create webhook endpoints, and view captured requests in a dashboard.

## Project Structure

```
sst.config.ts          # SST app entry point — all infra is imported here
infra/                 # Infrastructure definitions (not a workspace package)
  auth.ts              # Cognito UserPool + postConfirmation trigger
  database.ts          # DynamoDB tables (Users, Endpoints, Requests)
  api.ts               # API Gateway routes + JWT authorizer
  web.ts               # Static site (Vite React app)
packages/
  core/                # @hookbox/core — shared entity interfaces
  functions/           # @hookbox/functions — Lambda handlers
  web/                 # React + Vite + Chakra UI v3 frontend
```

## Commands

- `npm install` — install all workspace dependencies
- `npx sst dev` — start SST dev mode (live Lambda, linked resources)
- `npx sst deploy --stage <stage>` — deploy a stage
- `npx sst remove --stage <stage>` — tear down a stage
- `npx sst shell <cmd>` — run a command with linked resource access (e.g. `npx sst shell vitest`)
- `cd packages/web && npm run dev` — run frontend dev server (normally started by `sst dev`)

## Code Conventions

- ESM throughout (`"type": "module"` in every package.json)
- TypeScript with strict mode, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`
- Module system: `nodenext` module + moduleResolution
- Use `import type` for type-only imports (enforced by `verbatimModuleSyntax`)
- Workspace packages reference each other with `"*"` version (e.g. `"@hookbox/core": "*"`)
- `@hookbox/core` exports via subpath pattern — import as `@hookbox/core/foo` (maps to `src/foo/index.ts` or `src/foo.ts`)

## SST Patterns

- Infrastructure lives in `infra/`, imported dynamically in `sst.config.ts` via `await import("./infra/...")`
- Import order matters in `sst.config.ts`: database → auth → api → web (dependencies flow left to right)
- SST components (`sst.aws.*`) are globals provided by the `config.d.ts` reference — no import needed in infra files
- Use `link` to connect resources to functions; access at runtime via `import { Resource } from "sst"`
- Lambda handlers go in `packages/functions/src/`
- API Gateway JWT authorizers are bypassed in `sst dev` — Lambda handlers always decode the JWT from the Authorization header directly (`packages/functions/src/lib/auth.ts`)
- No CDK — SST v3 uses Pulumi/Terraform providers internally

## API Routes

| Method | Path | Auth | Handler | Description |
|--------|------|------|---------|-------------|
| GET | `/` | No | `api.ts` | Health check |
| POST | `/endpoints` | JWT | `create-endpoint.ts` | Create a new webhook endpoint |
| GET | `/endpoints` | JWT | `list-endpoints.ts` | List user's endpoints |
| DELETE | `/endpoints/{id}` | JWT | `delete-endpoint.ts` | Delete endpoint + cascade delete its requests |
| GET | `/endpoints/{id}/requests` | JWT | `list-requests.ts` | List requests for an endpoint |
| POST | `/webhook/{token}` | No | `receive-webhook.ts` | Public webhook receiver (saves incoming request) |

## Frontend

- React + Vite + Chakra UI v3 + react-router-dom
- Auth via `amazon-cognito-identity-js` (requires `define: { global: "globalThis" }` in vite.config.ts)
- Auth context (`lib/auth-context.tsx`) exposes `authenticated`, `loading`, `getToken()`, `signOut()`
- API client (`lib/api.ts`) wraps fetch with Bearer token from `getToken()`
- Pages: LoginPage, SignUpPage, HomePage (endpoint management), EndpointPage (request viewer)

## DynamoDB Tables

- **Users** — PK: `id`, GSI: `byEmail`
- **Endpoints** — PK: `id`, GSIs: `byUserId`, `byToken`
- **Requests** — PK: `id`, GSI: `byEndpointId`
