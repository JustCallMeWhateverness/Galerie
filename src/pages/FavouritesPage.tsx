import { Row, Col, Button } from 'react-bootstrap';
import { useAuth } from "../hooks/useAuth";
import LikedAuctionsSection from '../components/LikedAuctionsSection';
import LikedArtistsSection from '../components/LikedArtistsSection';
import AuthModal from '../modals/AuthModal';


FavouritesPage.route = {
  path: "/favourites",
  menuLabel: "Favourites",
  index: 4,
};

export default function FavouritesPage() {

  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
      <AuthModal
        customTitle="Log in to view your favourites"
      />
    );
  }

  return <>
    <Row className="justify-content-center align-items-center">
      <Col>
        <h2>Your Favourites</h2>
        <LikedAuctionsSection likedAuctions={user?.likedAuctions ?? []} />
        <LikedArtistsSection likedArtists={user?.likedAuctions ?? []} />
      </Col>
    </Row>
  </>;
}