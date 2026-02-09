import { usersTable } from "./database";

export const userPool = new sst.aws.CognitoUserPool("UserPool", {
  usernames: ["email"],
  triggers: {
    postConfirmation: {
      handler: "packages/functions/src/post-confirmation.handler",
      link: [usersTable],
    },
  },
});

export const userPoolClient = userPool.addClient("UserPoolClient");
