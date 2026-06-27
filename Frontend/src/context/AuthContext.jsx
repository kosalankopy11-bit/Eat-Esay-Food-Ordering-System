import { createContext, useContext, useMemo, useState } from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post("/login", { email, password });
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    await api.post("/register", payload);
    return login(payload.email, payload.password);
  };

  const refreshProfile = async () => {
    const { data } = await api.get("/profile");
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const uploadProfileImage = async ({ file, imageUrl }) => {
    let data;
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      ({ data } = await api.post("/profile/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }));
    } else if (imageUrl) {
      ({ data } = await api.post("/profile/image", { image_url: imageUrl }));
    } else {
      throw new Error("Either a file or image URL is required");
    }
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, login, register, logout, refreshProfile, uploadProfileImage }),
    [user],
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
