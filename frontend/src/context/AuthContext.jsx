import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getMeApi, loginUserApi, registerUserApi } from "../api/authApi";
import {
  clearAuthData,
  getToken,
  getUser,
  saveAuthData,
} from "../utils/authStorage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser());
  const [token, setToken] = useState(getToken());
  const [authLoading, setAuthLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const isAuthenticated = Boolean(token && user);

  const register = async (formData) => {
    try {
      setAuthLoading(true);

      const data = await registerUserApi(formData);

      saveAuthData({
        token: data.token,
        user: data.user,
      });

      setToken(data.token);
      setUser(data.user);

      toast.success("Account created successfully");

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create account";

      toast.error(message);

      return { success: false };
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (formData) => {
    try {
      setAuthLoading(true);

      const data = await loginUserApi(formData);

      saveAuthData({
        token: data.token,
        user: data.user,
      });

      setToken(data.token);
      setUser(data.user);

      toast.success("Logged in successfully");

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to login";

      toast.error(message);

      return { success: false };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentToken = getToken();

        if (!currentToken) {
          setInitialLoading(false);
          return;
        }

        const data = await getMeApi();

        setUser(data.user);
        setToken(currentToken);

        saveAuthData({
          token: currentToken,
          user: data.user,
        });
      } catch {
        clearAuthData();
        setToken(null);
        setUser(null);
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      authLoading,
      initialLoading,
      isAuthenticated,
      register,
      login,
      logout,
    }),
    [user, token, authLoading, initialLoading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};