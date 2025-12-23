import { Icon, type IconProps } from '@chakra-ui/react';
import { memo } from 'react';
import { PiDotOutlineBold } from 'react-icons/pi';

import { useSortableListInput, useSortableListInputItem } from './contexts';

interface MarkerProps extends IconProps {
  children?: React.ReactNode;
}

export const Marker = memo(({ children = <PiDotOutlineBold />, ...props }: MarkerProps) => {
  const { dragHandleProps } = useSortableListInputItem();
  const { disabled, readOnly } = useSortableListInput();

  return (
    <Icon
      {...dragHandleProps.attributes}
      {...dragHandleProps.listeners}
      cursor={disabled || readOnly ? 'default' : 'grab'}
      _active={{ cursor: 'grabbing' }}
      aria-label="Sort"
      size="sm"
      _focus={{ boxShadow: 'none' }}
      outline="none"
      {...props}
    >
      {children}
    </Icon>
  );
});
