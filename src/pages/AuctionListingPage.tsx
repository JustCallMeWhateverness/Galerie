import { Row, Col } from "react-bootstrap";
import Image from "../parts/Image";
import InputPlaceBid from "../components/InputPlaceBid";
import BidHistory from "../components/BidHistory";
import type { Bid } from "../interfaces/Bid";
import type { Info } from "../components/GetInformation";
import { GetInformation } from "../components/GetInformation";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";


AuctionListingPage.route = {
  path: "/auction/:id",
  index: 2,
  menulabel: "Auction Listing Page"
};



// correct id for testing: 48hs8es0fgnn42ky7tqmk55yxf & 4ecvgth42ytqrrr7phwkyhw2mv


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

interface Customer {
  id: string,
  username: string
}

interface AuctionData {
  id: string,
  title: string,
  description: string,
  pickupEnabled: boolean,
  freightEnabled: boolean,
  startTime: string,
  endTime: string,
  seller: [Customer],
  category: string,
  items?: [{
    id: string,
    title: string | null,
    customer: [Customer],
    amount: number,
    contentType: string

  }]
}



export default function AuctionListingPage() {

  const { id } = useParams<{ id: string }>()

  const [auctionData, setAuctionData] = useState<AuctionData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [auctionInformation, setAuctionInformation] = useState()

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/Auction/${id}`, { method: "GET" })
        const data = await response.json()

        if (response.ok && !data.error) {
          console.log("Fetched auction data: ", data)
          setAuctionData(data)




        }
        else {
          console.log("error: ", data.error)
        }
      }
      finally {
        console.log("finished")
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])



  return (
    <Row>
      <Col>
        <Image src="/images/products/3.jpg" alt="Here is a product" />
        {/* <AuctionListingBidding auction={auctionData} /> */}

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
