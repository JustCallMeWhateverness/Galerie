import { useEffect, useState } from "react";
import { Row, Col, Spinner, Badge } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import AuthModal from "../modals/AuthModal";
import BackButton from "../components/BackButton";
import { useCurrency } from "../hooks/useCurrency";

MySalesPage.route = {
  path: "/my-sales",
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
  seller?: Array<{ id: string; username?: string }>;
  items?: BidDTO[];
  hasBeenPaid?: boolean;
};

export default function MySalesPage() {
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
            seller: a.seller,
            items: a.items ?? [],
            hasBeenPaid: a.hasBeenPaid ?? false,
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
        customTitle="Log in to view your sales"
        show={true}
        onHide={() => { }}
      />
    );
  }


  const mySales = auctions.filter(a =>
    Array.isArray(a.seller) && a.seller.some(s => String(s.id) === String(user.id))
  );

  const now = new Date();

  const activeSales = mySales.filter(a => a.endTime > now);
  const finishedSales = mySales.filter(a => a.endTime <= now);

  return (
    <Row className="mt-4">
      <Col>
        <BackButton className="mb-3" fallbackTo="/user" />
        <h2>Your Sales</h2>

        <h5 className="mt-4 mb-3">Active Auctions</h5>
        {activeSales.length === 0 ? (
          <div className="text-muted mb-4">You have no active auctions.</div>
        ) : (
          <Row xs={1} xl={2} className="g-4 mt-2 ">
            {activeSales.map(auction => {
              const hasBids = auction.items && auction.items.length > 0;
              const highestBid = hasBids && auction.items
                ? auction.items.reduce((max, bid) => bid.amount > max.amount ? bid : max)
                : undefined;
              const imagePath = auction.imageUpload?.paths?.[0];
              const imageUrl = imagePath ? `/media/${imagePath}` : "/images/placeholder.jpg";

              return (
                <Col key={auction.id} className="d-flex justify-content-center">
                  <table className="table table-borderless mb-0 w-auto">
                    <tbody>
                      <tr className="border">
                        <td colSpan={2}>
                          <a
                            href={`/auction/${auction.id}`}
                            className="fw-bold text-decoration-none text-dark d-flex align-items-center gap-3"
                          >
                            <img
                              src={imageUrl}
                              alt={auction.title}
                              style={{
                                width: 100,
                                height: 100,
                                objectFit: "cover",
                                objectPosition: "center",
                                borderRadius: 6,
                              }}
                            />
                            {auction.title}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>Status:</td>
                        <td>
                          <Badge bg="info">Active</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td>Highest bid:</td>
                        <td>
                          <b>{formatCurrency(highestBid?.amount ?? auction.startBid ?? 0)}</b>
                        </td>
                      </tr>
                      <tr>
                        <td>Ends:</td>
                        <td>
                          {auction.endTime.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              );
            })}
          </Row>
        )}

        <h5 className="mt-5 mb-3">Finished Auctions</h5>
        {finishedSales.length === 0 ? (
          <div className="text-muted">You have no finished auctions.</div>
        ) : (
          <Row xs={1} xl={2} className="g-4 mt-2 ">
            {finishedSales.map(auction => {
              const hasBids = auction.items && auction.items.length > 0;
              const highestBid = hasBids && auction.items
                ? auction.items.reduce((max, bid) => bid.amount > max.amount ? bid : max)
                : undefined;
              const imagePath = auction.imageUpload?.paths?.[0];
              const imageUrl = imagePath ? `/media/${imagePath}` : "/images/placeholder.jpg";

              return (
                <Col key={auction.id} className="d-flex justify-content-center">
                  <table className="table table-borderless mb-0 w-auto">
                    <tbody>
                      <tr className="border">
                        <td colSpan={2}>
                          <a
                            href={`/auction/${auction.id}`}
                            className="fw-bold text-decoration-none text-dark d-flex align-items-center gap-3"
                          >
                            <img
                              src={imageUrl}
                              alt={auction.title}
                              style={{
                                width: 100,
                                height: 100,
                                objectFit: "cover",
                                objectPosition: "center",
                                borderRadius: 6,
                              }}
                            />
                            {auction.title}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td>Status:</td>
                        <td>
                          <Badge bg={hasBids ? "success" : "secondary"}>
                            {hasBids ? "Sold" : "Not sold"}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td>Payment:</td>
                        <td>
                          <Badge bg={auction.hasBeenPaid ? "success" : "warning"}>
                            {auction.hasBeenPaid ? "Paid" : "Not paid"}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td>Highest bid:</td>
                        <td>
                          <b>{formatCurrency(highestBid?.amount ?? auction.startBid ?? 0)}</b>
                        </td>
                      </tr>
                      <tr>
                        <td>Ended:</td>
                        <td>
                          {auction.endTime.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              );
            })}
          </Row>
        )}
      </Col>
    </Row>
  );
}