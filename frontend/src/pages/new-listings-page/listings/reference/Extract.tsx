import { Button, Textarea, VStack } from '@chakra-ui/react';
import { useState } from 'react';

import { useListingMutations } from '@/hooks/listings';
import type { ScrapingListing } from '@/types/listing';

export default function Extract({ listing }: { listing: ScrapingListing }) {
  const { extractListing, isExtractLoading } = useListingMutations();
  const [content, setContent] = useState<string>('');

  const handleExtract = async () => {
    if (!content.trim()) return;
    await extractListing({ listing, content: content.trim() });
    // Don't hide content after extraction
  };

  return (
    <VStack>
      <Textarea
        placeholder="Paste content here"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button
        loading={isExtractLoading(listing)}
        disabled={!content.trim()}
        onClick={handleExtract}
      >
        Extract
      </Button>
    </VStack>
  );
}
