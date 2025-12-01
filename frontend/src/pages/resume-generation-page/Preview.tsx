import { Badge, Box, VStack } from '@chakra-ui/react';
import { useLayoutEffect, useRef, useState } from 'react';

const PAPER_WIDTH = 816;
const PAPER_HEIGHT = 1056;

interface PreviewProps {
  html: string;
  isSaving?: boolean;
  isGenerating?: boolean;
}

export default function Preview({ html, isSaving, isGenerating }: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    const updateScale = () => {
      const styles = window.getComputedStyle(preview);
      const paddingLeft = parseFloat(styles.paddingLeft);
      const paddingRight = parseFloat(styles.paddingRight);
      const totalPadding = paddingLeft + paddingRight;

      const availableWidth = preview.clientWidth - totalPadding;
      setScale(Math.min(availableWidth / PAPER_WIDTH, 1));
    };
    const observer = new ResizeObserver(updateScale);
    observer.observe(preview);

    return () => observer.disconnect();
  }, []);

  return (
    <VStack
      w="full"
      h="full"
      ref={previewRef}
      bg="gray.100"
      _dark={{ bg: 'gray.800' }}
      overflowY="scroll"
      overflowX="hidden"
      p={4}
      align="center"
      gap={2}
      position="relative"
    >
      {/* Loading indicators */}
      {isGenerating && (
        <Badge
          position="absolute"
          top={4}
          right={4}
          colorScheme="purple"
          variant="solid"
          size="lg"
          zIndex={10}
        >
          ✨ Generating...
        </Badge>
      )}
      {isSaving && !isGenerating && (
        <Badge
          position="absolute"
          top={4}
          right={4}
          colorScheme="blue"
          variant="solid"
          size="sm"
          zIndex={10}
        >
          Saving...
        </Badge>
      )}
      {/* Ghost wrapper - takes up the space of the scaled content */}
      <Box
        width={`${PAPER_WIDTH * scale}px`}
        height={`${PAPER_HEIGHT * scale}px`}
        position="relative"
      >
        {/* The actual paper - overlaid on top */}
        <Box
          position="absolute"
          top={0}
          left={0}
          width={`${PAPER_WIDTH}px`}
          height={`${PAPER_HEIGHT}px`}
          scale={scale}
          transformOrigin="top left"
        >
          <iframe srcDoc={html} width="100%" height="100%" style={{ border: 'none' }} />
        </Box>
      </Box>
    </VStack>
  );
}
