import { Button, ButtonGroup, EmptyState, List, VStack } from '@chakra-ui/react';
import { PiCheck, PiLink, PiQuestion, PiWarning } from 'react-icons/pi';
import { Link } from 'react-router';

import { useListingCache } from '@/hooks/listings/useListingCache';
import { useListingMutations } from '@/hooks/listings/useListingMutations';
import type { ListingDraft } from '@/types/listing';

import { useIngestion } from '../ingestion-modal/ingestionContext';

export function Info({ listing }: { listing: ListingDraft }) {
  const { open } = useIngestion();
  const { discardListings } = useListingCache();
  const { saveListings } = useListingMutations();

  switch (listing.status) {
    case 'duplicate_url':
      return (
        <EmptyState.Root h="full">
          <EmptyState.Content h="full">
            <EmptyState.Indicator>
              <PiLink />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>URL Already in Database</EmptyState.Title>
              <EmptyState.Description>
                You have already scraped or applied to this exact URL. To prevent the database from
                imploding, we can't allow you to add it again.
              </EmptyState.Description>
            </VStack>
            <ButtonGroup>
              <Button asChild>
                <Link
                  to={`/applications?applicationId=${listing.duplicateOfApplicationId}`}
                  target="_blank"
                >
                  View Existing Application
                </Link>
              </Button>
              <Button variant="outline" onClick={() => discardListings([listing.id])}>
                Discard
              </Button>
            </ButtonGroup>
          </EmptyState.Content>
        </EmptyState.Root>
      );
    case 'duplicate_content':
      return (
        <EmptyState.Root h="full">
          <EmptyState.Content h="full">
            <EmptyState.Indicator>
              <PiLink />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Similar Listing Found</EmptyState.Title>
              <EmptyState.Description>
                A listing with very similar content already exists in your database. This helps
                prevent duplicates while allowing for slight variations in job postings.
              </EmptyState.Description>
            </VStack>
            <VStack gap={3}>
              <Button asChild>
                <Link
                  to={`/applications?applicationId=${listing.duplicateOfApplicationId}`}
                  target="_blank"
                >
                  View Existing Application
                </Link>
              </Button>
              <ButtonGroup>
                <Button variant="outline" onClick={() => discardListings([listing.id])}>
                  Discard
                </Button>
                <Button onClick={() => saveListings([listing])}>Save Anyways</Button>
              </ButtonGroup>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      );
    case 'error':
      return (
        <EmptyState.Root h="full">
          <EmptyState.Content h="full">
            <EmptyState.Indicator>
              <PiWarning />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Extraction Failed</EmptyState.Title>
              <EmptyState.Description>
                The AI was unable to extract information from this listing. Error: {listing.error}
              </EmptyState.Description>
            </VStack>
            <VStack alignItems="start" w="full">
              <List.Root as="ol">
                <List.Item>Open the original URL in your browser.</List.Item>
                <List.Item>Copy the entire job description text.</List.Item>
                <List.Item>
                  Paste the job description into the manual extraction text-box.
                </List.Item>
              </List.Root>
              <ButtonGroup>
                <Button size="sm" onClick={() => open({ id: listing.id, url: listing.url })}>
                  Open Manual Extraction
                </Button>
                <Button variant="outline" size="sm" onClick={() => discardListings([listing.id])}>
                  Discard
                </Button>
              </ButtonGroup>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      );
    case 'unique':
      return (
        <EmptyState.Root h="full">
          <EmptyState.Content h="full">
            <EmptyState.Indicator>
              <PiCheck />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Ready to Save</EmptyState.Title>
              <EmptyState.Description>
                This listing has been successfully extracted and is ready to be saved to your
                database.
              </EmptyState.Description>
            </VStack>
            <Button onClick={() => saveListings([listing])}>Save</Button>
          </EmptyState.Content>
        </EmptyState.Root>
      );
    default:
      return (
        <EmptyState.Root h="full">
          <EmptyState.Content h="full">
            <EmptyState.Indicator>
              <PiQuestion />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>Unknown State</EmptyState.Title>
              <EmptyState.Description>
                We aren't quite sure what happened with this listing. Try re-scraping it.
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      );
  }
}
