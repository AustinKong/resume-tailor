import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { createContext, useContext } from 'react';
import type {
  ArrayPath,
  FieldArray,
  FieldValues,
  UseFieldArrayReturn,
  UseFormRegister,
} from 'react-hook-form';

export type SortableListInputContextValue<T extends FieldValues> = {
  name: ArrayPath<T>;
  register: UseFormRegister<T>;
  disabled?: boolean;
  readOnly?: boolean;
  defaultItem: FieldArray<T, ArrayPath<T>>;
} & Pick<UseFieldArrayReturn<T>, 'fields' | 'append' | 'remove' | 'insert' | 'update'>;

// Because RHF's types are recursively defined, making it hard to type properly
export const SortableListInputContext = createContext<unknown>(null);

export const useSortableListInput = <T extends FieldValues>() => {
  const ctx = useContext(SortableListInputContext);
  if (!ctx) throw new Error('useSortableListInput must be used within SortableListInput.Root');
  return ctx as SortableListInputContextValue<T>;
};

export type SortableListInputItemContextValue = {
  id: string;
  index: number;
  isDragging: boolean;
  dragHandleProps: {
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
  };
};

export const SortableListInputItemContext = createContext<SortableListInputItemContextValue | null>(
  null
);

export const useSortableListInputItem = () => {
  const ctx = useContext(SortableListInputItemContext);
  if (!ctx) throw new Error('useSortableListInputItem must be used within SortableListInput.List');
  return ctx;
};
