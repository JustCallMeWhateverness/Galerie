import { useState } from "react";

export type Auction = {
  id: number;
  title: string;
  currentBid: number;
  endTime: Date;
  favorited: boolean;
};

export default function AuctionListingBidding({
  auction,
}: {
  auction: Auction;
}) {
  const { id, title, currentBid, endTime, favorited } = auction;

  const [isFavorited, setFavorited] = useState(favorited);
  const currentTime = new Date();
  let remainingTimeMessage = "";
  // Time Difference in Milliseconds
  const timeDifferenceMilli: number = endTime.getTime() - currentTime.getTime();

  if (timeDifferenceMilli < 0) {
    remainingTimeMessage = "Auction has finished";
  } else {
    const remainingSeconds = Math.floor(timeDifferenceMilli / 1000);
    const remainingMinutes = Math.floor(remainingSeconds / 60);
    const remainingHours = Math.floor(remainingMinutes / 60);
    const remainingDays = Math.floor(remainingHours / 24);

    // Only display the largest time unit remaining
    if (remainingDays > 0) {
      remainingTimeMessage = `${remainingDays} days`;
    } else if (remainingHours > 0) {
      remainingTimeMessage = `${remainingHours} hours`;
    } else if (remainingMinutes > 0) {
      remainingTimeMessage = `${remainingMinutes} minutes`;
    } else remainingTimeMessage = `${remainingSeconds} seconds`;
  }

  function onFavorite() {
    setFavorited((isFavorited) => !isFavorited);
  }
  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="mb-0">{title}</h2>
        <span role="button" onClick={onFavorite} className="me-3">
          <i
            className={`bi bi-suit-heart${isFavorited ? "-fill" : ""} fs-1`}
          ></i>
        </span>
      </div>

      <div>
        {/*Current bid. start bid, timeleft.  */}
        <p className="mb-1">Start Bid: </p> {/*  */}
        <p>Current bid: {currentBid} SEK</p>
        <small className="text-muted">Time left: {remainingTimeMessage}</small>
      </div>
    </>
  );
}
