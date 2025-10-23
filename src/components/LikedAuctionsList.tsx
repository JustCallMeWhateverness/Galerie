import AuctionCard from '../parts/AuctionCard';
import type Auction from '../interfaces/Auction';

interface Props {
  auctions: Auction[];
}

export default function LikedAuctionsList({ auctions }: Props) {
  if (auctions.length === 0) return <p>You haven't liked any auctions yet.</p>;

  return (
    <div>
      {auctions.map(auction => (
        <div key={auction.id}>
          <AuctionCard {...auction} />
        </div>
      ))}
    </div>
  );
}