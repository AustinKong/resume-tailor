import { Splitter, VStack } from '@chakra-ui/react';
import { useRef, useState } from 'react';

import { useLocalStorage } from '@/hooks/utils/useLocalStorage';
import type { ScrapingListing } from '@/types/listing';

import Details from './Details';
import Footer from './Footer';
import Preview, { type PreviewHandle } from './Preview';
import Table from './Table';
import Toolbar from './Toolbar';

// TODO: With the useListingsQuery hook, we don't really need to pass listings as a prop?
export default function Listings({ listings }: { listings: ScrapingListing[] }) {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [splitterSizes, setSplitterSizes] = useLocalStorage(
    'new-listings-splitter-sizes',
    [25, 35, 40]
  );
  const previewRef = useRef<PreviewHandle>(null);

  const handleHighlight = (text: string | null) => {
    if (!text) return;
    previewRef.current?.highlight(text);
  };

  const handleClearHighlight = () => {
    previewRef.current?.clear();
  };

  const selectedListing =
    listings.find((listing) => listing.id === selectedListingId) || listings[0];

  const selectedCount = Object.keys(rowSelection).length;

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
            onHighlight={handleHighlight}
            onClearHighlight={handleClearHighlight}
          />
        </Splitter.Panel>
        <Splitter.ResizeTrigger id="details:preview">
          <Splitter.ResizeTriggerSeparator />
        </Splitter.ResizeTrigger>
        <Splitter.Panel id="preview">
          <Preview listing={selectedListing} ref={previewRef} key={selectedListingId} />
        </Splitter.Panel>
      </Splitter.Root>
      {/*  FIXME: Not sure if there even is a save state*/}
      <Footer selectedCount={selectedCount} totalCount={listings.length} isSaving={true} />
    </VStack>
  );
}
