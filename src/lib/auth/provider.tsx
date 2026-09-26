import { createContext, useContext, type ReactNode } from "react";

const AuthContext = createContext({ user: null as null | { id: string; email: string } });

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={{ user: null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}