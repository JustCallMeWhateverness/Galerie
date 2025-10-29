import { Card } from "react-bootstrap";
import { useFavorite } from "../hooks/useFavorite";
import { useAuth } from "../hooks/useAuth";
import type Artist from "../interfaces/Artist";
import AuthModal from "../modals/AuthModal";

/**
 * Extended Artist type - Used for detailed artist profile pages
 * 
 * Extends the base Artist type with additional fields for detailed views
 * Contains contact information, registration details, and avatar
 * Specifically created for ArtistView page integration
 */
export type ExtendedArtist = Artist & {
  location?: string;
  email?: string;
  registrationDate?: string;
  avatar?: string;
};

export default function ArtistCard(props: Artist) {
  const { id, firstName, lastName, profession } = props;
  const { user } = useAuth();
  const isFavoritedByUser = !!user?.likedArtists?.some(a => a.id === id);
  const { isFavorited, showAuthModal, onFavorite, setShowAuthModal } = useFavorite(isFavoritedByUser, undefined, props);

  const ratingNum =
    typeof props.rating === "number" ? props.rating :
      props.rating == null ? null :
        Number(props.rating);


  return (
    <>
      <Card className="mb-4">
        <Card.Img style={{ minHeight: '200px', objectFit: 'cover' }} />
        <Card.ImgOverlay className='text-center'>
          <span className='float-end' role='button' onClick={onFavorite}>
            <i className={`bi bi-suit-heart${isFavorited ? '-fill' : ''}`}></i>
          </span>
        </Card.ImgOverlay>
        <Card.Body>
          <Card.Title className='text-center'>
            {firstName} {lastName}
          </Card.Title>
          <Card.Text className='text-center'>
            {profession}
          </Card.Text>
          <Card.Text className='text-center'>
            Rating: {ratingNum == null ? "–" : ratingNum.toFixed(1) + "/5"}
          </Card.Text>
        </Card.Body>
      </Card>
      {showAuthModal && (
        <AuthModal
          customTitle="Log in to favourite artists"
          show={showAuthModal}
          onHide={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}
