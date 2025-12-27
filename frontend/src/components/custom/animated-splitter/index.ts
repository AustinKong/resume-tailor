import { Splitter } from '@chakra-ui/react';

import { Panel } from './Panel';
import { Root } from './Root';

const ResizeTrigger = Splitter.ResizeTrigger;
const ResizeTriggerSeparator = Splitter.ResizeTriggerSeparator;

/**
 * Remarks:
 * This component performs DOM layout changes while animating which can trigger text reflow and
 * layout thrashing. Those effects may produce janky interactions (stuttering, input focus loss,
 * high CPU usage) and generally degrade user experience—especially in text-heavy or
 * performance-sensitive UIs.
 *
 * @deprecated Not recommended for use due to text reflow/layout thrashing issues which result in poor UX.
 */
export const AnimatedSplitter = {
  Root,
  Panel,
  ResizeTrigger,
  ResizeTriggerSeparator,
};
