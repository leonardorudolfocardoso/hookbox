import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type { CognitoUserSession } from "amazon-cognito-identity-js";
import { getCurrentUser, signOut as cognitoSignOut } from "./cognito";

interface AuthState {
  authenticated: boolean;
  loading: boolean;
  getToken: () => Promise<string>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState>({
  authenticated: false,
  loading: true,
  getToken: () => Promise.reject(new Error("Not authenticated")),
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      setLoading(false);
      return;
    }

    user.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (!err && session?.isValid()) {
        setAuthenticated(true);
      }
      setLoading(false);
    });
  }, []);

  const getToken = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      const user = getCurrentUser();
      if (!user) return reject(new Error("Not authenticated"));

      user.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) return reject(err ?? new Error("No session"));
        resolve(session.getIdToken().getJwtToken());
      });
    });
  }, []);

  const signOut = useCallback(() => {
    cognitoSignOut();
    setAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, loading, getToken, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
