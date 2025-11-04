import { useState, useEffect, useCallback } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { type ExtendedArtist } from '../parts/ArtistCard';
import type Auction from '../interfaces/Auction';
import AuctionCard from '../parts/AuctionCard';


function ArtistView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const artistId = id ? parseInt(id, 10) : NaN;

  const [artist, setArtist] = useState<ExtendedArtist | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArtistData = useCallback(async (): Promise<void> => {
    try {
      if (!artistId || isNaN(artistId)) {
        console.error('No valid artist ID provided');
        return;
      }

      const response = await fetch(`/api/expand/artists/${artistId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setArtist(null);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const artistData = await response.json();
      if (artistData) {
        const parsedArtistId = parseInt(String(artistData.id), 10);
        if (isNaN(parsedArtistId) || parsedArtistId === 0) {
          console.error('Invalid artist ID in response:', artistData.id);
          setArtist(null);
          return;
        }

        const mappedArtist: ExtendedArtist = {
          id: parsedArtistId,
          firstName: String(artistData.firstName || ''),
          lastName: String(artistData.lastName || ''),
          profession: String(artistData.profession || ''),
          favorited: Boolean(artistData.favorited),
          rating: artistData.rating,
          location: artistData.location ? String(artistData.location) : undefined,
          email: artistData.email ? String(artistData.email) : undefined,
          registrationDate: artistData.registrationDate ? String(artistData.registrationDate) : undefined,
          avatar: artistData.avatar ? String(artistData.avatar) : undefined
        };
        setArtist(mappedArtist);
      } else {
        setArtist(null);
      }
    } catch (error) {
      console.error('Error fetching artist data:', error);
      setArtist(null);
    }
  }, [artistId]);

  const fetchArtistAuctions = useCallback(async (): Promise<void> => {
    try {
      if (!artistId || isNaN(artistId)) {
        return;
      }

      const response = await fetch(`/api/expand/auctions`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const allAuctions: unknown = await response.json();
      
      const artistAuctions = Array.isArray(allAuctions) 
        ? allAuctions.filter((auction: Record<string, unknown>) => {
            const seller = auction.seller;
            if (Array.isArray(seller)) {
              return seller.some((s: Record<string, unknown>) => {
                const sellerId = typeof s.id === 'number' ? s.id : parseInt(String(s.id), 10);
                return !isNaN(sellerId) && sellerId === artistId;
              });
            }
            const sellerObj = seller as Record<string, unknown> | undefined;
            const sellerId = sellerObj?.id 
              ? (typeof sellerObj.id === 'number' ? sellerObj.id : parseInt(String(sellerObj.id), 10))
              : null;
            return sellerId !== null && !isNaN(sellerId) && sellerId === artistId;
          })
        : [];

      const mappedAuctions: Auction[] = artistAuctions
        .map((auction: Record<string, unknown>) => {
          let currentBid = 0;
          if (auction.currentBid !== undefined) {
            currentBid = Number(auction.currentBid) || 0;
          } else if (Array.isArray(auction.items)) {
            const bids = auction.items.filter((item: Record<string, unknown>) => 
              item.contentType === 'Bid' || item.contentType === 'bid'
            );
            if (bids.length > 0) {
              const amounts = bids.map((bid: Record<string, unknown>) => Number(bid.amount) || 0);
              const maxAmount = Math.max(...amounts);
              currentBid = isFinite(maxAmount) ? maxAmount : 0;
            }
          }

          const startTime = auction.startTime ? new Date(String(auction.startTime)) : new Date();
          const endTime = auction.endTime ? new Date(String(auction.endTime)) : new Date();

          const auctionId = parseInt(String(auction.id), 10);
          if (isNaN(auctionId) || auctionId === 0) {
            console.warn('Invalid auction ID in response:', auction.id);
            return null;
          }

          return {
            id: auctionId,
            title: String(auction.title || ''),
            currentBid: currentBid,
            startTime: isNaN(startTime.getTime()) ? new Date() : startTime,
            endTime: isNaN(endTime.getTime()) ? new Date() : endTime,
            favorited: Boolean(auction.favorited)
          };
        })
        .filter((auction): auction is Auction => auction !== null);

      setAuctions(mappedAuctions);
    } catch (error) {
      console.error('Error fetching artist auctions:', error);
      setAuctions([]);
    }
  }, [artistId]);

  useEffect(() => {
    if (!artistId || isNaN(artistId)) {
      setIsLoading(false);
      setArtist(null);
      setAuctions([]);
      return;
    }

    setIsLoading(true);
    Promise.all([
      fetchArtistData(),
      fetchArtistAuctions()
    ]).finally(() => {
      setIsLoading(false);
    });
  }, [artistId, fetchArtistData, fetchArtistAuctions]);

  if (isLoading) {
    return (
      <div className="px-3 px-md-4 py-5">
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
      <div className="px-3 px-md-4 py-5">
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
    <div className="px-3 px-md-4 py-4">
      <Row>
        <Col xs={12} lg={10} xl={8} xxl={7} className="mx-auto">
          <div className="bg-white rounded-3 p-3 p-md-4 mb-4">
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

          <div className="flex-grow-1" style={{ marginTop: '20px' }}>
            <div>
              <h4 className="fw-bold mb-1 text-dark">{artist.firstName} {artist.lastName}</h4>
              <div className="text-dark mb-1">{artist.profession}</div>
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
        </Col>
      </Row>

    <Row>
      <Col xs={12} lg={10} xl={8} xxl={7} className="mx-auto">
        <div className="bg-white rounded-3 p-3 p-md-4 mb-4">
          <h6 className="fw-bold text-dark mb-3">Ongoing auctions</h6>
        {auctions.length > 0 ? (
          <div className="row">
            {auctions.map((auction) => (
              <div key={auction.id} className="col-md-6 col-lg-3 col-xl-2 col-xxl-2 mb-4">
                <AuctionCard {...auction} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted py-3">
            <p>No ongoing auctions</p>
          </div>
        )}
        </div>
      </Col>
    </Row>
    </div>
  );
}

export default ArtistView;

ArtistView.route = {
  path: '/artist-view/:id',
  index: 0
};
