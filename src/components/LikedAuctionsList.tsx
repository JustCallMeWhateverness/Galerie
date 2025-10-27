import { Row, Col } from 'react-bootstrap';
import AuctionCard from '../parts/AuctionCard';
import type Auction from '../interfaces/Auction';

interface Props {
  auctions: Auction[];
}

export default function LikedAuctionsList({ auctions }: Props) {
  if (auctions.length === 0) return <p>You haven't liked any auctions yet.</p>;

  return (
    <Row>
      {auctions.map(auction => (
        <Col key={auction.id} xs={6} md={4}>
          <AuctionCard {...auction} />
        </Col>
      ))}
    </Row>
  );
}