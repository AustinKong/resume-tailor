import { EmptyState, Tabs, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { PiBrowser, PiInfo } from 'react-icons/pi';

import type { ListingDraft } from '@/types/listing';

import { Info } from './Info';
import { Source, useHighlightValue } from './source';

export function Reference({ listing }: { listing: ListingDraft | null }) {
  const highlight = useHighlightValue();
  const hasHtml = !!listing && 'html' in listing && !!listing.html;

  const showSource = hasHtml;
  const showInfo = listing && listing.status !== 'pending';

  const [activeTab, setActiveTab] = useState<string>('source');

  useEffect(() => {
    let newActiveTab = 'info';
    if (!listing) newActiveTab = 'no-selection';
    else if (listing.status === 'pending') newActiveTab = 'pending';
    else if (showSource) newActiveTab = 'source';
    setActiveTab(newActiveTab);
  }, [listing, showSource, showInfo]);

  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={(details) => setActiveTab(details.value)}
      h="full"
      w="full"
      display="flex"
      flexDirection="column"
    >
      <Tabs.List>
        <Tabs.Trigger value="info" disabled={!showInfo}>
          <PiInfo />
          Info
        </Tabs.Trigger>
        <Tabs.Trigger value="source" disabled={!showSource}>
          <PiBrowser />
          Source
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="no-selection" h="full">
        <NoSelection />
      </Tabs.Content>

      <Tabs.Content value="pending" h="full">
        <Pending />
      </Tabs.Content>

      {listing && (
        <>
          <Tabs.Content value="info" flex="1" overflowY="auto">
            <Info listing={listing} />
          </Tabs.Content>
          <Tabs.Content value="source" flex="1" overflowY="auto">
            <Source listing={listing} highlight={highlight} />
          </Tabs.Content>
        </>
      )}
    </Tabs.Root>
  );
}

function NoSelection() {
  return (
    <EmptyState.Root h="full">
      <EmptyState.Content h="full">
        <EmptyState.Indicator>
          <PiBrowser />
        </EmptyState.Indicator>
        <VStack textAlign="center">
          <EmptyState.Title>No Listing Selected</EmptyState.Title>
          <EmptyState.Description>
            Select a listing from the list to view its details and source
          </EmptyState.Description>
        </VStack>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}

function Pending() {
  return (
    <EmptyState.Root h="full">
      <EmptyState.Content h="full">
        <EmptyState.Indicator>
          <PiBrowser />
        </EmptyState.Indicator>
        <VStack textAlign="center">
          <EmptyState.Title>Listing is being scraped</EmptyState.Title>
          <EmptyState.Description>
            Please wait while we fetch the listing details
          </EmptyState.Description>
        </VStack>
      </EmptyState.Content>
    </EmptyState.Root>
  );
}
