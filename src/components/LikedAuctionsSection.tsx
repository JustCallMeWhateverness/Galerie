import { Row, Col } from 'react-bootstrap';
import LikedAuctionsList from './LikedAuctionsList';
import type Auction from '../interfaces/Auction';

interface Props {
  likedAuctions: Auction[];
}

export default function LikedAuctionsSection({ likedAuctions }: Props) {
  return (
    <Row className="mt-4 text-center">
      <Col>
        <h4>Your Liked Auctions</h4>
        <LikedAuctionsList auctions={likedAuctions} />
      </Col>
    </Row>
  );
}