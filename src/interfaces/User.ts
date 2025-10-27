import type Auction from './Auction';
import type { Artist } from '../parts/ArtistCard';

/**
 * User interface - Defines the structure of a user object
 * 
 * Contains user profile information and references to liked content
 * Used across the application for user authentication and preferences
 */
export default interface User {
  id: number;
  created: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password: string;
  phoneNumber: string;
  likedAuctions?: Auction[];     // User's favorite auctions
  likedArtists?: Artist[];       // User's favorite artists (added for ArtistView integration)
}