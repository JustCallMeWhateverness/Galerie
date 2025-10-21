
import { Card } from 'react-bootstrap';
import FilledHeart from '../filled-heart.svg'
import OutlineHeart from '../outline-heart.svg'
interface AuctionCard {
  id: number,
  title: string,
  currentBid: number,
  endTime: Date,
  favorited: boolean

}

export default function AuctionCard({ id, title, currentBid, endTime, favorited }: AuctionCard) {

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

  return <Card className="mb-4">
    <Card.Img />
    <Card.ImgOverlay className='text-center'>
      <Card.Title>
        {title}
      </Card.Title>
      <Card.Text>
        Time left: {remainingTimeMessage}
      </Card.Text>
    </Card.ImgOverlay>
    <Card.Body>
      <Card.Text>
        Current bid: {currentBid} SEK
        <span className='float-end'>

          <img
            src={favorited ? FilledHeart : OutlineHeart} alt={favorited ? "Filled heart" : "Outline of heart"} />
        </span>
      </Card.Text>
    </Card.Body>
  </Card>

}
