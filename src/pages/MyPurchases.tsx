import { Row, Col } from "react-bootstrap";
import { useAuth } from "../hooks/useAuth";
import AuthModal from "../modals/AuthModal";
import { Alert } from "react-bootstrap";
import BackButton from "../components/BackButton";

MyPurchases.route = {
  path: "/my-purchases",
};

export default function MyPurchases() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading…</p>;
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

  return (
    <Row className="justify-content-center align-items-center">
      <Col>
        <BackButton className="mb-3" fallbackTo="/user" />
        <h2>Your Sales</h2>
        <Alert className="mt-4 bg-primary text-dark">
          <i className="bi bi-exclamation-triangle"></i>&nbsp;
          This page is under construction.
        </Alert>


      </Col>
    </Row>
  );
}
