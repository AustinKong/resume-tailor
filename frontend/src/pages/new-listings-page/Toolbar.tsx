import { Button, HStack, Spacer } from '@chakra-ui/react';
import { useNavigate } from 'react-router';

import { useListingCache, useListingMutations, useListingsQuery } from '@/hooks/listings';

import { useIngestion } from './ingestion-modal';

export function Toolbar({ rowSelection }: { rowSelection: Record<string, boolean> }) {
  const { listings } = useListingsQuery();
  const { saveListings } = useListingMutations();
  const { open } = useIngestion();
  const { discardListings } = useListingCache();
  const navigate = useNavigate();

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  const handleSaveListings = async () => {
    console.log(rowSelection);
    const selectedListings = listings.filter((listing) => rowSelection[listing.id]);
    await saveListings(selectedListings);

    navigate('/applications');
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
        onClick={() => discardListings(Object.keys(rowSelection).filter((id) => rowSelection[id]))}
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
