import { Row, Col } from "react-bootstrap";
import Image from "../parts/Image";
import BidInput from "../components/BidInput";
import BidHistory from "../components/BidHistory";
import type { Bid } from "../interfaces/Bid";
import type { AuctionInfo } from "../components/AuctionInformation";
import { AuctionInformation } from "../components/AuctionInformation";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";


AuctionListingPage.route = {
  path: "/auction/:id",
  index: 2,
  menulabel: "Auction Listing Page"
};



// correct id for testing: 48hs8es0fgnn42ky7tqmk55yxf & 4ecvgth42ytqrrr7phwkyhw2mv


const sampleBids: Bid[] = [
  { id: "4", amount: 220, bidder: "Jonas", createdAt: "2025-10-23T16:45:00Z" },
  { id: "1", amount: 120, bidder: "Anna", createdAt: "2025-10-22T18:12:00Z" },
  { id: "2", amount: 95, bidder: "Jonas", createdAt: "2025-10-22T16:45:00Z" },
  { id: "3", amount: 80, createdAt: "2025-10-22T15:10:00Z" }, // anonymt
];
const sampleInfo: AuctionInfo = {
  title: "Scarf",
  description: "A warm and cozy scarf perfect for winter days.",
  seller: "Claire Wilson",
  pickupLocation: "Stockholm",
  freightPrice: 500,
  freightEnabled: true,
  pickupEnabled: false,
  timeRemaining: "1 day"
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

  const [auctionInformation, setAuctionInformation] = useState<AuctionInfo | null>(null)




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

        <div>
          {/* Get Item information here */}
          <AuctionInformation info={sampleInfo} />
        </div>
        <div>
          <BidInput />
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

      </Col>
    </Row>
  );
}
