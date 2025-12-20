import { Splitter, VStack } from '@chakra-ui/react';
import { useState } from 'react';

import { useLocalStorage } from '@/hooks/utils/useLocalStorage';
import type { ScrapingListing } from '@/types/listing';

import Details from './Details';
import Footer from './Footer';
import Reference from './reference';
import Table from './Table';
import Toolbar from './Toolbar';

// TODO: With the useListingsQuery hook, we don't really need to pass listings as a prop?
export default function Listings({ listings }: { listings: ScrapingListing[] }) {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    listings[0]?.id || null
  );
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(listings.filter((l) => l.status === 'completed').map((l) => [l.id, true]))
  );
  const [splitterSizes, setSplitterSizes] = useLocalStorage(
    'new-listings-splitter-sizes',
    [25, 35, 40]
  );
  const [highlightedText, setHighlightedText] = useState<string | null>(null);

  const selectedListing =
    listings.find((listing) => listing.id === selectedListingId) || listings[0];

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  return (
    <VStack h="full" w="full" gap="0" alignItems="stretch">
      <Toolbar rowSelection={rowSelection} />
      <Splitter.Root
        panels={[
          { id: 'table', minSize: 15, maxSize: 40 },
          { id: 'details', minSize: 25, maxSize: 60 },
          { id: 'preview', minSize: 25, maxSize: 70 },
        ]}
        size={splitterSizes}
        onResize={(details) => setSplitterSizes(details.size)}
        h="full"
      >
        <Splitter.Panel id="table">
          <Table
            listings={listings}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            selectedListingId={selectedListingId}
            setSelectedListingId={setSelectedListingId}
          />
        </Splitter.Panel>
        <Splitter.ResizeTrigger id="table:details">
          <Splitter.ResizeTriggerSeparator />
        </Splitter.ResizeTrigger>
        <Splitter.Panel id="details">
          <Details
            key={selectedListingId}
            listing={selectedListing}
            onHighlight={(text) => setHighlightedText(text)}
            onClearHighlight={() => setHighlightedText(null)}
          />
        </Splitter.Panel>
        <Splitter.ResizeTrigger id="details:preview">
          <Splitter.ResizeTriggerSeparator />
        </Splitter.ResizeTrigger>
        <Splitter.Panel id="preview">
          <Reference listing={selectedListing} highlight={highlightedText} />
        </Splitter.Panel>
      </Splitter.Root>
      {/*  FIXME: Not sure if there even is a save state*/}
      <Footer selectedCount={selectedCount} totalCount={listings.length} isSaving={true} />
    </VStack>
  );
}
