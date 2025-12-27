import { Splitter, type SplitterPanelProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

export const Panel = forwardRef<HTMLDivElement, SplitterPanelProps>(
  function AnimatedSplitterPanel(props, ref) {
    return <Splitter.Panel ref={ref} {...props} transition="var(--splitter-transition)" />;
  }
);
