# Hookbox

Hookbox is a webhook inspection tool that lets you create unique endpoints, receive incoming webhook requests, and inspect their payloads in real time through a web dashboard.

Built with [SST v3 (Ion)](https://sst.dev) on AWS.

## How It Works

1. **Sign up** with your email and verify your account
2. **Create an endpoint** from the dashboard - each one gets a unique token
3. **Copy the webhook URL** and paste it into any service that sends webhooks (e.g. Stripe, GitHub, Slack)
4. **Inspect requests** - every POST to your endpoint is captured with headers and body, viewable in the dashboard

Webhook URL format:

```
https://<api-url>/webhook/<token>
```

## Tech Stack

- **Infrastructure**: SST v3 (Ion), AWS Lambda, API Gateway, DynamoDB, Cognito
- **Backend**: TypeScript, Node.js
- **Frontend**: React, Vite, Chakra UI v3, react-router-dom
- **Auth**: Amazon Cognito (email-based signup with verification code)

## Project Structure

```
sst.config.ts              # SST app entry point
infra/
  database.ts              # DynamoDB tables (Users, Endpoints, Requests)
  auth.ts                  # Cognito UserPool + postConfirmation trigger
  api.ts                   # API Gateway routes + JWT authorizer
  web.ts                   # Static site (Vite React app)
packages/
  core/                    # @hookbox/core - shared entity interfaces
  functions/               # @hookbox/functions - Lambda handlers
  web/                     # React + Vite + Chakra UI v3 frontend
```

## Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- [AWS CLI](https://aws.amazon.com/cli/) configured with credentials
- [SST CLI](https://sst.dev/docs/reference/cli/) (`npm install`)

## Getting Started

```bash
# Install dependencies
npm install

# Start dev mode (deploys infra to AWS, runs Lambda live, starts Vite dev server)
npx sst dev
```

The console will output the **API URL** and **Web URL**. Open the Web URL in your browser to access the dashboard.

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all workspace dependencies |
| `npx sst dev` | Start SST dev mode (live Lambda + frontend) |
| `npx sst deploy --stage <stage>` | Deploy to a specific stage |
| `npx sst remove --stage <stage>` | Tear down a stage |

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | No | Health check |
| `POST` | `/endpoints` | JWT | Create a new webhook endpoint |
| `GET` | `/endpoints` | JWT | List user's endpoints |
| `DELETE` | `/endpoints/{id}` | JWT | Delete endpoint and all its captured requests |
| `GET` | `/endpoints/{id}/requests` | JWT | List captured requests for an endpoint |
| `POST` | `/webhook/{token}` | No | Public webhook receiver |

## Testing a Webhook

After creating an endpoint, copy the webhook URL from the dashboard and send a test request:

```bash
curl -X POST https://<api-url>/webhook/<token> \
  -H "Content-Type: application/json" \
  -d '{"event": "test", "data": "hello"}'
```

Then refresh the endpoint's detail page to see the captured request.

## Architecture

```
External Service                    Dashboard
      |                                |
      | POST /webhook/{token}          | JWT-authenticated API calls
      v                                v
  API Gateway -----> Lambda -----> DynamoDB
                                   (Users, Endpoints, Requests)
                                       ^
                                       |
                                  Cognito (Auth)
```

- **Cognito** handles user registration and authentication. On signup confirmation, a Lambda trigger saves the user record to DynamoDB.
- **Endpoints** are created with a unique ID and token. The token is used in the public webhook URL.
- **Requests** are captured when external services POST to `/webhook/{token}`. Headers and body are stored.
- **Deleting an endpoint** cascade-deletes all its captured requests.

## Acknowledgements

This project was built with the assistance of [Claude Code](https://claude.ai/claude-code).
