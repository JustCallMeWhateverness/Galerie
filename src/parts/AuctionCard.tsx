import { Card } from 'react-bootstrap';
import { useFavorite } from '../hooks/useFavorite';
import { useAuth } from '../hooks/useAuth';
import type Auction from '../interfaces/Auction';

import AuthModal from '../modals/AuthModal';
import { getRemainingTimeMessage } from '../utils/timeHelpers';

export default function AuctionCard(props: Auction) {

  const { id, title, currentBid, endTime } = props;
  const { user } = useAuth();
  const isFavoritedByUser = !!user?.likedAuctions?.some(a => a.id === id);
  const { isFavorited, showAuthModal, onFavorite, setShowAuthModal } = useFavorite(isFavoritedByUser, props);
  const remainingTimeMessage = getRemainingTimeMessage(endTime);

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
        <AuthModal
          customTitle="Log in to favourite auctions"
          show={showAuthModal}
          onHide={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}
