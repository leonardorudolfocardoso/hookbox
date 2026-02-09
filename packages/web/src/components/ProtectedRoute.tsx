import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authenticated, loading } = useAuth();

  if (loading) return null;
  if (!authenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
