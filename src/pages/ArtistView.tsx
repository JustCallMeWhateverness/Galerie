import { useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import AuctionCard from "../parts/AuctionCard";
import type Auction from "../interfaces/Auction";
import type { ExtendedArtist } from "../parts/ArtistCard";
import BackButton from "../components/BackButton";
import ProfileCard from "../components/ProfileCard";

ArtistView.route = {
  path: "/artist-view/:id",
  index: 0,
};

function toMediaUrl(p?: string): string {
  if (!p) return "/images/placeholder.jpg";
  if (p.startsWith("http") || p.startsWith("/media/")) return p;
  return `/media/${p}`;
}

function isActive(startIso: string, endIso: string): boolean {
  const now = Date.now();
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return start <= now && end >= now;
}

type ArtistInfoDTO = {
  id: string;
  title?: string;
  workTitle?: string;
  username?: string;
  location?: string;
  email?: string;
  registrationDate?: string;
  favorited?: boolean;
  customer?: string | { id: string; } | Array<{ id: string; }>;
  userId?: string;
  ownerId?: string;

  profileImage?: {
    paths?: string[];
    mediaTexts?: string[];
  };
};

type AuctionDTO = {
  id: string;
  title: string;
  currentBid?: number;
  endTime: string;
  startTime: string;
  favorited?: boolean;
  favouritesCount?: number;
  seller?: Array<{ id: string; username?: string; }>;
  customer?: Array<{ id: string; username?: string; }>;

  imageUpload?: {
    paths?: string[];
    mediaTexts?: string[];
  };
};

export default function ArtistView() {
  const { id: artistInfoId } = useParams<{ id: string; }>();
  const navigate = useNavigate();

  const [artist, setArtist] = useState<ExtendedArtist | null>(null);
  const [artistUserId, setArtistUserId] = useState<string | null>(null);
  const [artistUsername, setArtistUsername] = useState<string | null>(null);

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loadingArtist, setLoadingArtist] = useState(true);
  const [loadingAuctions, setLoadingAuctions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artistInfoId) {
      setArtist(null);
      setLoadingArtist(false);
      setError("Saknar artist-id.");
      return;
    }

    const abort = new AbortController();

    (async () => {
      setLoadingArtist(true);
      setError(null);
      try {
        const res = await fetch(`/api/ArtistInfo/${artistInfoId}`, {
          signal: abort.signal,
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        if (!res.ok) {
          if (res.status === 404) {
            setArtist(null);
            return;
          }
          throw new Error(`ArtistInfo HTTP ${res.status}`);
        }
        const dto: ArtistInfoDTO = await res.json();

        const extractedUserId =
          (typeof dto.customer === "string" && dto.customer) ||
          ((dto.customer as any)?.id as string | undefined) ||
          (Array.isArray(dto.customer) && dto.customer[0]?.id) ||
          dto.userId ||
          dto.ownerId ||
          null;

        setArtistUserId(extractedUserId);

        const uname = dto.username || dto.title || null;
        setArtistUsername(uname);

        const rawPath = dto.profileImage?.paths?.[0];
        const avatar = toMediaUrl(rawPath);

        const mapped: ExtendedArtist = {
          id: dto.id,
          title: dto.title ?? dto.username ?? "Artist",
          workTitle: dto.workTitle ?? "",
          href: undefined,
          location: dto.location,
          email: dto.email,
          registrationDate: dto.registrationDate,
          avatar,
          favorited: Boolean(dto.favorited)
        };

        setArtist(mapped);
      } catch (e: unknown) {
        if ((e as any)?.name !== "AbortError") {
          setError((e as Error).message || "Could not get artist.");
          setArtist(null);
        }
      } finally {
        if (!abort.signal.aborted) setLoadingArtist(false);
      }
    })();

    return () => abort.abort();
  }, [artistInfoId]);

  useEffect(() => {
    if (!artistInfoId) {
      setAuctions([]);
      setLoadingAuctions(false);
      return;
    }
    if (artistUserId === null && artistUsername === null) {
      return;
    }

    const abort = new AbortController();

    (async () => {
      setLoadingAuctions(true);
      try {
        const res = await fetch(`/api/Auction`, {
          signal: abort.signal,
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Auction HTTP ${res.status}`);

        const data: AuctionDTO[] = await res.json();

        const lowerName = artistUsername?.toLowerCase();

        const mine = (data ?? []).filter((a) => {
          const bySeller =
            Array.isArray(a.seller) &&
            a.seller.some(
              (s) =>
                (artistUserId && s.id === artistUserId) ||
                (lowerName && s.username?.toLowerCase() === lowerName)
            );

          const byCustomer =
            Array.isArray(a.customer) &&
            a.customer.some(
              (c) =>
                (artistUserId && c.id === artistUserId) ||
                (lowerName && c.username?.toLowerCase() === lowerName)
            );

          return bySeller || byCustomer;
        });

        const activeMapped: Auction[] = mine
          .filter((a) => isActive(a.startTime, a.endTime))
          .map((a) => {
            const raw = a.imageUpload;
            const paths = Array.isArray(raw?.paths) ? raw!.paths : undefined;
            const mediaTexts = Array.isArray(raw?.mediaTexts)
              ? raw!.mediaTexts
              : undefined;
            const imageUpload =
              paths && paths.length ? { paths, mediaTexts } : undefined;

            return {
              id: a.id,
              title: a.title,
              currentBid: Number(a.currentBid ?? 0),
              startTime: new Date(a.startTime),
              endTime: new Date(a.endTime),
              favorited: Boolean(a.favorited),
              favouritesCount: 0,
              ...(imageUpload ? { imageUpload } : {}),
            };
          });

        setAuctions(activeMapped);
      } catch (e: unknown) {
        if ((e as any)?.name !== "AbortError") {
          setError((e as Error).message || "Could not get auctions.");
          setAuctions([]);
        }
      } finally {
        if (!abort.signal.aborted) setLoadingAuctions(false);
      }
    })();

    return () => abort.abort();
  }, [artistInfoId, artistUserId, artistUsername]);

  const isLoading = useMemo(
    () => loadingArtist || loadingAuctions,
    [loadingArtist, loadingAuctions]
  );

  // --- UI states ---
  if (isLoading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="container-fluid px-3 px-md-4 py-5">
        <div className="text-center">
          <h2>Could not found artist</h2>
        </div>
        {error && (
          <div className="text-center text-muted mt-2">{error}</div>
        )}
        <div className="text-center mt-3">
          <Button variant="primary" onClick={() => navigate("/")}>
            Gå till startsidan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      <div className="mx-auto mb-3 px-3 px-md-4" style={{ maxWidth: '980px' }}>
        <BackButton />
      </div>
      <ProfileCard
        avatar={artist.avatar}
        title={artist.title || artist.username || 'Artist'}
        fields={[
          { value: artist.workTitle },
          { value: artist.location },
          { value: artist.email },
        ]}
        dateInfo={{
          label: "Reg.",
          value: artist.registrationDate || null,
          position: "info",
        }}
        maxWidth="980px"
      />

      <div
        className="bg-white rounded-3 p-3 p-md-4 mb-4 mx-auto"
        style={{ maxWidth: "980px" }}
      >
        <h6 className="fw-bold text-dark mb-3">Active auctions</h6>
        {auctions.length === 0 ? (
          <div className="text-muted">
            This artisit has no active auctions.
          </div>
        ) : (
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
            {auctions.map((a) => (
              <div key={a.id} className="col">
                <AuctionCard
                  id={a.id}
                  title={a.title}
                  currentBid={a.currentBid}
                  startTime={a.startTime}
                  endTime={a.endTime}
                  favorited={a.favorited}
                  favouritesCount={a.favouritesCount}
                  imageUpload={a.imageUpload}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
