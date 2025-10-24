import { Card } from 'react-bootstrap';
import { useFavorite } from '../hooks/useFavorite';
import type Auction from '../interfaces/Auction';

import AuthModal from '../modals/AuthModal';

export default function AuctionCard({ id, title, currentBid, endTime, favorited }: Auction) {

  const { isFavorited, showAuthModal, onFavorite } = useFavorite(favorited);

  const currentTime = new Date()
  let remainingTimeMessage = ""
  // Time Difference in Milliseconds
  const timeDifferenceMilli: number = endTime.getTime() - currentTime.getTime()

  if (timeDifferenceMilli < 0) {
    remainingTimeMessage = "Auction has finished"
  }
  else {

    const remainingSeconds = Math.floor(timeDifferenceMilli / 1000)
    const remainingMinutes = Math.floor(remainingSeconds / 60)
    const remainingHours = Math.floor(remainingMinutes / 60)
    const remainingDays = Math.floor(remainingHours / 24)

    // Only display the largest time unit remaining
    if (remainingDays > 0) {
      remainingTimeMessage = `${remainingDays} days`
    }
    else if (remainingHours > 0) {
      remainingTimeMessage = `${remainingHours} hours`
    }
    else if (remainingMinutes > 0) {
      remainingTimeMessage = `${remainingMinutes} minutes`
    }
    else
      remainingTimeMessage = `${remainingSeconds} seconds`
  }


  return (
    <>
      <Card className="mb-4">
        <Card.Img style={{ minHeight: '200px', objectFit: 'cover' }} />
        <Card.ImgOverlay className='text-center'>
          <span className='float-end' role='button' onClick={onFavorite}>
            {/* bi-suit-heart must be at the end for the correct logo to be shown */}
            <i className={`bi bi-suit-heart${isFavorited ? '-fill' : ''}`}></i>
          </span>
          <Card.Title className='text-center'>
            {title}
          </Card.Title>
          <Card.Text className='text-center'>
            Time left: {remainingTimeMessage}
          </Card.Text>
        </Card.ImgOverlay>
        <Card.Body>
          <Card.Text className='text-center'>
            Current bid: {currentBid} SEK
          </Card.Text>
        </Card.Body>
      </Card>
      {showAuthModal && (
        <AuthModal customTitle="Log in to view your favourites" />
      )}
    </>
  );
}
