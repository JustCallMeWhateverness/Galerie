import { Row, Col } from 'react-bootstrap';
import LikedArtistsList from './LikedArtistsList';
import type AuctionCard from '../interfaces/Auction';

interface Props {
  likedArtists: AuctionCard[];
}

export default function LikedArtistsSection({ likedArtists }: Props) {
  return (
    <Row className="mt-4 text-center">
      <Col>
        <h4>Your Liked Artists</h4>
        <LikedArtistsList auctions={likedArtists} />
      </Col>
    </Row>
  );
}