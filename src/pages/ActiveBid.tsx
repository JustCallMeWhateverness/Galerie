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
        customTitle="Log in to view your active bids"
        show={true}
        onHide={() => { }}
      />
    );
  }

  const activeBids = user.activeBids ?? [];

  if (activeBids.length === 0) {
    return (
      <div className="container-fluid px-3 px-md-4 py-4">
        <BackButton className="mb-3" fallbackTo="/user" />
        <h2>Active Bids</h2>
        <p>You have no active bids.</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
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
    </div>
  );
}
