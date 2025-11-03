import { useEffect, useMemo, useState } from "react";
import { Row, Col, Spinner, Alert, ButtonGroup, Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import AuctionCard from "../parts/AuctionCard";
import ArtistCard from "../parts/ArtistCard";
import type Artist from "../interfaces/Artist";

type AuctionDTO = {
  id: number;
  title: string;
  category?: string;
  artistName?: string;
  currentBid: number;
  endTime: string;
  favorited?: boolean;
};

type Tab = "auctions" | "artists";

Search.route = {
  path: "/auctions",
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
  const tab = useQueryParam("tab", "auctions") as Tab;

  const [auctions, setAuctions] = useState<AuctionDTO[]>([]);
  const [artists, setArtists] = useState<Artist[]>([
    {
      id: 1,
      firstName: "Test",
      lastName: "Artist",
      profession: "Painter",
      rating: 4.5,
      favorited: false,
      // Add any other required Artist fields here
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abort = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (tab === "auctions") {
          const res = await fetch(`/api/auctions`, { signal: abort.signal });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data: AuctionDTO[] = await res.json();
          setAuctions(data ?? []);
        } else {
          const res = await fetch(`/api/artists`, { signal: abort.signal });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data: Artist[] = await res.json();
          setArtists(data ?? []);
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

  const auctionsFiltered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return auctions;
    return auctions.filter(a =>
      a.title?.toLowerCase().includes(s) ||
      a.category?.toLowerCase().includes(s) ||
      a.artistName?.toLowerCase().includes(s)
    );
  }, [auctions, q]);

  const artistsFiltered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return artists;
    return artists.filter(x =>
      x.firstName.toLowerCase().includes(s) ||
      x.lastName.toLowerCase().includes(s) ||
      (x.profession?.toLowerCase().includes(s) ?? false)
    );
  }, [artists, q]);

  function setTab(next: Tab) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("tab", next);
    navigate(`/auctions?${params.toString()}`);
  }

  const list = tab === "auctions" ? auctionsFiltered : artistsFiltered;

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
                variant={tab === "auctions" ? "secondary" : "primary"}
                onClick={() => setTab("auctions")}
              >
                Auctions
              </Button>
              <Button
                variant={tab === "artists" ? "secondary" : "primary"}
                onClick={() => setTab("artists")}
              >
                Artists
              </Button>
            </ButtonGroup>

            <Link
              to="/filter"
              className="text-black text-decoration-none me-2"
              aria-label="Open filters"
              title="Filters"
            >
              <i className="bi bi-filter fs-4"></i>
            </Link>
          </div>
        </Col>
      </Row>


      <Row className="mt-3">
        <Col md={8} lg={6} className="mx-auto">
          {loading && (
            <div className="d-flex align-items-center gap-2">
              <Spinner animation="border" size="sm" />
              <span>Loading {tab}…</span>
            </div>
          )}
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && !error && (
            <div className="d-flex justify-content-between align-items-center mb-1">
              <div className="fw-semibold">
                {q ? <>Results for “{q}” ({tab})</> : <>All {tab}</>}
              </div>
              <div className="text-muted small">{list.length} found</div>
            </div>
          )}
        </Col>
      </Row>

      <Row xs={2} sm={2} md={3} lg={4} xl={5} xxl={6} className="g-3">
        {tab === "auctions" &&
          auctionsFiltered.map((a) => (
            <Col key={a.id ?? `auction-${a.id}`}>
              <AuctionCard
                id={a.id}
                title={a.title}
                currentBid={a.currentBid}
                endTime={new Date(a.endTime)}
                favorited={a.favorited ?? false}
              />
            </Col>
          ))
        }
        {tab === "artists" &&
          artistsFiltered.map((s, i) => (
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
