import { Row, Col } from 'react-bootstrap';
import { useAuth } from "../hooks/useAuth";
import LikedAuctionsSection from '../components/LikedAuctionsSection';
import LikedArtistsSection from '../components/LikedArtistsSection';

FavouritesPage.route = {
  path: "/favourites",
  menuLabel: "Favourites",
  index: 4,
};

export default function FavouritesPage() {

  const { user } = useAuth();

  return <>
    <Row>
      <Col>
        <h2>Your Favourites</h2>
        <LikedAuctionsSection likedAuctions={user?.likedAuctions ?? []} />
        <LikedArtistsSection likedArtists={user?.likedAuctions ?? []} />
      </Col>
    </Row>
  </>;
}