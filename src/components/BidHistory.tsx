

import { Col, ListGroup, Row } from "react-bootstrap";
import { useCurrency } from "../hooks/useCurrency";
import type { Bid } from "../pages/Auction";

type Props = {
  bids: Bid[];
};

export default function BidHistory({ bids }: Props) {
  const { formatCurrency } = useCurrency();
  if (!bids?.length) {
    return <p>No bids placed yet.</p>;
  }

  return (
    <Row className="gx-0">
      <Col xs={12} className="px-2">
        <h6 className="mt-2 mb-2 ms-2">Bid History</h6>
      </Col>

      {bids.map((b) => (
        b.contentType === "Bid" ?
          <Col xs={6} key={b.amount} className="px-2 mb-1">
            <ListGroup variant="flush">
              <ListGroup.Item className="small d-flex flex-column text-start">
                <div>
                  <strong>{formatCurrency(b.amount)}</strong>
                </div>
                <small className="text-muted">
                  {new Date(b.timeStamp).toLocaleString("sv-SE", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </ListGroup.Item>
            </ListGroup>
          </Col>
          : <p>invalid bid</p>
      ))}
    </Row>
  );
}
