import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import type Auction from '../interfaces/Auction';
import type Artist from '../interfaces/Artist';

export function useFavorite(initialFavorited: boolean, auction?: Auction, artist?: Artist) {
  const [isFavorited, setFavorited] = useState(initialFavorited)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, setUser } = useAuth();

  function onFavorite() {
    if (!user) {
      setShowAuthModal(true);
    }
    else {
      const newFavorited = !isFavorited;
      setFavorited(newFavorited);


      if (setUser && auction !== undefined) {
        setUser({
          ...user,
          likedAuctions: newFavorited
            ? [...(user.likedAuctions || []), auction]
            : (user.likedAuctions || []).filter((a) => a.id !== auction.id)
        });
      }

      if (setUser && artist !== undefined) {
        setUser({
          ...user,
          likedArtists: newFavorited
            ? [...(user.likedArtists || []), artist]
            : (user.likedArtists || []).filter((a) => a.id !== artist.id)
        });
      }

    }
  }

  return {
    isFavorited,
    showAuthModal,
    onFavorite,
    setShowAuthModal
  }
}