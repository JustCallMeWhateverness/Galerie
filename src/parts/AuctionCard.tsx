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

  const { id, title, currentBid, endTime, href, imageUpload, startBid } = props;
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

  const imagePath = imageUpload?.paths?.[0];
  const imageUrl = imagePath ? `/media/${imagePath}` : "/images/placeholder.jpg";

  return (
    <>
      <Card
        as={Link}
        to={to}
        className=" h-100 d-flex flex-column"
        style={{
          height: "320px",
          cursor: "pointer"
        }}>
        <Card.Img
          src={imageUrl}
          alt={title}
          style={{
            minHeight: "200px",
            objectFit: "cover",
            objectPosition: "center",
            width: "100%",
          }}
        />
        <Card.ImgOverlay className='text-center'>
          <span className='heart-hitbox float-end' role='button' onClick={onFavClick}>
            {/* bi-suit-heart must be at the end for the correct logo to be shown */}
            <i className={`bi bi-suit-heart${isFavorited ? '-fill' : ''}`}></i>
          </span>
        </Card.ImgOverlay>
        <Card.Body className="d-flex flex-column justify-content-between py-2 px-1">
          <Card.Title className='text-center'>
            {title}
          </Card.Title>
          <Card.Text className='text-center'>
            Time left: {remainingTimeMessage}
          </Card.Text>
          <Card.Text className='text-center text-decoration-none'>
            {currentBid > startBid ? (
              <>Current bid: {formatCurrency(currentBid)}</>
            ) : (
              <>
                Start price: {formatCurrency(startBid)}
                <small className="text-muted d-block">No bids yet</small>
              </>
            )}
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
