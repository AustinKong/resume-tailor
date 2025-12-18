import { HStack } from '@chakra-ui/react';
import { useRef, useState } from 'react';

import type { ScrapingListing } from '@/types/listing';

import Details from './Details';
import Preview, { type PreviewHandle } from './Preview';
import Table from './Table';

export default function Listings({ listings }: { listings: ScrapingListing[] }) {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
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

  return (
    <HStack gap="0" h="full" w="full">
      <Table
        listings={listings}
        selectedListingId={selectedListingId}
        setSelectedListingId={setSelectedListingId}
      />
      <Details
        key={selectedListingId}
        listing={selectedListing}
        onHighlight={handleHighlight}
        onClearHighlight={handleClearHighlight}
      />
      <Preview listing={selectedListing} ref={previewRef} />
    </HStack>
  );
}
