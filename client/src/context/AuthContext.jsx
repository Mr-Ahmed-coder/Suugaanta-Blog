import React, { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../api/services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Verify active secure session on mount (handles persistent state on reload)
  useEffect(() => {
    async function checkAuthSession() {
      try {
        const response = await authService.getMe();
        setUser(response.data);
      } catch (error) {
        // Silently fail if no active HTTPOnly token exists (not logged in)
        setUser(null);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    }
    checkAuthSession();
  }, []);

  const loginUser = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      setUser(null);
      throw error?.response?.data?.message || "Login failed. Please check your credentials.";
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      setUser(null);
      throw error?.response?.data?.message || "Registration failed. Please try again.";
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authChecked,
        login: loginUser,
        register: registerUser,
        logout: logoutUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isEditor: ["admin", "editor"].includes(user?.role),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be consumed inside an AuthProvider.");
  }
  return context;
}
