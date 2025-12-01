import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthState {
  token: string | null;
  role: string | null;
  userId: string | null;
  roleId: string | null;
  title: string | null;
  name: string | null;
  profile: string | null;
  email: string | null;
  className: string | null;
  sectionName: string | null;
  schoolName: string | null;
  schoolLogo: string | null;
  contact: string | null;
}

interface AuthContextType {
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  auth: {
    token: null,
    role: null,
    userId: null,
    roleId: null,
    title: null,
    name: null,
    profile: null,
    email: null,
    className: null,
    sectionName: null,
    schoolName: null,
    schoolLogo: null,
    contact: null,
  },
  setAuth: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    name: null,
    role: null,
    userId: null,
    roleId: null,
    title: null,
    profile: null,
    email: null,
    className: null,
    sectionName: null,
    schoolName: null,
    schoolLogo: null,
    contact: null,
  });

  const logout = async () => {
    await AsyncStorage.multiRemove([
      "accessToken",
      "role",
      "userId",
      "roleId",
      "title",
      "name",
      "profile",
      "schoolLogo",
      "contact",
    ]);

    setAuth({
      ...auth,
      token: null,
      name: null,
      role: null,
      title: null,
      profile: null,
      email: null,
      className: null,
      sectionName: null,
      schoolName: null,
      schoolLogo: null,
      contact: null,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
