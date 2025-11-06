import { Row, Col, Spinner } from "react-bootstrap";
import Image from "../parts/Image";
import BidInput from "../components/BidInput";
import BidHistory from "../components/BidHistory";
import type { Customer } from "../interfaces/Customer"
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

// TODO: Add timestamp field to Bid in backend

const sampleInfo: AuctionInfo = {
  title: "Information missing",
  description: "Information missing",
  seller: "Information missing",
  pickupLocation: "Information missing",
  freightPrice: 0,
  freightEnabled: true,
  pickupEnabled: true,
  timeRemaining: "Information missing",
  startBid: 30
};



interface AuctionResponse {
  id: string,
  title: string,
  description: string,
  pickupEnabled: boolean,
  freightEnabled: boolean,
  startTime: string,
  endTime: string,
  seller: [Customer],
  category: string,
  items?: Bid[],
  startBid?: number
}

export type Bid = {
  customerId: string,
  amount: number,
  contentType: string,
  timestamp?: string
}

export default function AuctionListingPage() {

  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [bids, setBids] = useState<Bid[]>([])
  const [auctionInformation, setAuctionInformation] = useState<AuctionInfo | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/Auction/${id}`, { method: "GET" })
        const data: AuctionResponse = await response.json()
        setAuctionInformation({
          title: data.title,
          description: data.description,
          seller: data.seller[0].username,
          pickupEnabled: data.pickupEnabled,
          freightEnabled: data.freightEnabled,
          timeRemaining: getRemainingTimeMessage(new Date(data.endTime)),
          startBid: data.startBid
        })

        setBids(data.items ?? [])

      }
      catch (error) {
        console.log("Error: ", error)
      }
      finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])



  return (
    <>
      {isLoading && <Spinner animation="border" role="status">
        <span> Loading... </span>
      </Spinner>}
      {!isLoading &&
        <Row>
          <Col>
            <Image src="/images/products/3.jpg" alt="Here is a product" />

            <div>
              <AuctionInformation info={!auctionInformation ? sampleInfo : auctionInformation} />
            </div>
            <div>
              <BidInput />
            </div>

            <div>
              <BidHistory bids={bids} />
            </div>

          </Col>
        </Row>
      }

    </>
  );
}
