import type { Bid } from "../interfaces/Bid";

type Props = {
  bids: Bid[];
};

export default function BidHistory({ bids }: Props) {
  if (!bids?.length) {
    return <p>No bids placed yet.</p>;
  }

  return;
}
