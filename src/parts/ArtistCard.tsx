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
  const { id, title, workTitle } = props;
  const { user } = useAuth();
  const isFavoritedByUser = !!user?.likedArtists?.some(a => a.id === id);
  const { isFavorited, showAuthModal, onFavorite, setShowAuthModal } = useFavorite(isFavoritedByUser, undefined, props);

  return (
    <>
      <Card
        className="mb-4 h-100 d-flex flex-column"
        style={{
          height: "320px",
        }}
      >
        <div className="position-relative">
          <Card.Img
            style={{
              minHeight: "200px",
              objectFit: "cover",
              width: "100%",
            }}
          />
          <Card.ImgOverlay className='text-center'>
            <span className='float-end' role='button' onClick={onFavorite}>
              <i className={`bi bi-suit-heart${isFavorited ? '-fill' : ''}`}></i>
            </span>
          </Card.ImgOverlay>
        </div>
        <Card.Body>
          <Card.Title className='text-center'>
            {title}
          </Card.Title>
          <Card.Text className='text-center'>
            {workTitle}
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
