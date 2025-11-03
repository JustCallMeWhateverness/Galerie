import { Row, Col } from 'react-bootstrap';
import ArtistCard from '../parts/ArtistCard';
import type Artist from '../interfaces/Artist';

interface Props {
  artists: Artist[];
}

export default function LikedArtistsList({ artists }: Props) {
  if (artists.length === 0) return <p>You haven't liked any artists yet.</p>;

  return (
    <Row>
      {artists.map(artist => (
        <Col key={artist.id} xs={6} sm={4} md={3} lg={3} xl={2} xxl={2}>
          <ArtistCard {...artist} />
        </Col>
      ))}
    </Row>
  );
}