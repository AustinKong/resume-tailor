import { Box } from '@chakra-ui/react';
import { useEffect, useMemo, useRef } from 'react';

import { HIGHLIGHT_SCRIPT } from '@/constants/highlight-script';
import type { ListingDraft } from '@/types/listing';

export default function Source({
  listing,
  highlight,
}: {
  listing: ListingDraft;
  highlight: string | null;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const htmlContent = useMemo(() => {
    const html =
      listing.status === 'unique'
        ? listing.html
        : listing.status === 'duplicate_content'
          ? listing.html
          : '';
    if (!html) return '';
    return html + HIGHLIGHT_SCRIPT;
  }, [listing]);

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
