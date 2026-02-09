import { userPool, userPoolClient } from "./auth";

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

