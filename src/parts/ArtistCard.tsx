import { Card } from "react-bootstrap";
import { useFavorite } from "../hooks/useFavorite";
import { useAuth } from "../hooks/useAuth";
import type Artist from "../interfaces/Artist";
import AuthModal from "../modals/AuthModal";
import { Link } from "react-router-dom";

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
  description?: string;
  avatar?: string;
  href?: string;
};

export default function ArtistCard(props: Artist) {
  const { id, title, workTitle, href, profileImage } = props;
  const { user } = useAuth();
  const isFavoritedByUser = !!user?.likedArtists?.some((a) => a.id === id);
  const { isFavorited, showAuthModal, onFavorite, setShowAuthModal } =
    useFavorite(isFavoritedByUser, undefined, props);
  const to = href ?? `/artist-view/${id}`;
  const onFavClick: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite();
  };

  const imagePath = profileImage?.paths?.[0];
  const imageUrl = imagePath
    ? `/media/${imagePath}`
    : "/images/placeholder.jpg";

  return (
    <>
      <Card
        as={Link}
        to={to}
        className="mb-4 h-100 d-flex flex-column"
        style={{
          height: "320px",
          cursor: "pointer",
        }}
      >
        <div className="position-relative">
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
          <Card.ImgOverlay className="text-center">
            <span
              className="heart-hitbox float-end"
              role="button"
              onClick={onFavClick}
            >
              <i
                className={`bi bi-suit-heart${isFavorited ? "-fill" : ""}`}
              ></i>
            </span>
          </Card.ImgOverlay>
        </div>
        <Card.Body>
          <Card.Title className="text-center">{title}</Card.Title>
          <Card.Text className="text-center">{workTitle}</Card.Text>
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
