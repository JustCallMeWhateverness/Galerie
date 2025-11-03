import { useState, useEffect, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { type ExtendedArtist } from '../parts/ArtistCard';
import type Auction from '../interfaces/Auction';
import AuctionCard from '../parts/AuctionCard';

/**
 * ArtistView Component - Individual artist profile page
 * Route: /artist-view/:id
 * 
 * TODO: Replace mock data with real API calls when backend is ready
 * - GET /api/artists/:id - Get artist profile
 * - GET /api/artists/:id/auctions - Get artist's auctions
 */
function ArtistView() {
  // Get artist ID from URL parameters
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State management
  const [artist, setArtist] = useState<ExtendedArtist | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch artist profile data
  const fetchArtistData = useCallback(async () => {
    try {
      if (!id) {
        console.error('No artist ID provided');
        return;
      }

      // TODO: Replace with real API call
      // const response = await fetch(`/api/artists/${id}`);
      // const artistData = await response.json();
      // setArtist(artistData);

      // Mock data for testing
      if (id === '1') {
        const artistData: ExtendedArtist = {
          id: 1,
          firstName: 'Luca',
          lastName: 'Ortega',
          profession: 'Woodworker',
          favorited: false,
          location: 'Somiedo, Spain',
          email: 'luca@ortega.com',
          registrationDate: '10 january 2019',
          avatar: '/images/artists/luca-ortega.png'
        };
        setArtist(artistData);
      } else {
        setArtist(null);
      }
    } catch (error) {
      console.error('Error fetching artist data:', error);
      setArtist(null);
    }
  }, [id]);

  // Fetch artist's auctions
  const fetchArtistAuctions = useCallback(async () => {
    try {
      // TODO: Replace with real API call
      // const response = await fetch(`/api/artists/${id}/auctions`);
      // const artistAuctions = await response.json();
      // setAuctions(artistAuctions);

      // Mock data for testing
      const mockAuctions: Auction[] = [
        {
          id: 1,
          title: 'Twisted Cuff',
          currentBid: 150,
          endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
          favorited: false
        },
        {
          id: 2,
          title: 'Gemstone Ring',
          currentBid: 320,
          endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          favorited: false
        },
        {
          id: 3,
          title: 'Fine Chain Necklace',
          currentBid: 280,
          endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
          favorited: false
        },
        {
          id: 4,
          title: 'Hoop Earrings',
          currentBid: 95,
          endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
          favorited: false
        }
      ];

      setAuctions(mockAuctions);
    } catch (error) {
      console.error('Error fetching artist auctions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data when component mounts or artist ID changes
  useEffect(() => {
    fetchArtistData();
    fetchArtistAuctions();
  }, [id, fetchArtistData, fetchArtistAuctions]);

  // Loading state - show spinner while fetching data
  if (isLoading) {
    return (
      <div className="container-fluid px-3 px-md-4 py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state - artist not found
  if (!artist) {
    return (
      <div className="container-fluid px-3 px-md-4 py-5">
        <div className="text-center">
          <h2>Artist not found</h2>
          <Button variant="primary" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Main render - artist profile and auctions
  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      {/* Artist Profile Card - Main container for artist information (copied from UserPage) */}
      <div className="bg-white rounded-3 p-3 p-md-4 mb-4 mx-auto profile-card-container">
        <div className="d-flex flex-column flex-md-row align-items-start">
          {/* Profile Picture Section - Avatar placeholder (copied from UserPage) */}
          <div className="me-md-4 mb-3 mb-md-0 text-center text-md-start">
            <div 
              className="rounded-3 bg-light d-flex align-items-center justify-content-center mx-auto mx-md-0 overflow-hidden"
              style={{ 
                width: '180px', 
                height: '280px', 
                border: '1px solid #e9ecef'
              }}
            >
              {artist.avatar ? (
                <img 
                  src={artist.avatar} 
                  alt={`${artist.firstName} ${artist.lastName}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <i className="bi bi-person-fill text-muted" style={{ fontSize: '3rem' }}></i>
              )}
            </div>
          </div>

          {/* Artist Information Section - Name, profession, email, etc. (copied from UserPage) */}
          <div className="flex-grow-1" style={{ marginTop: '20px' }}>
            {/* Display Mode - Show artist information (copied from UserPage display mode) */}
            <div>
              {/* Artist name display */}
              <h4 className="fw-bold mb-1 text-dark">{artist.firstName} {artist.lastName}</h4>
              {/* Artist profession */}
              <div className="text-dark mb-1">{artist.profession}</div>
              {/* Artist location */}
              {artist.location && (
                <div className="text-dark mb-1">{artist.location}</div>
              )}
              {/* Artist email */}
              {artist.email && (
                <div className="text-dark mb-1">{artist.email}</div>
              )}
              {/* Registration date */}
              <div className="text-dark small">
                Reg. {artist.registrationDate}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Auctions Section - Using AuctionCard with normal styling */}
      <div className="bg-white rounded-3 p-3 p-md-4 mb-4 mx-auto profile-card-container">
        <h6 className="fw-bold text-dark mb-3">Ongoing auctions</h6>
        <div className="row">
          {auctions.map((auction) => (
            <div key={auction.id} className="col-md-6 col-lg-3 col-xl-2 col-xxl-2 mb-4">
              <AuctionCard {...auction} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ArtistView;

ArtistView.route = {
  path: '/artist-view/:id',
  index: 0
};
