import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import type Auction from '../interfaces/Auction';
import type Artist from '../interfaces/Artist';

function getLocalStorageArray<T>(key: string, userId?: number): T[] {
  try {
    const storageKey = userId ? `${key}_user_${userId}` : key;
    const data = localStorage.getItem(storageKey);
    if (!data) return [];
    const arr = JSON.parse(data);
    if (key === 'likedAuctions') {
      return arr.map((auction: any) => ({
        ...auction,
        endTime: auction.endTime ? new Date(auction.endTime) : auction.endTime,
        startTime: auction.startTime ? new Date(auction.startTime) : auction.startTime,
      }));
    }
    return arr;
  } catch {
    return [];
  }
}

function setLocalStorageArray<T>(key: string, arr: T[], userId?: number) {
  const storageKey = userId ? `${key}_user_${userId}` : key;
  localStorage.setItem(storageKey, JSON.stringify(arr));
}

export function useFavorite(initialFavorited: boolean, auction?: Auction, artist?: Artist) {
  const [isFavorited, setFavorited] = useState(initialFavorited);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, setUser } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    if (auction && userId) {
      const likedAuctions = getLocalStorageArray<Auction>('likedAuctions', userId);
      setFavorited(likedAuctions.some(a => a.id === auction.id));
    }
    if (artist && userId) {
      const likedArtists = getLocalStorageArray<Artist>('likedArtists', userId);
      setFavorited(likedArtists.some(a => a.id === artist.id));
    }
  }, [auction, artist, userId]);

  function onFavorite() {
    if (!user) {
      setShowAuthModal(true);
    } else {
      const newFavorited = !isFavorited;
      setFavorited(newFavorited);

      if (auction) {
        let likedAuctions = getLocalStorageArray<Auction>('likedAuctions', userId);
        likedAuctions = newFavorited
          ? [...likedAuctions, auction]
          : likedAuctions.filter(a => a.id !== auction.id);
        setLocalStorageArray('likedAuctions', likedAuctions, userId);
        if (setUser) setUser({ ...user, likedAuctions });
      }

      if (artist) {
        let likedArtists = getLocalStorageArray<Artist>('likedArtists', userId);
        likedArtists = newFavorited
          ? [...likedArtists, artist]
          : likedArtists.filter(a => a.id !== artist.id);
        setLocalStorageArray('likedArtists', likedArtists, userId);
        if (setUser) setUser({ ...user, likedArtists });
      }
    }
  }

  return {
    isFavorited,
    showAuthModal,
    onFavorite,
    setShowAuthModal
  };
}