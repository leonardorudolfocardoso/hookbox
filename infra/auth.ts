export const userPool = new sst.aws.CognitoUserPool("UserPool", {
  usernames: ["email"],
});

export const userPoolClient = userPool.addClient("UserPoolClient");
