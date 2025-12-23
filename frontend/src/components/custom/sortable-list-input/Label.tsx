import { Text, type TextProps } from '@chakra-ui/react';

import { useSortableListInput } from './contexts';

export function Label(props: TextProps) {
  const { disabled } = useSortableListInput();

  return <Text fontSize="sm" color={disabled ? 'fg.subtle' : undefined} {...props} />;
}
