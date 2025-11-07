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
    return (
      <div className="container-fluid px-3 px-md-4 py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
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

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      <BackButton className="mb-3" fallbackTo="/user" />
      <h2>My Purchases</h2>
      <Alert className="mt-4 bg-primary text-dark">
        <i className="bi bi-exclamation-triangle"></i>&nbsp;
        This page is under construction.
      </Alert>
    </div>
  );
}
