import { Row, Col } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import { useCurrency } from "../hooks/useCurrency";
import AuthModal from "../modals/AuthModal";
import BackButton from "../components/BackButton";

ActiveBids.route = {
  path: "/active-bids",
};

export default function ActiveBids() {
  const { user, loading } = useAuth();
  const { formatCurrency } = useCurrency();

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
          <BackButton className="mb-3" fallbackTo="/user" />
          <h2>Active Bids</h2>
          <p>You have no active bids.</p>
        </Col>
      </Row>
    );
  }

  return (
    <Row className="mt-4">
      <Col>
        <BackButton className="mb-3" fallbackTo="/user" />
        <h2>Active Bids</h2>
        <ul>
          {activeBids.map((bid) => (
            <li key={bid.id}>
              <strong>{formatCurrency(bid.amount)}</strong> – placed{" "}
              {new Date(bid.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </Col>
    </Row>
  );
}
