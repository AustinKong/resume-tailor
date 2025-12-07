import type { Listing, ScrapeResult } from '@/types/listing';

export async function scrapeListings(urls: string[]) {
  const response = await fetch('/api/listings/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(urls),
  });

  if (!response.ok) {
    throw new Error('Failed to scrape listings');
  }

  const json = await response.json();
  return json as ScrapeResult;
}

export async function saveListings(listings: Listing[]) {
  const response = await fetch('/api/listings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(listings),
  });

  if (!response.ok) {
    throw new Error('Failed to save listings');
  }

  const json = await response.json();
  return json as Listing[];
}
