export default interface Auction {
  id: number,
  title: string,
  currentBid: number,
  endTime: Date,
  favorited: boolean
}