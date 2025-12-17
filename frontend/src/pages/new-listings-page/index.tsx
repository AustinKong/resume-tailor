import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { scrapeListings } from '@/services/listings';
import type { ScrapingListing } from '@/types/listing';
import IndexedDBStorage from '@/utils/indexeddb';

import Input from './Input';
import Listings from './listings';
import ScrapeLoader from './ScrapeLoader';

/**
 * DEVELOPMENT CACHE BEHAVIOR:
 *
 * This component implements simple caching to avoid wasting API calls during development.
 *
 * CACHE STORAGE:
 * - Uses IndexedDB with a single key 'listings' for the last scraped results
 * - Stores whatever the last successful scrape returned, regardless of URLs used
 *
 * SUBMIT BEHAVIOR:
 * - When submit is clicked, checks if any cached data exists
 * - If cached data exists: waits 1 second (visual feedback), then loads cached data directly
 * - If no cached data exists: makes API call and caches the result for future use
 *
 * CACHE MANAGEMENT:
 * - Cache persists across browser sessions
 * - Can be cleared using the red FAB button on the input page
 * - Any new scrape overwrites the previous cache
 *
 * This allows rapid UI testing with cached data without consuming API credits.
 */

export default function NewListingsPage() {
  const [listings, setListings] = useState<ScrapingListing[] | undefined>(undefined);
  const [isLoadingCache, setIsLoadingCache] = useState(false); // Acts as isPending for cache loading

  const { mutate, isPending } = useMutation({
    mutationFn: scrapeListings,
    onSuccess: async (data) => {
      setListings(data);
      // Cache the results (overwrites any previous cache)
      await IndexedDBStorage.save('listings', data);
    },
  });

  const handleSubmit = async (urls: string[]) => {
    // Check for any cached data (regardless of URLs)
    const cachedData = await IndexedDBStorage.get<ScrapingListing[]>('listings');

    if (cachedData) {
      // Load cached data after 1 second delay
      setIsLoadingCache(true);
      setTimeout(() => {
        setListings(cachedData);
        setIsLoadingCache(false);
      }, 1000);
    } else {
      // No cached data, proceed with normal mutation
      mutate(urls);
    }
  };

  const clearCache = async () => {
    await IndexedDBStorage.clear();
    setListings(undefined);
  };

  if (isPending || isLoadingCache) {
    return <ScrapeLoader />;
  }

  if (!listings) {
    return <Input onSubmit={handleSubmit} onClearCache={clearCache} />;
  }

  return <Listings listings={listings} />;
}
