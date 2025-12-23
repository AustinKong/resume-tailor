import { Button, HStack, Spacer } from '@chakra-ui/react';

import {
  useListingDraftMutations,
  useListingDraftsQuery,
  useListingMutations,
} from '@/hooks/listings';

import { useIngestion } from './ingestion-modal';

export function Toolbar({ rowSelection }: { rowSelection: Record<string, boolean> }) {
  const { listingDrafts } = useListingDraftsQuery();
  const { saveListings } = useListingMutations();
  const { open } = useIngestion();
  const { discardListingDrafts } = useListingDraftMutations();

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  const handleSaveListings = async () => {
    const selectedListings = listingDrafts.filter((listingDraft) => rowSelection[listingDraft.id]);
    await saveListings(selectedListings);
  };

  const handleDiscardListingDrafts = () => {
    const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);
    discardListingDrafts(selectedIds);
  };

  return (
    <HStack
      w="full"
      justifyContent="space-between"
      p="1.5"
      borderBottom="1px solid"
      borderColor="border"
    >
      <Button onClick={() => open()}>Add Listings</Button>

      <Spacer />

      <Button
        onClick={handleDiscardListingDrafts}
        variant="outline"
        colorPalette="red"
        disabled={selectedCount === 0}
      >
        Discard {selectedCount} listings
      </Button>
      <Button onClick={handleSaveListings} disabled={selectedCount === 0}>
        Save {selectedCount} Listings
      </Button>
    </HStack>
  );
}
