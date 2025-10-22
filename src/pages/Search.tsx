// src/pages/Search.tsx
import { useEffect, useMemo, useState } from "react";
import { Row, Col, Spinner, Alert } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import AuctionCard from "../components/AuctionCard";

type Auction = {
  id: string;
  title: string;
  category: string;
  sellerName: string;
};

Search.route = {
  path: "/search",
  menuLabel: "Search",
  index: 1,
};

function useQueryParam(name: string) {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search).get(name) ?? "", [search, name]);
}

export default function Search() {
  const q = useQueryParam("q");
  const [items, setItems] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abort = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const url = q
          ? `/api/auctions?limit=60&q=${encodeURIComponent(q)}`
          : `/api/auctions?limit=60`;
        const res = await fetch(url, { signal: abort.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Auction[] = await res.json();
        setItems(data);
      } catch (e: unknown) {
        if ((e as any)?.name !== "AbortError") {
          setError(e instanceof Error ? e.message : "Något gick fel");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => abort.abort();
  }, [q]);

  return (
    <>
      <Row className="mt-3">
        <Col md={8} lg={6} className="mx-auto">
          <SearchBar initialQuery={q} placeholder="Search auctions..." />
        </Col>
      </Row>

      <Row className="mt-3">
        <Col md={8} lg={6} className="mx-auto">
          {loading && (
            <div className="d-flex align-items-center gap-2">
              <Spinner animation="border" size="sm" />
              <span>Laddar auktioner…</span>
            </div>
          )}

          {error && <Alert variant="danger">Kunde inte hämta auktioner: {error}</Alert>}

          {!loading && !error && (
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="fw-semibold">
                {q ? <>Träffar för “{q}”</> : "Alla auktioner"}
              </div>
              <div className="text-muted small">{items.length} st</div>
            </div>
          )}
        </Col>
      </Row>

      <Row xs={1} sm={2} md={3} className="g-3">
        {items.map((a) => (
          <Col key={a.id}>
            <AuctionCard auction={a} />
          </Col>
        ))}
      </Row>

      {!loading && !error && items.length === 0 && (
        <Row className="mt-4">
          <Col md={8} lg={6} className="mx-auto">
            <Alert variant="light" className="border">
              Inga auktioner matchade sökningen.
            </Alert>
          </Col>
        </Row>
      )}
    </>
  );
}
