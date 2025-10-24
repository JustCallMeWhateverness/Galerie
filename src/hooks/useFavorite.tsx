import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function useFavorite(initialFavorited: boolean) {
  const [isFavorited, setFavorited] = useState(initialFavorited)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  function onFavorite() {
    if (!user) {
      setShowAuthModal(true);
    }
    else {
      setFavorited((isFavorited) => (!isFavorited))
    }
  }

  return {
    isFavorited,
    showAuthModal,
    onFavorite,
    setShowAuthModal
  }
}