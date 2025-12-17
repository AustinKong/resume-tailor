import { Box, Center, Text } from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import type { ScrapingListing } from '@/types/listing';

export type PreviewHandle = {
  highlight: (text: string) => void;
  clear: () => void;
};

type PreviewProps = {
  listing: ScrapingListing;
};

const Preview = forwardRef<PreviewHandle, PreviewProps>(({ listing }, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useImperativeHandle(ref, () => ({
    highlight: (text: string) => {
      iframeRef.current?.contentWindow?.postMessage({ type: 'HIGHLIGHT', text }, '*');
    },
    clear: () => {
      iframeRef.current?.contentWindow?.postMessage({ type: 'CLEAR' }, '*');
    },
  }));

  if (!listing.html) {
    return (
      <Center>
        <Text>No preview available</Text>
      </Center>
    );
  }

  return (
    <Box flex="1" h="full">
      <iframe
        ref={iframeRef}
        srcDoc={listing.html}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        sandbox="allow-scripts allow-same-origin"
      />
    </Box>
  );
});

export default Preview;
