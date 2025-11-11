import { useEffect, useState } from "react";
import { Row, Col, Spinner, Badge } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import { useCurrency } from "../hooks/useCurrency";
import AuthModal from "../modals/AuthModal";
import BackButton from "../components/BackButton";
import AuctionCard from "../parts/AuctionCard";

ActiveBids.route = {
  path: "/active-bids",
};

type BidDTO = {
  customerId: number;
  amount: number;
  contentType?: string;
  timeStamp: string;
};

type AuctionDTO = {
  id: string;
  title: string;
  currentBid: number;
  startBid: number;
  endTime: Date;
  startTime: Date;
  imageUpload?: {
    paths: string[];
    mediaTexts?: string[];
  };
  items?: BidDTO[];
};

export default function ActiveBids() {
  const { user, loading } = useAuth();
  const { formatCurrency } = useCurrency();
  const [auctions, setAuctions] = useState<AuctionDTO[]>([]);
  const [fetching, setFetching] = useState(true);


  useEffect(() => {
    if (!user) return;
    fetch("/api/Auction", { credentials: "include" })
      .then(res => res.json())
      .then((data: any[]) => {
        const mapped: AuctionDTO[] = (data ?? []).map(a => {
          const highestBid = a.items && a.items.length > 0
            ? Math.max(...a.items.map((bid: BidDTO) => bid.amount))
            : a.startBid ?? 0;
          return {
            id: a.id,
            title: a.title,
            currentBid: highestBid,
            startBid: a.startBid ?? 0,
            endTime: new Date(a.endTime),
            startTime: new Date(a.startTime),
            imageUpload: a.imageUpload,
            items: a.items ?? [],
          };
        });
        setAuctions(mapped);
      })
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || fetching) {
    return (
      <Row className="mt-4">
        <Col className="text-center">
          <Spinner animation="border" />
        </Col>
      </Row>
    );
  }

  if (!user) {
    return (
      <AuthModal
        customTitle="Log in to view your active bids"
        show={true}
        onHide={() => { }}
      />
    );
  }

  // Filter auctions where user has placed a bid
  const myActiveBids = auctions.filter(a =>
    a.items?.some(bid => bid.customerId === user.id)
  );

  if (myActiveBids.length === 0) {
    return (
      <Row className="mt-4">
        <Col>
          <BackButton className="mb-3" fallbackTo="/user" />
          <h2>Active Bids</h2>
          <p>You have no active bids.</p>
        </Col>
      </Row>
    );
  }

  return (
    <Row className="mt-4">
      <Col >
        <BackButton className="mb-3" fallbackTo="/user" />
        <h2>Active Bids</h2>

        <Row xs={1} xl={2} className="g-4 mt-2">
          {myActiveBids.map(auction => {
            const highestBid = auction.items?.reduce((max, bid) =>
              bid.amount > max.amount ? bid : max
            );
            const myBids = auction.items?.filter(bid => bid.customerId === user.id);
            const myLatestBid = myBids?.sort((a, b) =>
              new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime()
            )[0];
            const isHighest = highestBid?.customerId === user.id;
            const imagePath = auction.imageUpload?.paths?.[0];
            const imageUrl = imagePath ? `/media/${imagePath}` : "/images/placeholder.jpg";

            return (
              <Col key={auction.id} className="d-flex justify-content-center" >
                <table className="table table-borderless mb-0 w-auto">
                  <tbody>
                    <tr className="border">
                      <td colSpan={2}>
                        <a href={`/auction/${auction.id}`} className="fw-bold text-decoration-none text-dark d-flex align-items-center gap-3">
                          <img
                            src={imageUrl}
                            alt={auction.title}
                            style={{ width: 100, height: 100, objectFit: "cover", objectPosition: "center", borderRadius: 6 }}
                          />
                          {auction.title}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td>Status:</td>
                      <td>
                        {isHighest ? (
                          <Badge bg="success">You are highest bidder</Badge>
                        ) : (
                          <Badge bg="danger">Outbid</Badge>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Your last bid:</td>
                      <td>
                        <b>{formatCurrency(myLatestBid?.amount ?? 0)}</b>
                      </td>
                    </tr>
                    <tr>
                      <td>Highest bid:</td>
                      <td>
                        <b>{formatCurrency(highestBid?.amount ?? 0)}</b>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Col>
            );
          })}
        </Row>
      </Col>
    </Row>
  );
}