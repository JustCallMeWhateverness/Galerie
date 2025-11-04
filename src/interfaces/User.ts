import type Auction from './Auction';
import type Artist from './Artist';
import type { Bid } from './Bid';

export default interface User {
  id: number;
  created: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  roles: string[];
  location: string;
  password: string;
  phoneNumber: string;
  likedAuctions?: Auction[];
  likedArtists?: Artist[];
  activeBids?: Bid[];
}