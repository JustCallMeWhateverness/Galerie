import { useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import AuctionCard from "../parts/AuctionCard";
import type Auction from "../interfaces/Auction";
import type { ExtendedArtist } from "../parts/ArtistCard";
import BackButton from "../components/BackButton";
import { Row, Col } from "react-bootstrap";

ArtistView.route = {
  path: "/artist-view/:id",
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
  description?: string;
  favorited?: boolean;
  customer?: string | { id: string } | Array<{ id: string }>;
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
  startBid?: number;
  endTime: string;
  startTime: string;
  favorited?: boolean;

  seller?: Array<{ id: string; username?: string }>;
  customer?: Array<{ id: string; username?: string }>;

  imageUpload?: {
    paths?: string[];
    mediaTexts?: string[];
  };
};

export default function ArtistView() {
  const { id: artistInfoId } = useParams<{ id: string }>();
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
          description: dto.description,
          href: undefined,
          avatar,
          favorited: Boolean(dto.favorited),
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
              startBid: Number(a.startBid ?? 0),
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
          <h2>Could not find artist</h2>
        </div>
        {error && <div className="text-center text-muted mt-2">{error}</div>}
        <div className="text-center mt-3">
          <Button variant="primary" onClick={() => navigate("/")}>
            Go to first page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Row>
        <Col>
          <BackButton className="mb-3" />
        </Col>
      </Row>
      <Row className="px-2 px-md-3 px-lg-4">
        <Col className="bg-white rounded-3 p-2 p-md-3 p-lg-4">
          <Row className="g-3 align-items-start">
            <Col xs={5} sm={4} md={4} lg={3} className="d-flex">
              <div
                className="bg-light border rounded-3 overflow-hidden w-100"
                style={{
                  aspectRatio: "3 / 4",
                  flexShrink: 0,
                }}
              >
                {artist.avatar ? (
                  <img
                    src={artist.avatar}
                    alt={artist.title || "Artist"}
                    className="w-100 h-100"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <i className="bi bi-person-fill text-muted fs-1" />
                  </div>
                )}
              </div>
            </Col>

            <Col>
              <h4 className="fw-bold mb-2 text-dark">
                {artist.title || "Artist"}
              </h4>

              <div className="mb-2">
                <strong>Profession / Creative title:</strong>
                <div>{artist.workTitle || "—"}</div>
              </div>

              <div className="d-none d-sm-block mb-2">
                <strong>Description:</strong>
                <div className="text-break" style={{ whiteSpace: "pre-wrap" }}>
                  {artist.description || "No description yet."}
                </div>
              </div>
            </Col>

            {/* Description visible under the photo and titles on a xs screen */}
            <Col xs={12} className="d-block d-sm-none mt-2">
              <strong>Description:</strong>
              <div className="text-break" style={{ whiteSpace: "pre-wrap" }}>
                {artist.description || "No description yet."}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row className="px-2 px-md-3 px-lg-4 pb-4 pt-3">
        <Col className="bg-white rounded-3 p-2 p-md-3 p-lg-4">
          <h6 className="fw-bold text-dark mb-3">Active auctions</h6>
          {auctions.length === 0 ? (
            <div className="text-muted">
              This artist has no active auctions.
            </div>
          ) : (
            <Row xs={2} sm={3} lg={4} xxl={6} className="g-2 g-md-3 g-lg-4">
              {auctions.map((a) => (
                <Col key={a.id}>
                  <AuctionCard
                    id={a.id}
                    title={a.title}
                    currentBid={a.currentBid}
                    startBid={a.startBid}
                    startTime={a.startTime}
                    endTime={a.endTime}
                    favorited={a.favorited}
                    favouritesCount={a.favouritesCount}
                    imageUpload={a.imageUpload}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </>
  );
}
