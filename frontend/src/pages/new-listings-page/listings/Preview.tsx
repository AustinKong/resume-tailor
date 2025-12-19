import { Box, Button, Center, Heading, HStack, Image, Link, Text, VStack } from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';

import { HIGHLIGHT_SCRIPT } from '@/constants/highlight-script';
import type { ScrapingListing } from '@/types/listing';

export type PreviewHandle = {
  highlight: (text: string) => void;
  clear: () => void;
};

type PreviewProps = {
  listing: ScrapingListing;
};

// TODO: Show different message if semantic or url duplicate
const Preview = forwardRef<PreviewHandle, PreviewProps>(({ listing }, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showAnyways, setShowAnyways] = useState(false);

  // Inject script required for MarkJS highlighting
  const htmlContent = useMemo(() => {
    if (!listing.html) return '';
    return listing.html + HIGHLIGHT_SCRIPT;
  }, [listing.html]);

  useImperativeHandle(ref, () => ({
    highlight: (text: string) => {
      iframeRef.current?.contentWindow?.postMessage({ type: 'HIGHLIGHT', text }, '*');
    },
    clear: () => {
      iframeRef.current?.contentWindow?.postMessage({ type: 'CLEAR' }, '*');
    },
  }));

  if (!showAnyways && (listing.error || !listing.html)) {
    return (
      <Center w="full" h="full">
        <VStack textAlign="center" maxW="md" textWrap="pretty" gap="6">
          <Image src={listing.html ? 'https://http.cat/422' : 'https://http.cat/400'} />
          <Heading size="2xl">
            Failed to get any useful <br /> information from this listing.
          </Heading>
          <Text textStyle="lg" color="fg.error" maxW="md">
            Error: {listing.error}
          </Text>
          <HStack>
            <Button asChild size="lg">
              <Link href={listing.url} target="_blank" rel="noopener noreferrer">
                View website
              </Link>
            </Button>
            {listing.html && (
              <Button onClick={() => setShowAnyways(true)} size="lg" variant="outline">
                View anyways
              </Button>
            )}
          </HStack>
        </VStack>
      </Center>
    );
  }

  return (
    <Box w="full" h="full">
      <iframe
        ref={iframeRef}
        srcDoc={htmlContent}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        sandbox="allow-scripts allow-same-origin"
      />
    </Box>
  );
});

export default Preview;
