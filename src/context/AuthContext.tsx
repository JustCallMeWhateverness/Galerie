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

function getLocalStorageArray<T>(key: string, userId?: number): T[] {
  try {
    const storageKey = userId ? `${key}_user_${userId}` : key;
    const data = localStorage.getItem(storageKey);
    if (!data) return [];
    const arr = JSON.parse(data);
    if (key === 'likedAuctions') {
      return arr.map((auction: any) => ({
        ...auction,
        endTime: auction.endTime ? new Date(auction.endTime) : auction.endTime,
        startTime: auction.startTime ? new Date(auction.startTime) : auction.startTime,
      }));
    }
    return arr;
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: any }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  function setUser(user: User | null) {
    if (user && user.id) {
      const likedAuctions = getLocalStorageArray<any>('likedAuctions', user.id);
      const likedArtists = getLocalStorageArray<any>('likedArtists', user.id);
      setUserState({
        ...user,
        likedAuctions,
        likedArtists,
      });
    } else {
      setUserState(user);
    }
  }

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/login", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok && !data.error) {
          const userId = data.id;
          const likedAuctions = getLocalStorageArray<any>('likedAuctions', userId);
          const likedArtists = getLocalStorageArray<any>('likedArtists', userId);
          setUser({
            ...data,
            likedAuctions,
            likedArtists,
          });
        }
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