import { Box } from '@chakra-ui/react';
import { useEffect, useMemo, useRef } from 'react';

import { HIGHLIGHT_SCRIPT } from '@/constants/highlight-script';
import type { ScrapingListing } from '@/types/listing';

export default function Source({
  listing,
  highlight,
}: {
  listing: ScrapingListing;
  highlight: string | null;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const htmlContent = useMemo(() => {
    if (!listing.html) return '';
    return listing.html + HIGHLIGHT_SCRIPT;
  }, [listing.html]);

  useEffect(() => {
    const target = iframeRef.current?.contentWindow;
    if (!target) return;

    if (highlight) {
      target.postMessage({ type: 'HIGHLIGHT', text: highlight }, '*');
    } else {
      target.postMessage({ type: 'CLEAR' }, '*');
    }
  }, [highlight]);

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
}
