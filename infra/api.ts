import { userPool, userPoolClient } from "./auth";
import { endpointsTable } from "./database";

export const api = new sst.aws.ApiGatewayV2("Api");

const authorizer = api.addAuthorizer({
  name: "cognitoAuthorizer",
  jwt: {
    issuer: $interpolate`https://cognito-idp.${aws.getRegionOutput().name}.amazonaws.com/${userPool.id}`,
    audiences: [userPoolClient.id],
  },
});

// Public route — no auth
api.route("GET /", {
  handler: "packages/functions/src/api.handler",
});

// Create a new webhook endpoint — requires auth
api.route("POST /endpoints", {
  handler: "packages/functions/src/create-endpoint.handler",
  link: [endpointsTable],
  auth: {
    jwt: {
      authorizer: authorizer.id,
    },
  },
});

// List user's endpoints — requires auth
api.route("GET /endpoints", {
  handler: "packages/functions/src/list-endpoints.handler",
  link: [endpointsTable],
  auth: {
    jwt: {
      authorizer: authorizer.id,
    },
  },
});

// Delete an endpoint — requires auth
api.route("DELETE /endpoints/{id}", {
  handler: "packages/functions/src/delete-endpoint.handler",
  link: [endpointsTable],
  auth: {
    jwt: {
      authorizer: authorizer.id,
    },
  },
});

