import { Button, Heading, HStack, Input, Text, Textarea, VStack } from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { getListings, saveListings, scrapeListings } from '@/services/listings';
import type { Listing } from '@/types/listing';
import { ScrapeStatus, type ScrapingListing } from '@/types/listing';

import Listings from './Listings';

export default function ScrapingPage() {
  const [urls, setUrls] = useState('');
  const [scrapeResult, setScrapeResult] = useState<ScrapingListing[] | null>(null);
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set());
  const [selectedExistingListing, setSelectedExistingListing] = useState<string>('');
  const [highlightText, setHighlightText] = useState("Bachelor's Degree");

  // Helper functions to extract listings from scrape result
  const getUniqueListings = (results: ScrapingListing[]): Listing[] => {
    return results
      .filter(
        (listing) =>
          listing.status === ScrapeStatus.COMPLETED &&
          listing.title &&
          listing.company &&
          listing.domain &&
          listing.description
      )
      .map((scrapingListing) => ({
        ...scrapingListing,
        title: scrapingListing.title!,
        company: scrapingListing.company!,
        domain: scrapingListing.domain!,
        description: scrapingListing.description!,
        location: scrapingListing.location || null,
        postedDate: scrapingListing.postedDate || null,
        skills: scrapingListing.skills.map((skill) => skill.value),
        requirements: scrapingListing.requirements.map((req) => req.value),
      }));
  };

  const getDuplicateListings = (
    results: ScrapingListing[]
  ): { listing: Listing; duplicateOf: Listing }[] => {
    return results
      .filter(
        (listing) =>
          (listing.status === ScrapeStatus.DUPLICATE_URL ||
            listing.status === ScrapeStatus.DUPLICATE_SEMANTIC) &&
          listing.duplicateOf !== null &&
          listing.title &&
          listing.company &&
          listing.domain &&
          listing.description
      )
      .map((scrapingListing) => ({
        listing: {
          ...scrapingListing,
          title: scrapingListing.title!,
          company: scrapingListing.company!,
          domain: scrapingListing.domain!,
          description: scrapingListing.description!,
          location: scrapingListing.location || null,
          postedDate: scrapingListing.postedDate || null,
          skills: scrapingListing.skills.map((skill) => skill.value),
          requirements: scrapingListing.requirements.map((req) => req.value),
        },
        duplicateOf: scrapingListing.duplicateOf!,
      }));
  };

  // Pre-check unique listings when scrape result changes
  useEffect(() => {
    if (scrapeResult) {
      const uniqueIds = new Set(
        scrapeResult
          .filter((listing) => listing.status === ScrapeStatus.COMPLETED)
          .map((listing) => listing.id)
      );
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

  const handleLoadExisting = () => {
    if (selectedExistingListing) {
      const listing = existingListings.find((l) => l.id === selectedExistingListing);
      if (listing) {
        // Create a fake scrape result with this listing as completed
        const fakeScrapingListing: ScrapingListing = {
          ...listing,
          location: listing.location ?? null,
          postedDate: listing.postedDate ?? null,
          skills: listing.skills.map((skill) => ({ value: skill, quote: null })),
          requirements: listing.requirements.map((req) => ({ value: req, quote: null })),
          html: null,
          status: ScrapeStatus.COMPLETED,
          duplicateOf: null,
          error: null,
        };
        setScrapeResult([fakeScrapingListing]);
      }
    }
  };

  const handleHighlightText = () => {
    console.log('Frontend: Sending highlight message for text:', highlightText);
    // Send postMessage to iframe to highlight text
    const iframes = document.querySelectorAll('iframe');
    console.log('Frontend: Found', iframes.length, 'iframes');
    iframes.forEach((iframe, index) => {
      console.log('Frontend: Checking iframe', index, 'contentWindow:', !!iframe.contentWindow);
      try {
        console.log('Frontend: Sending message to iframe', index);
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              type: 'HIGHLIGHT',
              text: highlightText,
            },
            '*'
          );
          console.log('Frontend: Message sent to iframe', index);
        } else {
          console.error('Frontend: No contentWindow for iframe', index);
        }
      } catch (e) {
        console.error('Frontend: Could not send message to iframe:', e);
      }
    });
  };

  const handleClearHighlights = () => {
    console.log('Frontend: Sending clear message');
    // Send postMessage to iframe to clear highlights
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe, index) => {
      try {
        console.log('Frontend: Sending clear message to iframe', index);
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              type: 'CLEAR',
            },
            '*'
          );
          console.log('Frontend: Clear message sent to iframe', index);
        } else {
          console.error('Frontend: No contentWindow for iframe', index);
        }
      } catch (e) {
        console.error('Frontend: Could not send message to iframe:', e);
      }
    });
  };

  const handleSave = () => {
    if (scrapeResult) {
      // Collect all listings (unique + duplicates) and filter by selected IDs
      const allListings = [
        ...getUniqueListings(scrapeResult),
        ...getDuplicateListings(scrapeResult).map((dup) => dup.listing),
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

      {/* Testing section */}
      <VStack
        align="stretch"
        gap="4"
        p="4"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
      >
        <Text fontWeight="medium">Testing Tools</Text>
        <HStack gap="4">
          <VStack align="stretch" flex="1">
            <Text fontSize="sm">Load existing listing:</Text>
            <HStack>
              <select
                value={selectedExistingListing}
                onChange={(e) => setSelectedExistingListing(e.target.value)}
                style={{
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  minWidth: '200px',
                }}
              >
                <option value="">Select existing listing</option>
                {existingListings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {listing.title} - {listing.company}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleLoadExisting}
                colorScheme="purple"
                disabled={!selectedExistingListing}
              >
                Load
              </Button>
            </HStack>
          </VStack>
          <VStack align="stretch">
            <Text fontSize="sm">Test highlighting:</Text>
            <HStack>
              <Input
                placeholder="Enter text to highlight"
                value={highlightText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setHighlightText(e.target.value)
                }
                size="sm"
              />
              <Button
                onClick={handleHighlightText}
                colorScheme="blue"
                size="sm"
                disabled={!highlightText.trim()}
              >
                Highlight
              </Button>
              <Button onClick={handleClearHighlights} colorScheme="gray" size="sm">
                Clear
              </Button>
            </HStack>
          </VStack>
        </HStack>
      </VStack>

      {/* Results section */}
      {scrapeResult && (
        <VStack align="stretch" gap="4">
          <HStack justifyContent="space-between">
            <Text fontWeight="medium">
              Found {getUniqueListings(scrapeResult).length} unique listings and{' '}
              {getDuplicateListings(scrapeResult).length} duplicates
            </Text>
            {selectedListings.size > 0 && (
              <Button onClick={handleSave} colorScheme="green" loading={saveMutation.isPending}>
                Save {selectedListings.size} Selected Listing
                {selectedListings.size !== 1 ? 's' : ''}
              </Button>
            )}
          </HStack>
          <Listings
            uniqueListings={getUniqueListings(scrapeResult)}
            duplicateListings={getDuplicateListings(scrapeResult)}
            selectedListings={selectedListings}
            onSelectionChange={handleSelectionChange}
          />
        </VStack>
      )}
    </VStack>
  );
}
