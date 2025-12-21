import { Button, CloseButton, Dialog, HStack, Portal, Textarea } from '@chakra-ui/react';
import { useState } from 'react';
import { PiArrowLeft } from 'react-icons/pi';
import { useNavigate } from 'react-router';

import { useListingCache, useListingMutations, useListingsQuery } from '@/hooks/listings';

export default function Toolbar({ rowSelection }: { rowSelection: Record<string, boolean> }) {
  const { listings } = useListingsQuery();
  const { clearListings } = useListingCache();
  const { saveListings, isSaveLoading, isExtractLoading, scrapeListings } = useListingMutations();
  const navigate = useNavigate();
  const [bulkUrls, setBulkUrls] = useState('');

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  const handleSaveListings = async () => {
    console.log(rowSelection);
    const selectedListings = listings.filter((listing) => rowSelection[listing.id]);
    await saveListings(selectedListings);
    clearListings();
    navigate('/applications');
  };

  const handleBulkScrape = async () => {
    const urls = bulkUrls
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url);
    if (urls.length === 0) return;

    try {
      await scrapeListings(urls);
      setBulkUrls('');
    } catch (error) {
      console.error('Bulk scrape error:', error);
    }
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

      <HStack gap="2">
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button variant="outline">Add URLs</Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Add Job Listing URLs</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <Textarea
                    placeholder="Enter job listing URLs (one per line)"
                    value={bulkUrls}
                    onChange={(e) => setBulkUrls(e.target.value)}
                    rows={6}
                  />
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </Dialog.ActionTrigger>
                  <Button onClick={handleBulkScrape}>Scrape Listings</Button>
                </Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>

        <Button
          onClick={handleSaveListings}
          loading={isSaveLoading}
          disabled={selectedCount === 0 || isExtractLoading(null)}
        >
          Save {selectedCount} Listings
        </Button>
      </HStack>
    </HStack>
  );
}
