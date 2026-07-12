import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../pages/Login.css";

export default function ProtectedRoute() {
  const { initializing, isAuthenticated } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="auth-screen">
        <div className="auth-shell auth-shell--compact">
          <p className="auth-eyebrow">AssetFlow</p>
          <h1>Checking session</h1>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
