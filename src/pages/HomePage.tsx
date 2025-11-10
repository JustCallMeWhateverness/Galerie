import { Row, Col } from "react-bootstrap";
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
  startBid: number;
  endTime: Date;
  startTime: Date;
  favorited?: boolean;
  favouritesCount?: number;
  imageUpload?: {
    paths: string[];
    mediaTexts?: string[];
  };
  items?: {
    amount: number;
  }[];
};

export default function HomePage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const now = new Date();
  const highestCurrentBids = getHighestCurrentBids(auctions);


  function getHighestCurrentBids(auctions: Auction[]) {
    return [...auctions]
      .filter(a => a.currentBid != null && a.endTime && new Date(a.endTime) > new Date())
      .sort((a, b) => (b.currentBid ?? 0) - (a.currentBid ?? 0))
      .slice(0, 5);
  }

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

        const mapped: Auction[] = (data ?? []).map((a) => {
          const highestBid = a.items && a.items.length > 0
            ? Math.max(...a.items.map(bid => bid.amount))
            : a.startBid ?? 0;

          return {
            id: a.id,
            title: a.title,
            currentBid: highestBid,
            startBid: a.startBid ?? 0,
            startTime: new Date(a.startTime),
            endTime: new Date(a.endTime),
            favorited: Boolean(a.favorited),
            favouritesCount: a.favouritesCount ?? 0,
            imageUpload: a.imageUpload,
          };
        });

        setAuctions(mapped);
      } catch (e: any) {
        if (e?.name !== "AbortError") setErr(e?.message ?? "Could not load");
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
  }, []);

  // Function to get random auctions for carousel
  function getRandomAuctions<T>(arr: T[], limit: number): T[] {
    return [...arr]
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  }

  const carouselLimit = 5;
  const upcomingAuctions = auctions.filter(a => a.startTime > now);
  const carouselAuctions = getRandomAuctions(upcomingAuctions, carouselLimit);


  return (
    <>
      <Row>
        <Col className="mb-2">
          <CarouselComponent
            items={carouselAuctions.map(a => ({
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

      <h4>New Auctions</h4>
      <Row xs={2} sm={2} md={3} lg={4} className="g-3 mb-4 flex-nowrap overflow-auto scroll">
        {[...auctions]
          .filter((auction) => {
            const days = 7;
            const isNew = Date.now() - auction.startTime.getTime() < days * 24 * 60 * 60 * 1000
              && Date.now() - auction.startTime.getTime() > 0;
            const isActive = auction.endTime.getTime() > Date.now();
            return isNew && isActive;
          })
          .sort(
            (a, b) =>
              new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
          )
          .slice(0, 5)
          .map((auction) => (
            <Col key={auction.id}>
              <AuctionCard
                id={auction.id}
                title={auction.title}
                currentBid={auction.currentBid}
                startBid={auction.startBid}
                favorited={auction.favorited ?? false}
                startTime={new Date(auction.startTime)}
                endTime={new Date(auction.endTime)}
                favouritesCount={auction.favouritesCount}
                imageUpload={auction.imageUpload}
              />
            </Col>
          ))}
      </Row>

      <h4>Ending soon</h4>
      <Row xs={2} sm={2} md={3} lg={4} className="g-3 mb-4 flex-nowrap overflow-auto scroll">
        {[...auctions]
          .filter(a => new Date(a.endTime) > now)
          .sort((a, b) => new Date(a.endTime).getTime() - new Date(b.endTime).getTime())
          .slice(0, 5)
          .map((auction) => (
            <Col key={auction.id}>
              <AuctionCard
                id={auction.id}
                title={auction.title}
                currentBid={auction.currentBid}
                startBid={auction.startBid}
                favorited={auction.favorited ?? false}
                startTime={new Date(auction.startTime)}
                endTime={new Date(auction.endTime)}
                favouritesCount={auction.favouritesCount}
                imageUpload={auction.imageUpload}
              />
            </Col>
          ))}
      </Row>

      <h4>Highest Current Bids</h4>
      <Row xs={2} sm={2} md={3} lg={4} className="g-3 mb-4 flex-nowrap overflow-auto scroll">
        {highestCurrentBids.map(auction => (
          <Col key={auction.id}>
            <AuctionCard {...auction} />
          </Col>
        ))}
      </Row>
    </>
  );
}
