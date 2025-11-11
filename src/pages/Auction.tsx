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
import type { default as AuctionData } from "../interfaces/Auction";
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
  favorited?: boolean,
  favouritesCount?: number
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
  const [auction, setAuction] = useState<AuctionData | undefined>(undefined)
  const [time, setTime] = useState<time | null>(null)
  const [hasBeenPaid, setHasBeenPaid] = useState<boolean | null>(null)

  const { user } = useAuth()
  const isFavoritedByUser = !!user?.likedAuctions?.some(a => a.id === id)
  const { isFavorited, showAuthModal, onFavorite, setShowAuthModal } = useFavorite(isFavoritedByUser, auction)

  const onFavClick: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onFavorite()
  }

  async function refreshBid() {
    try {
      const response = await fetch(`/api/Auction/${id}`, { method: "GET" })
      if (!response.ok) {
        console.error(`Failed to refresh bids: ${response.status} ${response.statusText}`)
        return
      }
      const data: AuctionResponse = await response.json()
      setBids(data.items ?? [])

      if (data.items && data.items.length > 0) {
        const maxBid = Math.max(...data.items.map(bid => bid.amount))
        setMinimumBid(maxBid)

        setAuction(prevAuction => {
          if (prevAuction) {
            return { ...prevAuction, currentBid: maxBid }
          }
          return prevAuction
        })
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
        if (!response.ok) {
          console.error(`Failed to fetch auction: ${response.status} ${response.statusText}`)
          return
        }
        const data: AuctionResponse = await response.json()
        setAuctionInformation({
          title: data.title,
          description: data.description,
          seller: data.seller && data.seller.length > 0 ? data.seller[0] : { username: "Unknown" } as Customer,
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

        const currentBid = data.items && data.items.length > 0
          ? Math.max(...data.items.map(bid => bid.amount))
          : data.startBid

        if (data.items && data.items.length > 0) {
          setMinimumBid(Math.max(...data.items.map(bid => bid.amount)))
        } else {
          setMinimumBid(data.startBid)
        }

        const auctionData: AuctionData = {
          id: data.id,
          title: data.title,
          currentBid: currentBid,
          startBid: data.startBid,
          endTime: new Date(data.endTime),
          startTime: new Date(data.startTime),
          favorited: data.favorited ?? false,
          favouritesCount: data.favouritesCount ?? 0,
          imageUpload: data.imageUpload
        }
        setAuction(auctionData)
      }
      catch (error) {
        console.log("Error: ", error)
      }
      finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id])

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
        onRequireLogin={() => setShowAuthModal(true)}
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

          return (
            <Card className="text-center" >
              <Card.Body>
                <Card.Title className="mb-3">Auction Finished</Card.Title>
                <Card.Text className="mb-3">
                  A bid of <b>{winningBid.amount} SEK</b> won the auction.
                </Card.Text>
                <Card.Text className="text-center">
                  <span
                    className={`border rounded px-2 py-1 ${hasBeenPaid ? "text-success border-success" : "text-warning border-warning"}`}
                    style={{ display: "inline-block" }}
                  >
                    They have {hasBeenPaid ? "" : "not "}paid
                  </span>
                </Card.Text>
              </Card.Body>
            </Card>
          );
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
          customTitle="Log in to continue"
          show={showAuthModal}
          onHide={() => setShowAuthModal(false)}
        ></AuthModal>)
      }
    </>
  );
}


