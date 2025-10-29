import { Row, Col } from 'react-bootstrap';
import LikedArtistsList from './LikedArtistsList';
import type Artist from '../interfaces/Artist';

interface Props {
  likedArtists: Artist[];
}

export default function LikedArtistsSection({ likedArtists }: Props) {
  return (
    <Row className="mt-4 text-center">
      <Col>
        <h4>Your Liked Artists</h4>
        <LikedArtistsList artists={likedArtists} />
      </Col>
    </Row>
  );
}