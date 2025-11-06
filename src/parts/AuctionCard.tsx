import { Card } from 'react-bootstrap';
import { useFavorite } from '../hooks/useFavorite';
import { useAuth } from '../hooks/useAuth';
import { useCurrency } from '../hooks/useCurrency';
import type Auction from '../interfaces/Auction';
import { Link } from "react-router-dom";

import AuthModal from '../modals/AuthModal';
import { getRemainingTimeMessage } from '../utils/timeHelpers';

type Props = Auction & {
  href?: string;
};

export default function AuctionCard(props: Props) {

  const { id, title, currentBid, endTime, href } = props;
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const isFavoritedByUser = !!user?.likedAuctions?.some(a => a.id === id);
  const { isFavorited, showAuthModal, onFavorite, setShowAuthModal } = useFavorite(isFavoritedByUser, props);
  const remainingTimeMessage = getRemainingTimeMessage(endTime);
  const to = href ?? `/auction/${id}`;
  const onFavClick: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite();
  };

  return (
    <>
      <Card
        as={Link}
        to={to}
        className="mb-4"
        style={{ cursor: "pointer" }}>
        <Card.Img style={{ minHeight: '200px', objectFit: 'cover' }} />
        <Card.ImgOverlay className='text-center'>
          <span className='float-end' role='button' onClick={onFavClick}>
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
          <Card.Text className='text-center text-decoration-none'>
            Current bid: {formatCurrency(currentBid)}
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
