import { IconButton, type IconButtonProps } from '@chakra-ui/react';
import { memo } from 'react';
import { PiX } from 'react-icons/pi';

import { useSortableListInput, useSortableListInputItem } from './contexts';

export const DeleteButton = memo((props: Omit<IconButtonProps, 'disabled'>) => {
  const { remove, fields, disabled, readOnly } = useSortableListInput();
  const { index } = useSortableListInputItem();
  const isLocked = disabled || readOnly || fields.length <= 1;

  return (
    <IconButton
      onClick={() => remove(index)}
      variant="ghost"
      size="2xs"
      disabled={isLocked}
      opacity={0.2}
      _groupHover={isLocked ? {} : { opacity: 1 }}
      aria-label="Remove"
      {...props}
    >
      <PiX />
    </IconButton>
  );
});
