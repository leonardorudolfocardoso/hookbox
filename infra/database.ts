export const usersTable = new sst.aws.Dynamo("Users", {
  fields: {
    id: "string",
    email: "string",
  },
  primaryIndex: { hashKey: "id" },
  globalIndexes: {
    byEmail: { hashKey: "email" },
  },
});

export const endpointsTable = new sst.aws.Dynamo("Endpoints", {
  fields: {
    id: "string",
    userId: "string",
    token: "string",
  },
  primaryIndex: { hashKey: "id" },
  globalIndexes: {
    byUserId: { hashKey: "userId" },
    byToken: { hashKey: "token" },
  },
});

export const requestsTable = new sst.aws.Dynamo("Requests", {
  fields: {
    id: "string",
    endpointId: "string",
  },
  primaryIndex: { hashKey: "id" },
  globalIndexes: {
    byEndpointId: { hashKey: "endpointId" },
  },
});
