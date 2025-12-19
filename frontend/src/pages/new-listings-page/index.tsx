import { useListingCache, useListingMutations, useListingsQuery } from '@/hooks/listings';

import Input from './Input';
import Listings from './listings';
import ScrapeLoader from './ScrapeLoader';

export default function NewListingsPage() {
  const { listings, isLoading } = useListingsQuery();
  const { scrapeListings, isScrapeLoading } = useListingMutations();
  const { clearListings } = useListingCache();

  if (isScrapeLoading || isLoading) {
    return <ScrapeLoader />;
  }

  if (listings.length === 0) {
    return <Input onSubmit={scrapeListings} onClearCache={clearListings} />;
  }

  return <Listings listings={listings} />;
}
