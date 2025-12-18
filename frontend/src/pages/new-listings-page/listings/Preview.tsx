import { Box, Center, Text } from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';

import { HIGHLIGHT_SCRIPT } from '@/constants/highlight-script';
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
