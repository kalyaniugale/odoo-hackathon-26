import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getProfile,
  login as loginRequest,
  signup as signupRequest,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("assetflow_token")
  );
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("assetflow_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [initializing, setInitializing] = useState(Boolean(token));

  useEffect(() => {
    let isActive = true;

    const hydrateSession = async () => {
      if (!token) {
        setInitializing(false);
        return;
      }

      try {
        const data = await getProfile();

        if (!isActive) return;

        setUser(data.user);
        localStorage.setItem("assetflow_user", JSON.stringify(data.user));
      } catch {
        if (!isActive) return;

        localStorage.removeItem("assetflow_token");
        localStorage.removeItem("assetflow_user");
        setToken(null);
        setUser(null);
      } finally {
        if (isActive) {
          setInitializing(false);
        }
      }
    };

    hydrateSession();

    return () => {
      isActive = false;
    };
  }, [token]);

  const saveSession = (data) => {
    localStorage.setItem("assetflow_token", data.token);
    localStorage.setItem("assetflow_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (payload) => {
    const data = await loginRequest(payload);
    saveSession(data);
    return data;
  };

  const signup = async (payload) => {
    const data = await signupRequest(payload);
    saveSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("assetflow_token");
    localStorage.removeItem("assetflow_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      initializing,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      logout,
    }),
    [token, user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
