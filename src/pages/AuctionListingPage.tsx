import { Row, Col } from "react-bootstrap";
import Image from "../parts/Image";
import InputPlaceBid from "../components/InputPlaceBid";
import BidHistory from "../components/BidHistory";
import BackButton from "../components/BackButton";
import type { Bid } from "../interfaces/Bid";
import type { Info } from "../components/GetInformation";
import { GetInformation } from "../components/GetInformation";
import AuctionListingBidding from "../components/AuctionListingBidding";

AuctionListingPage.route = {
  path: "/auction/:id",
  index: 2,
  menulabel: "Auction Listing Page",
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
const sampleInfo: Info = {
  title: "Scarf",
  size: "Large",
  description: "A warm and cozy scarf perfect for winter days.",
  artist: "Claire Wilson",
  pickupLocation: "Stockholm",
  freight: "500 SEK",
};

export default function AuctionListingPage() {
  return (
    <Row>
      <Col>
        <BackButton className="mb-3" />
        <Image src="/images/products/3.jpg" alt="Here is a product" />

        <AuctionListingBidding auction={sampleAuction} />

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
          <GetInformation info={sampleInfo} />
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
