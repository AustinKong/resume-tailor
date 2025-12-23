import { HStack, type StackProps } from '@chakra-ui/react';
import type { ArrayPath, FieldArray, FieldValues } from 'react-hook-form';

import { useSortableListInput, useSortableListInputItem } from './contexts';

interface ItemProps<T extends FieldValues>
  extends Omit<StackProps, 'onMouseEnter' | 'onMouseLeave'> {
  children: React.ReactNode;
  onMouseEnter?: (item: FieldArray<T, ArrayPath<T>>) => void;
  onMouseLeave?: (item: FieldArray<T, ArrayPath<T>>) => void;
}

export function Item<T extends FieldValues>({
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}: ItemProps<T>) {
  const { fields } = useSortableListInput<T>();
  const { index } = useSortableListInputItem();

  const currentItem = fields[index] as FieldArray<T, ArrayPath<T>>;

  return (
    <HStack
      w="full"
      alignItems="center"
      onMouseEnter={() => onMouseEnter?.(currentItem)}
      onMouseLeave={() => onMouseLeave?.(currentItem)}
      {...props}
    >
      {children}
    </HStack>
  );
}
