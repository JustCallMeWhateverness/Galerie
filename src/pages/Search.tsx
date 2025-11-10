import { useEffect, useMemo, useState } from "react";
import { Row, Col, Spinner, Alert, ButtonGroup, Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import AuctionCard from "../parts/AuctionCard";
import ArtistCard from "../parts/ArtistCard";
import type Artist from "../interfaces/Artist";
import FilterModal from "../modals/FilterModal";

type AuctionDTO = {
  id: string;
  title: string;
  category?: string;
  artistName?: string;
  currentBid: number;
  startBid: number;
  endTime: string;
  startTime: string;
  favorited?: boolean;
  favoritesCount: number;
  imageUpload?: {
    paths: string[];
    mediaTexts?: string[];
  };
  items?: { amount: number }[];
};

type Tab = "auction" | "artist";

Search.route = {
  path: "/auction",
  menuLabel: "Search",
  index: 2,
};

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function useQueryParam(name: string, fallback = "") {
  const params = useQuery();
  return params.get(name) ?? fallback;
}

export default function Search() {
  const navigate = useNavigate();
  const q = useQueryParam("q", "");
  const tab = useQueryParam("tab", "auction") as Tab;

  const [auction, setAuction] = useState<AuctionDTO[]>([]);
  const [artist, setArtist] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showFilter, setShowFilter] = useState(false);
  function handleFilterApply(params: URLSearchParams) {
    navigate(`/auction?${params.toString()}`);
  }

  useEffect(() => {
    const abort = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (tab === "auction") {
          const res = await fetch(`/api/Auction`, { signal: abort.signal });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data: AuctionDTO[] = await res.json();
          const mapped: AuctionDTO[] = (data ?? []).map(a => {
            const highestBid = a.items && a.items.length > 0
              ? Math.max(...a.items.map(bid => bid.amount))
              : a.startBid ?? 0;
            return {
              ...a,
              currentBid: highestBid,
              startBid: a.startBid ?? 0,
            };
          });

          const now = new Date();
          const activeOnly = mapped.filter(a => {
            const start = new Date(a.startTime);
            const end = new Date(a.endTime);
            return start <= now && end >= now;
          });

          setAuction(activeOnly ?? []);
        } else {
          const res = await fetch(`/api/ArtistInfo`, { signal: abort.signal });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data: Artist[] = await res.json();
          setArtist(data ?? []);
        }
      } catch (e: unknown) {
        if ((e as any)?.name !== "AbortError") {
          setError(e instanceof Error ? e.message : "Could not load data");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => abort.abort();
  }, [tab]);

  const auctionFiltered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return auction;
    return auction.filter(a =>
      a.title?.toLowerCase().includes(s) ||
      a.category?.toLowerCase().includes(s) ||
      a.artistName?.toLowerCase().includes(s)
    );
  }, [auction, q]);

  const artistFiltered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return artist;
    return artist.filter(x =>
      x.title?.toLowerCase().includes(s) ||
      (x.workTitle?.toLowerCase().includes(s) ?? false)
    );
  }, [artist, q]);

  function setTab(next: Tab) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("tab", next);
    navigate(`/auction?${params.toString()}`);
  }

  const list = tab === "auction" ? auctionFiltered : artistFiltered;

  return (
    <>
      <Row>
        <Col md={12} className="mx-auto">
          <SearchBar initialQuery={q} placeholder={`Search ${tab}...`} />
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={12} className="mx-auto">
          <div className="d-flex align-items-center justify-content-between">
            <ButtonGroup aria-label="Result type">
              <Button
                variant={tab === "auction" ? "secondary" : "primary"}
                onClick={() => setTab("auction")}
              >
                Auctions
              </Button>
              <Button
                variant={tab === "artist" ? "secondary" : "primary"}
                onClick={() => setTab("artist")}
              >
                Artists
              </Button>
            </ButtonGroup>

            <Button variant="none" onClick={() => setShowFilter(true)}
            >
              <i className="bi bi-filter fs-4"></i>
            </Button>
          </div>
        </Col>
      </Row>


      <Row className="mt-3">
        <Col md={12} className="mx-auto">
          {loading && (
            <div className="d-flex align-items-center gap-2">
              <Spinner animation="border" size="sm" />
              <span>Loading {tab}…</span>
            </div>
          )}
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && !error && (
            <div className="d-flex justify-content-between mb-1">
              <div className="fw-semibold">
                {q ? <>Results for “{q}” ({tab})</> : <>All {tab}</>}
              </div>
              <div className="text-muted small">{list.length} found</div>
            </div>
          )}
        </Col>
      </Row>
      <FilterModal
        show={showFilter}
        onHide={() => setShowFilter(false)}
        onApply={handleFilterApply}
      />

      <Row xs={2} sm={2} md={3} lg={4} className="g-3">
        {tab === "auction" &&
          auctionFiltered.map((a) => (
            <Col key={a.id ?? `auction-${a.id}`}>
              <AuctionCard
                id={a.id}
                title={a.title}
                currentBid={a.currentBid}
                startBid={a.startBid}
                endTime={new Date(a.endTime)}
                favorited={a.favorited ?? false}
                startTime={new Date(a.startTime)}
                favouritesCount={a.favoritesCount}
                imageUpload={a.imageUpload}
              />
            </Col>
          ))
        }
        {tab === "artist" &&
          artistFiltered.map((s, i) => (
            <Col key={s.id ?? `artist-${i}`}>
              <ArtistCard {...s} />
            </Col>
          ))
        }
      </Row>

      {!loading && !error && list.length === 0 && (
        <Row className="mt-4">
          <Col md={8} lg={6} className="mx-auto">
            <Alert variant="light" className="border">
              {q ? "No results found." : `No ${tab} yet.`}
            </Alert>
          </Col>
        </Row>
      )}
    </>
  );
}
