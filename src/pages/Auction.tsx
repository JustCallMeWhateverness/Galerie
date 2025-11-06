import { Row, Col } from "react-bootstrap";
import Image from "../parts/Image";
import BidInput from "../components/BidInput";
import BidHistory from "../components/BidHistory";
import type { Bid } from "../interfaces/Bid";
import type { AuctionInfo } from "../components/AuctionInformation";
import { AuctionInformation } from "../components/AuctionInformation";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRemainingTimeMessage } from "../utils/timeHelpers";


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
  title: "...Loading",
  description: "...Loading",
  seller: "...Loading",
  pickupLocation: "...Loading",
  freightPrice: 0,
  freightEnabled: true,
  pickupEnabled: true,
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
        const data: AuctionData = await response.json()
        setAuctionData(data)
        setAuctionInformation({
          title: data.title,
          description: data.description,
          seller: data.seller[0].username,
          pickupEnabled: data.pickupEnabled,
          freightEnabled: data.freightEnabled,
          timeRemaining: getRemainingTimeMessage(new Date(data.endTime))
        })


      }
      catch (error) {
        console.log("Error: ", error)
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
          {/* Get Item information here 
          UPDATE WITH BETTER SAMPLE INFO (tydligare att det är laddningsdata)
          */}
          <AuctionInformation info={!auctionInformation ? sampleInfo : auctionInformation} />
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
