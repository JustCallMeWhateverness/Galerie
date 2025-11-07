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
import { useAuth } from "../hooks/useAuth";
import { useFavorite } from "../hooks/useFavorite";
import AuthModal from "../modals/AuthModal";


AuctionListingPage.route = {
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
  color: string
}

export type Bid = {
  customerId: string,
  amount: number,
  contentType: string,
  timestamp: string
}

type imageUpload = {
  paths: string[],
  mediaTexts?: string[]
}

export default function AuctionListingPage() {

  const { id } = useParams<{ id: string }>()
  const [isLoading, setIsLoading] = useState(true)
  const [bids, setBids] = useState<Bid[]>([])
  const [auctionInformation, setAuctionInformation] = useState<AuctionInfo | null>(null)
  const [img, setImg] = useState<imageUpload | null>(null)
  const [minimumBid, setMinimumBid] = useState(0)

  const { user } = useAuth()
  const isFavoritedByUser = !!user?.likedAuctions?.some(a => a.id === id)
  const { isFavorited, showAuthModal, onFavorite, setShowAuthModal } = useFavorite(isFavoritedByUser)

  const onFavClick: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onFavorite()


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
          seller: data.seller[0].username,
          pickupEnabled: data.pickupEnabled,
          freightEnabled: data.freightEnabled,
          timeRemaining: getRemainingTimeMessage(new Date(data.endTime)),
          startBid: data.startBid,
          color: data.color
        })

        setBids(data.items ?? [])
        setImg(data.imageUpload ?? null)

        if (bids.length > 0) {
          setMinimumBid(Math.max(...bids.map(bid => bid.amount)))
        }
        else if (auctionInformation?.startBid) {
          setMinimumBid(auctionInformation.startBid)
        }
        else {
          setMinimumBid(0)
        }
        console.log(data.startBid)


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

  return (
    <>
      {isLoading && <Spinner animation="border" role="status" >
        <span className="visually-hidden"> Loading... </span>
      </Spinner>}
      {!isLoading &&
        <Row>
          <Col>
            <Image
              src={imageUrl}
              alt={img?.mediaTexts} />

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
              <BidInput miniBid={minimumBid} />
            </div>

            <div>
              <BidHistory bids={bids} />
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
