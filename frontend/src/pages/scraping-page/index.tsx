import { Button, Heading, HStack, Text, Textarea, VStack } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { saveListings, scrapeListings } from '@/services/listings';
import type { Listing, ScrapeResult } from '@/types/listing';

import Listings from './Listings';

export default function ScrapingPage() {
  const [urls, setUrls] = useState('');
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set());

  // Pre-check unique listings when scrape result changes
  useEffect(() => {
    if (scrapeResult) {
      const uniqueIds = new Set(scrapeResult.unique.map((listing) => listing.id));
      setSelectedListings(uniqueIds);
    }
  }, [scrapeResult]);

  const scrapeMutation = useMutation({
    mutationFn: async (urls: string[]) => {
      const result = await scrapeListings(urls);
      return result;
    },
    onSuccess: (data) => {
      setScrapeResult(data);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (listings: Listing[]) => {
      await saveListings(listings);
    },
    onSuccess: () => {
      // Clear results after save
      setScrapeResult(null);
      setUrls('');
    },
  });

  const handleScrape = () => {
    const urlList = urls
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urlList.length === 0) {
      return;
    }

    scrapeMutation.mutate(urlList);
  };

  const handleSelectionChange = (listingId: string, checked: boolean) => {
    setSelectedListings((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(listingId);
      } else {
        next.delete(listingId);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (scrapeResult) {
      // Collect all listings (unique + duplicates) and filter by selected IDs
      const allListings = [
        ...scrapeResult.unique,
        ...scrapeResult.duplicates.map((dup) => dup.listing),
      ];
      const listingsToSave = allListings.filter((listing) => selectedListings.has(listing.id));
      saveMutation.mutate(listingsToSave);
    }
  };

  return (
    <VStack w="full" h="full" px="16" py="8" align="stretch" gap="6" overflowY="scroll">
      <Heading size="2xl">Scrape Job Listings</Heading>

      {/* Input section */}
      <VStack align="stretch" gap="4">
        <Text fontWeight="medium">Enter URLs (one per line):</Text>
        <Textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="https://example.com/job1&#10;https://example.com/job2&#10;https://example.com/job3"
          rows={8}
          fontFamily="monospace"
          fontSize="sm"
        />
        <HStack>
          <Button
            onClick={handleScrape}
            colorScheme="blue"
            loading={scrapeMutation.isPending}
            disabled={!urls.trim()}
          >
            Scrape URLs
          </Button>
          {scrapeMutation.isError && (
            <Text color="red.500" fontSize="sm">
              Error: {scrapeMutation.error.message}
            </Text>
          )}
        </HStack>
      </VStack>

      {/* Results section */}
      {scrapeResult && (
        <VStack align="stretch" gap="4">
          <HStack justifyContent="space-between">
            <Text fontWeight="medium">
              Found {scrapeResult.unique.length} unique listings and{' '}
              {scrapeResult.duplicates.length} duplicates
            </Text>
            {selectedListings.size > 0 && (
              <Button onClick={handleSave} colorScheme="green" loading={saveMutation.isPending}>
                Save {selectedListings.size} Selected Listing
                {selectedListings.size !== 1 ? 's' : ''}
              </Button>
            )}
          </HStack>
          <Listings
            uniqueListings={scrapeResult.unique}
            duplicateListings={scrapeResult.duplicates}
            selectedListings={selectedListings}
            onSelectionChange={handleSelectionChange}
          />
        </VStack>
      )}
    </VStack>
  );
}
