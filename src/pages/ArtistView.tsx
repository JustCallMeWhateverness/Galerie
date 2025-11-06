import { useState, useEffect, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { type ExtendedArtist } from '../parts/ArtistCard';
import type Auction from '../interfaces/Auction';
import AuctionCard from '../parts/AuctionCard';
import BackButton from '../components/BackButton';

type AuctionDTO = {
  id: number;
  title: string;
  category?: string;
  artistName?: string;
  currentBid: number;
  endTime: string;
  startTime: string;
  favorited?: boolean;
  seller?: Array<{ id: string; username?: string }>;
  customer?: Array<{ id: string; username?: string }>;
};

function ArtistView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [artist, setArtist] = useState<ExtendedArtist | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArtistData = useCallback(async (signal?: AbortSignal) => {
    if (!id) {
      console.error('No artist ID provided');
      setArtist(null);
      return;
    }

    try {
      const response = await fetch(`/api/ArtistInfo/${id}`, { signal });
      if (!response.ok) {
        if (response.status === 404) {
          setArtist(null);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
        return;
      }

      const artistData = await response.json();
      if (artistData && artistData.id) {
        setArtist(artistData as ExtendedArtist);
      } else {
        setArtist(null);
      }
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') {
        console.error('Error fetching artist data:', error);
        setArtist(null);
      }
    }
  }, [id]);

  const fetchArtistAuctions = useCallback(async (signal?: AbortSignal) => {
    if (!id) {
      setAuctions([]);
      return;
    }

    try {
      const response = await fetch(`/api/Auction`, { signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const allAuctions: AuctionDTO[] = await response.json();
      
      const artistAuctions = (allAuctions || []).filter((auction: AuctionDTO) => {
        if (auction.seller && Array.isArray(auction.seller)) {
          return auction.seller.some((seller) => seller.id === id);
        }
        if (auction.customer && Array.isArray(auction.customer)) {
          return auction.customer.some((customer) => customer.id === id);
        }
        return auction.artistName && auction.artistName.toLowerCase() === id.toLowerCase();
      });

      const now = new Date();
      const convertedAuctions: Auction[] = artistAuctions
        .map((auction: AuctionDTO) => {
          const startTime = new Date(auction.startTime);
          const endTime = new Date(auction.endTime);
          
          if (startTime <= now && endTime >= now) {
            return {
              id: auction.id,
              title: auction.title,
              currentBid: auction.currentBid || 0,
              startTime: startTime,
              endTime: endTime,
              favorited: auction.favorited || false
            };
          }
          return null;
        })
        .filter((auction: Auction | null) => auction !== null) as Auction[];

      setAuctions(convertedAuctions);
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') {
        console.error('Error fetching artist auctions:', error);
        setAuctions([]);
      }
    }
  }, [id]);

  useEffect(() => {
    setIsLoading(true);
    
    const abortController = new AbortController();
    
    const loadData = async () => {
      try {
        await Promise.all([
          fetchArtistData(abortController.signal),
          fetchArtistAuctions(abortController.signal)
        ]);
      } catch (error) {
        if ((error as Error)?.name !== 'AbortError') {
          console.error('Error loading data:', error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    
    return () => {
      abortController.abort();
    };
  }, [id, fetchArtistData, fetchArtistAuctions]);

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

  return (
    <div className="container-fluid px-3 px-md-4 py-4">
      <BackButton className="mb-3" />
      <div className="bg-white rounded-3 p-3 p-md-4 mb-4 mx-auto" style={{ maxWidth: '600px' }}>
        <div className="d-flex flex-column flex-md-row align-items-start">
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
                  alt={artist.title || artist.username || 'Artist'}
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

          <div className="flex-grow-1" style={{ marginTop: '20px' }}>
            <div>
              <h4 className="fw-bold mb-1 text-dark">{artist.title || artist.username || 'Artist'}</h4>
              {artist.workTitle && (
                <div className="text-dark mb-1">{artist.workTitle}</div>
              )}
              {artist.location && (
                <div className="text-dark mb-1">{artist.location}</div>
              )}
              {artist.email && (
                <div className="text-dark mb-1">{artist.email}</div>
              )}
              {artist.registrationDate && (
                <div className="text-dark small">
                  Reg. {artist.registrationDate}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3 p-3 p-md-4 mb-4 mx-auto" style={{ maxWidth: '600px' }}>
        <h6 className="fw-bold text-dark mb-3">Ongoing auctions</h6>
        <div className="row">
          {auctions.map((auction) => (
            <div key={auction.id} className="col-md-6 col-lg-3 mb-4">
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
