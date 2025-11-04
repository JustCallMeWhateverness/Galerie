import { Row, Col } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import AuthModal from "../modals/AuthModal";
import { Alert } from "react-bootstrap";

MySalesPage.route = {
  path: "/my-sales",
};

export default function MySalesPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading…</p>;
  }

  if (!user) {
    return (
      <AuthModal
        customTitle="Log in to view your sales"
        show={true}
        onHide={() => {}}
      />
    );
  }

  return (
    <Row className="justify-content-center align-items-center">
      <Col>
        <h2>Your Sales</h2>
        <Alert className="mt-4 bg-primary text-dark">
          Sales history and listings are not available yet. This page will soon
          show your active and past auctions.
        </Alert>
      </Col>
    </Row>
  );
}
