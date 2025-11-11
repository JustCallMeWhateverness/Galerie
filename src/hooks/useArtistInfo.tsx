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
        const qs = new URLSearchParams({ where: `customer.id=${user!.id}` });
        const res = await fetch(`/api/expand/ArtistInfo?${qs.toString()}`, {
          credentials: "include",
        });

        if (!res.ok)
          throw new Error(`Failed to fetch ArtistInfo (HTTP ${res.status})`);
        const json = await res.json();

        const list = Array.isArray(json) ? json : json ? [json] : [];
        const mine = list[0] ?? null;

        if (mine) {
          const c = Array.isArray(mine.customer)
            ? mine.customer[0]
            : mine.customer;
          const firstName = c?.firstName ?? "";
          const lastName = c?.lastName ?? "";
          const username = c?.username ?? "";
          const customerName =
            firstName || lastName
              ? `${firstName}${firstName && lastName ? " " : ""}${lastName}`
              : username;

          setData({
            id: mine.id ?? "",
            title: mine.title ?? "",
            customer: customerName,
            description: mine.description ?? "",
            workTitle: mine.workTitle ?? "",
            profileImage: mine.profileImage,
          });
        } else {
          setData(null);
        }
      } catch (e: any) {
        console.error("Error fetching ArtistInfo:", e);
        setError(e.message ?? "Unknown error");
        setData(null);
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
  };
}
