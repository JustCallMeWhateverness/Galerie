import { createContext, useState, useEffect } from "react";
import type User from "../interfaces/User";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  setUser: () => { }
});

export function AuthProvider({ children }: { children: any }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/login", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (response.ok && !data.error) {
          console.log("Fetched user:", data);
          setUser(data);
        }
      } catch (error) {
        console.log("Could not fetch user (backend may not be running):", error);
        // Continue without user - this is okay for viewing the page
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};