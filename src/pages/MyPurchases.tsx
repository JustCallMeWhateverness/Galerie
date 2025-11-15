import { useEffect, useState } from "react";
import { Row, Col, Spinner, Badge } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import { useCurrency } from "../hooks/useCurrency";
import AuthModal from "../modals/AuthModal";
import BackButton from "../components/BackButton";

MyPurchases.route = {
  path: "/my-purchases",
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
  hasBeenPaid?: boolean;
};

export default function MyPurchases() {
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
        customTitle="Log in to view your purchases"
        show={true}
        onHide={() => { }}
      />
    );
  }


  const now = new Date();
  const myWonAuctions = auctions.filter(a => {
    if (a.endTime > now) return false;
    if (!a.items?.some(bid => bid.customerId === user.id)) return false;
    const highestBid = a.items.reduce((max, bid) =>
      bid.amount > max.amount ? bid : max
    );
    return highestBid?.customerId === user.id;
  });

  if (myWonAuctions.length === 0) {
    return (
      <Row className="mt-4">
        <Col>
          <BackButton className="mb-3" fallbackTo="/user" />
          <h2>My Purchases</h2>
          <p>You have not won any auctions yet.</p>
        </Col>
      </Row>
    );
  }

  return (
    <Row className="mt-4">
      <Col>
        <BackButton className="mb-3" fallbackTo="/user" />
        <h2>My Purchases</h2>
        <Row xs={1} xl={2} className="g-4 mt-2 ">
          {myWonAuctions.map(auction => {
            const highestBid = auction.items?.reduce((max, bid) =>
              bid.amount > max.amount ? bid : max
            );
            const myBids = auction.items?.filter(bid => bid.customerId === user.id);
            const myLatestBid = myBids?.sort((a, b) =>
              new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime()
            )[0];
            const imagePath = auction.imageUpload?.paths?.[0];
            const imageUrl = imagePath ? `/media/${imagePath}` : "/images/placeholder.jpg";

            return (
              <Col key={auction.id} className="d-flex justify-content-center">
                <table className="table table-borderless mb-0 w-auto text-center">
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
                        <Badge bg="success">You won</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td>Payment:</td>
                      <td>
                        {auction.hasBeenPaid ? (
                          <Badge bg="success">Paid</Badge>
                        ) : (
                          <Badge bg="warning">Not paid</Badge>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Your winning bid:</td>
                      <td>
                        <b>{formatCurrency(myLatestBid?.amount ?? 0)}</b>
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
