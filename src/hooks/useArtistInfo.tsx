import { useEffect, useState } from "react";
import type InterfaceArtistInfo from "../interfaces/InterfaceArtistInfo";
import { useAuth } from "../hooks/useAuth";

export function useArtistInfo() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<InterfaceArtistInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    async function fetchMyArtistInfo() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/expand/ArtistInfo", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch ArtistInfo");
        const list = await res.json();

        const mine = Array.isArray(list)
          ? list.find(
              (it: any) =>
                Array.isArray(it.customer) &&
                it.customer.some((u: any) => u?.id === user.id)
            )
          : null;

        if (mine) {
          const c = Array.isArray(mine.customer) ? mine.customer[0] : null;

          const customerName =
            c?.firstName || c?.lastName
              ? `${c?.firstName ?? ""}${
                  c?.firstName && c?.lastName ? " " : ""
                }${c?.lastName ?? ""}`
              : c?.username ?? "";

          setData({
            id: mine.id ?? "",
            title: mine.title ?? "",
            customer: customerName,
            description: mine.description ?? "",
            workTitle: mine.workTitle ?? "",
          });
        } else {
          setData(null);
        }
      } catch (e: any) {
        console.error("Error fetching ArtistInfo:", e);
        setError(e.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchMyArtistInfo();
  }, [authLoading, user?.id]);

  return {
    data,
    loading,
    error,
    refetch: () => user?.id && fetchMyArtistInfo(),
  };
}
