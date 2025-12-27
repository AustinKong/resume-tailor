import { Box, Splitter, type SplitterPanelProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

interface AnimatedSplitterPanelProps extends SplitterPanelProps {
  drawerOpenSize?: number;
}

const Panel = forwardRef<HTMLDivElement, AnimatedSplitterPanelProps>(function AnimatedSplitterPanel(
  { drawerOpenSize, children, ...rest },
  ref
) {
  return (
    <Splitter.Panel ref={ref} {...rest} transition="var(--splitter-transition)">
      {drawerOpenSize !== undefined ? (
        <Box width={`${drawerOpenSize}%`} height="full">
          {children}
        </Box>
      ) : (
        children
      )}
    </Splitter.Panel>
  );
});

export default Panel;
