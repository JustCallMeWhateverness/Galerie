import { useState } from "react";
import { Card } from "react-bootstrap";

export type Artist = {
  id: number;
  firstName: string;
  lastName: string;
  rating?: number | null;
  profession?: string;
  favorited: boolean;

};

export default function ArtistCard({ id, firstName, lastName, rating, profession, favorited }: Artist) {
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
