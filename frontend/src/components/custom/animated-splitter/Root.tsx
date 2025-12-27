import { Splitter, type SplitterRootProps } from '@chakra-ui/react';
import { type CSSProperties, forwardRef, useState } from 'react';

const Root = forwardRef<HTMLDivElement, SplitterRootProps>(function AnimatedSplitterRoot(
  { onResizeStart, onResizeEnd, style, ...props },
  ref
) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Splitter.Root
      ref={ref}
      {...props}
      onResizeStart={() => {
        setIsDragging(true);
        onResizeStart?.();
      }}
      onResizeEnd={(e) => {
        setIsDragging(false);
        onResizeEnd?.(e);
      }}
      style={
        {
          ...style,
          '--splitter-transition': isDragging ? 'none' : 'flex 0.3s cubic-bezier(0.2, 0, 0, 1)',
        } as CSSProperties
      }
    >
      {props.children}
    </Splitter.Root>
  );
});

export default Root;
