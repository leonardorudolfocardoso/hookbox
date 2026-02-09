import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserAttribute,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";

const userPool = new CognitoUserPool({
  UserPoolId: import.meta.env.VITE_USER_POOL_ID,
  ClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID,
});

export interface SignUpParams {
  email: string;
  password: string;
}

export interface ConfirmParams {
  email: string;
  code: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export function signUp({ email, password }: SignUpParams): Promise<void> {
  const attributes = [
    new CognitoUserAttribute({ Name: "email", Value: email }),
  ];

  return new Promise((resolve, reject) => {
    userPool.signUp(email, password, attributes, [], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export function confirmSignUp({ email, code }: ConfirmParams): Promise<void> {
  const user = new CognitoUser({ Username: email, Pool: userPool });

  return new Promise((resolve, reject) => {
    user.confirmRegistration(code, true, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export function signIn({ email, password }: SignInParams): Promise<string> {
  const user = new CognitoUser({ Username: email, Pool: userPool });
  const authDetails = new AuthenticationDetails({
    Username: email,
    Password: password,
  });

  return new Promise((resolve, reject) => {
    user.authenticateUser(authDetails, {
      onSuccess(session) {
        resolve(session.getIdToken().getJwtToken());
      },
      onFailure(err) {
        reject(err);
      },
      newPasswordRequired() {
        reject(new Error("New password required. Please contact support."));
      },
    });
  });
}

export function getCurrentUser(): CognitoUser | null {
  return userPool.getCurrentUser();
}

export function signOut(): void {
  const user = userPool.getCurrentUser();
  if (user) user.signOut();
}
