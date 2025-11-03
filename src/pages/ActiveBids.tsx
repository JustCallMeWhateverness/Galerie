import { Row, Col } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import AuthModal from "../modals/AuthModal";

ActiveBids.route = {
  path: "/active-bids",
};

export default function ActiveBids() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading…</p>;
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

  const activeBids = user.activeBids ?? [];

  if (activeBids.length === 0) {
    return (
      <Row className="mt-4">
        <Col>
          <h2>Active Bids</h2>
          <p>You have no active bids.</p>
        </Col>
      </Row>
    );
  }

  return (
    <Row className="mt-4">
      <Col>
        <h2>Active Bids</h2>
        <ul>
          {activeBids.map((bid) => (
            <li key={bid.id}>
              <strong>{bid.amount}</strong> SEK – placed{" "}
              {new Date(bid.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </Col>
    </Row>
  );
}

