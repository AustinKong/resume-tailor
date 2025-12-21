import { Center, Heading, Tabs, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { PiBrowser, PiInfo, PiTextbox } from 'react-icons/pi';

import type { ListingDraft } from '@/types/listing';

import Extract from './Extract';
import Info from './Info';
import Source from './Source';

const Reference = ({ listing, highlight }: { listing: ListingDraft; highlight: string | null }) => {
  const isDuplicate = listing.status === 'duplicate_url' || listing.status === 'duplicate_content';
  const isCompleted = listing ? listing.status === 'unique' : false;
  const hasHtml = listing
    ? listing.status === 'unique'
      ? !!listing.html
      : listing.status === 'duplicate_content'
        ? !!listing.html
        : false
    : false;

  const infoDisabled = isCompleted && !isDuplicate;
  const sourceDisabled = !hasHtml;
  const extractDisabled = isDuplicate;

  const tabs = [
    { key: 'info', disabled: infoDisabled },
    { key: 'source', disabled: sourceDisabled },
    { key: 'extract', disabled: extractDisabled },
  ];

  // Find first non-disabled tab with priority: info > source > extract
  const targetTab = tabs.find((t) => !t.disabled)?.key || 'error';

  const [activeTab, setActiveTab] = useState(targetTab);

  useEffect(() => {
    setActiveTab(targetTab);
  }, [listing.id, targetTab]);

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
        <Tabs.Trigger value="info" disabled={infoDisabled}>
          <PiInfo />
          Info
        </Tabs.Trigger>
        <Tabs.Trigger value="source" disabled={sourceDisabled}>
          <PiBrowser />
          Source
        </Tabs.Trigger>
        <Tabs.Trigger value="extract" disabled={extractDisabled}>
          <PiTextbox />
          Extract
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="info" flex="1" overflowY="auto">
        <Info listing={listing} setActiveTab={setActiveTab} />
      </Tabs.Content>
      <Tabs.Content value="source" flex="1" overflowY="auto">
        <Source listing={listing} highlight={highlight} />
      </Tabs.Content>
      <Tabs.Content value="extract" flex="1" overflowY="auto">
        <Extract listing={listing} />
      </Tabs.Content>
      <Tabs.Content value="error">
        <Center h="full" p="10" textAlign="center">
          <Heading size="md">Reference Available</Heading>
          <Text>
            No reference data available for this listing. But no error was encountered. Re-scrape
            the listing and try again.
          </Text>
        </Center>
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default Reference;
