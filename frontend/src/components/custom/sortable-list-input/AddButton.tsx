import { IconButton, type IconButtonProps } from '@chakra-ui/react';
import { PiPlus } from 'react-icons/pi';

import { useSortableListInput } from './contexts';

export function AddButton(props: Omit<IconButtonProps, 'onClick' | 'disabled'>) {
  const { append, defaultItem, disabled, readOnly } = useSortableListInput();

  return (
    <IconButton
      onClick={() => append(defaultItem)}
      variant="ghost"
      size="2xs"
      disabled={disabled || readOnly}
      aria-label="Add item"
      {...props}
    >
      <PiPlus />
    </IconButton>
  );
}
