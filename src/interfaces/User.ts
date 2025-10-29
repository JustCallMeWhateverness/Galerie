import type Auction from './Auction';
import type Artist from './Artist';

export default interface User {
  id: number;
  created: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password: string;
  phoneNumber: string;
  likedAuctions?: Auction[];
  likedArtists?: Artist[];
}