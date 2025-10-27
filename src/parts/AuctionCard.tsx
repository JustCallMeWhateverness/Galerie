import { useState } from 'react';
import { Card } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import type Auction from '../interfaces/Auction';
import AuthModal from '../modals/AuthModal';
import { getRemainingTimeMessage } from '../utils/timeHelpers';

export default function AuctionCard({ id, title, currentBid, endTime, favorited }: Auction) {

  const [isFavorited, setFavorited] = useState(favorited);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const remainingTimeMessage = getRemainingTimeMessage(endTime);

  function onFavorite() {
    if (!user) {
      setShowAuthModal(true);
    }
    else {
      setFavorited((isFavorited) => (!isFavorited));
    }
  }

  return (
    <>
      <Card className="mb-4">
        <Card.Img style={{ minHeight: '200px', objectFit: 'cover' }} />
        <Card.ImgOverlay className='text-center'>
          <span className='float-end' role='button' onClick={onFavorite}>
            {/* bi-suit-heart must be at the end for the correct logo to be shown */}
            <i className={`bi bi-suit-heart${isFavorited ? '-fill' : ''}`}></i>
          </span>
          <Card.Title className='text-center'>
            {title}
          </Card.Title>
          <Card.Text className='text-center'>
            Time left: {remainingTimeMessage}
          </Card.Text>
        </Card.ImgOverlay>
        <Card.Body>
          <Card.Text className='text-center'>
            Current bid: {currentBid} SEK
          </Card.Text>
        </Card.Body>
      </Card>
      {showAuthModal && (
        <AuthModal customTitle="Log in to view your favourites" />
      )}
    </>
  );
}
