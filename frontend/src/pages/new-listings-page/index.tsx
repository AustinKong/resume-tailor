import { useListingCache, useListingMutations, useListingsQuery } from '@/hooks/listings';

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
  const { listings, isLoading } = useListingsQuery();
  const { scrapeListings, isScrapeLoading } = useListingMutations();
  const { clearListings } = useListingCache();

  if (isScrapeLoading || isLoading) {
    return <ScrapeLoader />;
  }

  if (!listings.length) {
    return <Input onSubmit={scrapeListings} onClearCache={clearListings} />;
  }

  return <Listings listings={listings} />;
}
