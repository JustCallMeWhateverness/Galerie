import { Row, Col } from "react-bootstrap";
import Image from "../parts/Image";
import { useState } from "react";
import type Auction from "../interfaces/Auction";
import InputPlaceBid from "../components/InputPlaceBid";
import BidHistory from "../components/BidHistory";
import type { Bid } from "../interfaces/Bid";

AboutPage.route = {
  path: "/listing",
};

//Imported things and copied things directly from auktioncard. This will be changed in future.

const sampleAuction = {
  id: 1,
  title: "Scarf",
  currentBid: 33,
  endTime: new Date("2025-10-23T11:49:00"),
  favorited: false,
};

const sampleBids: Bid[] = [
  { id: "4", amount: 220, bidder: "Jonas", createdAt: "2025-10-23T16:45:00Z" },
  { id: "1", amount: 120, bidder: "Anna", createdAt: "2025-10-22T18:12:00Z" },
  { id: "2", amount: 95, bidder: "Jonas", createdAt: "2025-10-22T16:45:00Z" },
  { id: "3", amount: 80, createdAt: "2025-10-22T15:10:00Z" }, // anonymt
];

export default function AboutPage({
  id = sampleAuction.id,
  title = sampleAuction.title,
  currentBid = sampleAuction.currentBid,
  endTime = sampleAuction.endTime,
  favorited = sampleAuction.favorited,
}: Auction = sampleAuction) {
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
    <Row>
      <Col>
        <Image src="/images/products/3.jpg" alt="Here is a product" />

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
          <small className="text-muted">
            Time left: {remainingTimeMessage}
          </small>
        </div>

        <div>
          {/* Add bid here */}
          <InputPlaceBid />
        </div>

        <div>
          {/* Get Bidhistory here */}
          <BidHistory bids={sampleBids} />
        </div>

        <div
          className="btn btn-primary w-100 py-2"
          style={{ height: "auto" }}
          aria-hidden="true"
        >
          &nbsp;
        </div>

        <div>
          {/* Get Item information here */}
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Alias
            molestiae eligendi laudantium ipsam excepturi rerum eos nesciunt sit
            repellendus, officiis veritatis reprehenderit tempora expedita error
            tenetur facere, assumenda illo iure!
          </p>
        </div>

        <div
          className="btn btn-primary w-100 py-2"
          style={{ height: "auto" }}
          aria-hidden="true"
        >
          &nbsp;
        </div>

        <div>
          {/* questions and comments here, This might be a TODO and its okey */}
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi,
            exercitationem. Laboriosam, sequi? Accusantium odio exercitationem
            ipsam impedit laboriosam dolor non esse alias vel cumque ipsa magni
            iste quis, nemo expedita?
          </p>
        </div>
      </Col>
    </Row>
  );
}
