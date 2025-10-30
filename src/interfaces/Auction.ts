export default interface Auction {
  id: number,
  title: string,
  currentBid: number,
  endTime: Date,
  startTime: Date,
  favorited: boolean
}