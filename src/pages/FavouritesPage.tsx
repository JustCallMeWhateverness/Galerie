import { Row, Col } from 'react-bootstrap';
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from 'react';
import type Auction from '../interfaces/Auction';
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
  const [auctions, setAuctions] = useState<Auction[]>([]);

  useEffect(() => {
    async function fetchAuctions() {
      if (!user?.likedAuctions) return;
      const results = await Promise.all(
        user.likedAuctions.map(async (a) => {
          const res = await fetch(`/api/Auction/${a.id}`);
          const fullAuction = await res.json();
          const highestBid = fullAuction.items && fullAuction.items.length > 0
            ? Math.max(...fullAuction.items.map((bid: any) => bid.amount))
            : fullAuction.startBid ?? 0;
          return {
            id: fullAuction.id,
            title: fullAuction.title,
            currentBid: highestBid,
            startBid: fullAuction.startBid ?? 0,
            startTime: new Date(fullAuction.startTime),
            endTime: new Date(fullAuction.endTime),
            favorited: Boolean(fullAuction.favorited),
            favouritesCount: fullAuction.favouritesCount ?? 0,
            imageUpload: fullAuction.imageUpload,
          };
        })
      );
      setAuctions(results);
    }
    fetchAuctions();
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <AuthModal customTitle="Log in to view your favourites" />;

  return (
    <Row className="justify-content-center align-items-center">
      <Col>
        <h2>Your Favourites</h2>
        <LikedAuctionsSection likedAuctions={auctions} />
        <LikedArtistsSection likedArtists={user?.likedArtists ?? []} />
      </Col>
    </Row>
  );
}