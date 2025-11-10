import { Row, Col, Spinner, Alert, Card } from "react-bootstrap";
import Image from "../parts/Image";
import BidInput from "../components/BidInput";
import BidHistory from "../components/BidHistory";
import BackButton from "../components/BackButton";
import type { Customer } from "../interfaces/Customer"
import type { AuctionInfo } from "../components/AuctionInformation";
import { AuctionInformation } from "../components/AuctionInformation";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getRemainingTimeMessage } from "../utils/timeHelpers";
import { useAuth } from "../hooks/useAuth";
import { useFavorite } from "../hooks/useFavorite";
import AuthModal from "../modals/AuthModal";
import WinnerCard from "../parts/WinnerCard";


Auction.route = {
  path: "/auction/:id",
  index: 2,
  menulabel: "Auction Listing Page"
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
  startBid: number,
  imageUpload?: imageUpload,
  color: string,
  hasBeenPaid?: boolean
}

export type Bid = {
  customerId: number,
  amount: number,
  contentType: string,
  timeStamp: string
}

type imageUpload = {
  paths: string[],
  mediaTexts?: string[]
}

type time = {
  startTime: Date,
  endTime: Date,
}

export default function Auction() {

  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [bids, setBids] = useState<Bid[]>([])
  const [auctionInformation, setAuctionInformation] = useState<AuctionInfo | null>(null)
  const [img, setImg] = useState<imageUpload | null>(null)
  const [minimumBid, setMinimumBid] = useState(0)
  const [time, setTime] = useState<time | null>(null)
  const [hasBeenPaid, setHasBeenPaid] = useState<boolean | null>(null)

  const { user } = useAuth()
  const isFavoritedByUser = !!user?.likedAuctions?.some(a => a.id === id)
  const { isFavorited, showAuthModal, onFavorite, setShowAuthModal } = useFavorite(isFavoritedByUser)

  const onFavClick: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onFavorite()


  }

  async function refreshBid() {
    try {
      const response = await fetch(`/api/Auction/${id}`, { method: "GET" })
      const data: AuctionResponse = await response.json()
      setBids(data.items ?? [])

      if (data.items && data.items.length > 0) {
        setMinimumBid(Math.max(...data.items.map(bid => bid.amount)))
      }
    }
    catch (error) {
      console.log("error refreshing: ", error)
    }

  }

  function FindWinner(bids: Bid[]) {
    if (bids.length === 0)
      return null

    return bids.reduce((max, current) => current.amount > max.amount ? current : max)

  }

  async function PayTheMan() {

    const body = { hasBeenPaid: true }

    try {
      const response = await fetch(`/api/Auction/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
        headers:
          { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        console.log("Error when trying to pay")
      }
      else {
        setHasBeenPaid(true)
      }

    }
    catch (error) {
      console.log("Error caused by trying to pay the auction", error)
    }
  }

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/Auction/${id}`, { method: "GET" })
        const data: AuctionResponse = await response.json()
        setAuctionInformation({
          title: data.title,
          description: data.description,
          seller: data.seller[0],
          pickupEnabled: data.pickupEnabled,
          freightEnabled: data.freightEnabled,
          timeRemaining: getRemainingTimeMessage(new Date(data.endTime)),
          startBid: data.startBid,
          color: data.color
        })

        setTime(
          {
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime)
          }
        )

        setHasBeenPaid(data?.hasBeenPaid ?? null)


        setBids(data.items ?? [])
        setImg(data.imageUpload ?? null)
        if (data.items && data.items.length > 0) {
          setMinimumBid(Math.max(...data.items.map(bid => bid.amount)))
        } else {
          setMinimumBid(data.startBid)
        }
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

  const imagePath = img?.paths?.[0]
  const imageUrl = imagePath ? `/media/${imagePath}` : "/images/placeholder.jpg"
  const now = new Date()

  function getBidContent() {
    if (!time) {
      return null
    }
    if (now < time.startTime) {
      return <Alert variant="warning">This auction starts at {time.startTime.toDateString()}</Alert>
    }
    if (now >= time.startTime && now <= time.endTime) {
      const addStep = !!bids.length

      return <BidInput
        miniBid={minimumBid}
        auctionId={id ?? "invalid id"}
        onBidSuccess={refreshBid}
        addStep={addStep}
      />
    }
    console.log("inloggad: ", user?.id)
    if (!!user) {
      const winningBid = FindWinner(bids)

      if (!!auctionInformation?.seller && user.id === auctionInformation.seller.id) {
        if (winningBid === null) {
          return <Alert variant="info">
            The auction closed without any bids, better luck next time!
          </Alert>
        }
        else {

          return <Card>
            <Card.Title>Congratulations!</Card.Title>
            <Card.Text>A bid of {winningBid.amount} SEK won the auction.</Card.Text>
            <Card.Text>They have {hasBeenPaid ? '' : 'not'} paid</Card.Text>
          </Card>
        }
      }

      if (winningBid && winningBid.customerId === user.id) {
        return <WinnerCard amount={winningBid.amount} hasBeenPaid={hasBeenPaid ?? false} buttonPress={PayTheMan} />
      }
    }
    return <Alert variant="warning">This auction ended at {time.endTime.toDateString()}</Alert>
  }

  return (
    <>
      {isLoading && <Spinner animation="border" role="status" >
        <span className="visually-hidden"> Loading... </span>
      </Spinner>}
      {!isLoading &&
        <Row>
          <Col>
            <BackButton className="mb-3" fallbackTo="/auction" />
            <Image
              src={imageUrl}
              alt={img?.mediaTexts}
              className="auction-img"
              style={{
                objectPosition: "center",
                width: "100%"
              }}
            />

            <div className="justify">
              <span className='heart-hitbox float-end' role='button' onClick={onFavClick}>
                {/* bi-suit-heart must be at the end for the correct logo to be shown */}
                <i className={`fs-2 mx-2 bi bi-suit-heart${isFavorited ? '-fill' : ''}`}></i>
              </span>
              {auctionInformation &&
                <AuctionInformation info={auctionInformation} />
              }
            </div>
            <div>

              {getBidContent()}
            </div>

            {/* BidHistory is only visible after auction has started */}
            <div>
              {time && time.startTime < now ?
                (
                  < BidHistory bids={bids} />
                )
                : ""
              }
            </div>

          </Col>
        </Row>
      }
      {
        showAuthModal && (<AuthModal
          customTitle="Log in to favourite auctions"
          show={showAuthModal}
          onHide={() => setShowAuthModal(false)}
        ></AuthModal>)
      }

    </>
  );
}
