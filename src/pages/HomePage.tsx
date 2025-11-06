import { Row, Col, Container } from "react-bootstrap";
import CarouselComponent from "../parts/CarouselComponent";
import AuctionCard from "../parts/AuctionCard";
import { useEffect, useState } from "react";
import type Auction from "../interfaces/Auction";

HomePage.route = {
  path: "/",
};

type AuctionDTO = {
  id: string;
  title: string;
  currentBid: number;
  endTime: Date;
  startTime: Date;
  favorited?: boolean;
  favouritesCount?: number;
  imageUpload?: {
    paths: string[];
    mediaTexts?: string[];
  };
};

export default function HomePage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const now = new Date();

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch("/api/Auction", {
          signal: abort.signal,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: AuctionDTO[] = await res.json();

        const mapped: Auction[] = (data ?? []).map((a) => ({
          id: a.id,
          title: a.title,
          currentBid: Number(a.currentBid ?? 0),
          startTime: new Date(a.startTime),
          endTime: new Date(a.endTime),
          favorited: Boolean(a.favorited),
          favouritesCount: a.favouritesCount ?? 0,
          imageUpload: a.imageUpload,

        }));

        setAuctions(mapped);
      } catch (e: any) {
        if (e?.name !== "AbortError") setErr(e?.message ?? "Could not load");
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
  }, []);

  const upcomingAuctions = auctions.filter(a => a.startTime > now);


  return (
    <>
      <Row>
        <Col>
          <CarouselComponent
            items={upcomingAuctions.map(a => ({
              id: a.id,
              title: a.title,
              imageUpload: a.imageUpload,
              alt: a.imageUpload?.mediaTexts?.[0] || a.title,
              link: `/auction/${a.id}`,
              startTime: a.startTime,
              endTime: a.endTime,
            }))}
          />
        </Col>
      </Row>

      <h4>Popular Auctions</h4>
      <Container className="mb-4">
        <Row xs={2} sm={2} md={3} lg={4} className="g-3">
          {[...auctions]
            .filter((auction) => auction.favouritesCount >= 50)
            .sort((a, b) => b.favouritesCount - a.favouritesCount)
            .map((auction) => (
              <Col key={auction.id}>
                <AuctionCard
                  id={auction.id}
                  title={auction.title}
                  currentBid={auction.currentBid}
                  favorited={auction.favorited ?? false}
                  startTime={new Date(auction.startTime)}
                  endTime={new Date(auction.endTime)}
                  favouritesCount={auction.favouritesCount}
                  imageUpload={auction.imageUpload}

                />
              </Col>
            ))}
        </Row>
      </Container >

      <h4>Last Chance</h4>
      <Container className="mb-4">
        <Row xs={2} sm={2} md={3} lg={4} className="g-3">
          {[...auctions]
            .filter((auction) => auction.endTime.getTime() - Date.now() > 0 && auction.endTime.getTime() - Date.now()
              < 24 * 60 * 60 * 1000)
            .sort(
              (a, b) =>
                new Date(a.endTime).getTime() - new Date(b.endTime).getTime()
            )
            .map((auction) => (
              <Col key={auction.id}>
                <AuctionCard
                  id={auction.id}
                  title={auction.title}
                  currentBid={auction.currentBid}
                  favorited={auction.favorited ?? false}
                  startTime={new Date(auction.startTime)}
                  endTime={new Date(auction.endTime)}
                  favouritesCount={auction.favouritesCount}
                  imageUpload={auction.imageUpload}
                />
              </Col>
            ))}
        </Row>
      </Container>

      <h4>New Auctions</h4>
      <Container className="mb-4">
        <Row xs={2} sm={2} md={3} lg={4} className="g-3">
          {[...auctions]
            .filter((auction) => {
              const days = 7;
              return Date.now() - auction.startTime.getTime() < days * 24 * 60 * 60 * 1000
                && Date.now() - auction.startTime.getTime() > 0;
            })
            .sort(
              (a, b) =>
                new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
            )
            .map((auction) => (
              <Col key={auction.id}>
                <AuctionCard
                  id={auction.id}
                  title={auction.title}
                  currentBid={auction.currentBid}
                  favorited={auction.favorited ?? false}
                  startTime={new Date(auction.startTime)}
                  endTime={new Date(auction.endTime)}
                  favouritesCount={auction.favouritesCount}
                  imageUpload={auction.imageUpload}
                />
              </Col>
            ))}
        </Row>
      </Container>
    </>
  );
}
