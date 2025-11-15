export default interface Auction {
  id: string,
  title: string,
  currentBid: number,
  startBid: number,
  endTime: Date,
  startTime: Date,
  favorited: boolean;
  favouritesCount: number;
  imageUpload?: {
    paths: string[];
    mediaTexts?: string[];
  };
}