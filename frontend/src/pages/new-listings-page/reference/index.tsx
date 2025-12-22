import { Center, Tabs, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { PiBrowser, PiInfo } from 'react-icons/pi';

import type { ListingDraft } from '@/types/listing';

import { Info } from './Info';
import { Source, useHighlight } from './source';

export const Reference = ({ listing }: { listing: ListingDraft | null }) => {
  const { highlight } = useHighlight();
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
        <Center h="full">
          <Text color="fg.muted">Select a listing to view reference</Text>
        </Center>
      </Tabs.Content>

      <Tabs.Content value="pending" h="full">
        <Center h="full">
          <Text color="fg.muted">Scraping listing...</Text>
        </Center>
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
};
