import { Button, HStack } from '@chakra-ui/react';
import { PiArrowLeft } from 'react-icons/pi';
import { useNavigate } from 'react-router';

import { useListingCache, useListingMutations, useListingsQuery } from '@/hooks/listings';

export default function Toolbar({ rowSelection }: { rowSelection: Record<string, boolean> }) {
  const { listings } = useListingsQuery();
  const { clearListings } = useListingCache();
  const { saveListings, isSaveLoading, isExtractLoading } = useListingMutations();
  const navigate = useNavigate();

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  const handleSaveListings = async () => {
    console.log(rowSelection);
    const selectedListings = listings.filter((listing) => rowSelection[listing.id]);
    await saveListings(selectedListings);
    clearListings();
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
      <Button onClick={clearListings} variant="ghost">
        <PiArrowLeft />
        Back
      </Button>
      <Button
        onClick={handleSaveListings}
        loading={isSaveLoading}
        disabled={selectedCount === 0 || isExtractLoading(null)}
      >
        Save {selectedCount} Listings
      </Button>
    </HStack>
  );
}
