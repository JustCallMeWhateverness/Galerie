import { useAuth } from "../hooks/useAuth";
import AuthModal from "../modals/AuthModal";


ActiveBids.route = {
  path: "/active-bids",
};

export default function ActiveBids() {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading…</p>;

  if (!user) {
    return (
      <AuthModal
        customTitle="Log in to view your active bids"
        show={true}
        onHide={() => { }}
      />
    );
  }



  return (
    <h2>Active bids</h2>
  );
}