import { userPool, userPoolClient } from "./auth";
import { api } from "./api";

export const web = new sst.aws.StaticSite("Web", {
  path: "packages/web",
  build: {
    command: "npm run build",
    output: "dist",
  },
  dev: {
    command: "npm run dev",
  },
  environment: {
    VITE_USER_POOL_ID: userPool.id,
    VITE_USER_POOL_CLIENT_ID: userPoolClient.id,
    VITE_API_URL: api.url,
  },
});
