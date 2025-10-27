import { useState } from "react";
import { Card } from "react-bootstrap";

/**
 * Base Artist type - Used for simple artist displays across the application
 * 
 * Contains essential artist information for cards and lists
 * Used by ArtistCard component and other team components
 */
export type Artist = {
  id: number;
  firstName: string;
  lastName: string;
  rating?: number | null;
  profession?: string;
  favorited: boolean;
};

/**
 * Extended Artist type - Used for detailed artist profile pages
 * 
 * Extends the base Artist type with additional fields for detailed views
 * Contains contact information, registration details, and avatar
 * Specifically created for ArtistView page integration
 */
export type ExtendedArtist = Artist & {
  location?: string;           // Artist's location/address
  email?: string;             // Artist's contact email
  registrationDate?: string;   // When the artist joined the platform
  avatar?: string;            // Path to artist's profile image
};

export default function ArtistCard({ firstName, lastName, rating, profession, favorited }: Artist) {
  const [isFavorited, setFavorited] = useState(favorited);
  const ratingNum =
    typeof rating === "number" ? rating :
      rating == null ? null :
        Number(rating);

  function onFavorite() {
    setFavorited((isFavorited) => (!isFavorited));
  }
  return (
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
  );
}
