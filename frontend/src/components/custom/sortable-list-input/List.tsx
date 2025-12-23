import { Box, type StackProps, VStack } from '@chakra-ui/react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { memo, useMemo } from 'react';

import { SortableListInputItemContext, useSortableListInput } from './contexts';

export function List({ children, ...props }: StackProps) {
  const { fields, disabled, readOnly } = useSortableListInput();

  return (
    <SortableContext
      items={fields}
      strategy={verticalListSortingStrategy}
      disabled={disabled || readOnly}
    >
      <VStack align="stretch" gap="0" {...props}>
        {fields.map((field: { id: string }, index: number) => (
          <ItemKeyProvider key={field.id} id={field.id} index={index}>
            {children}
          </ItemKeyProvider>
        ))}
      </VStack>
    </SortableContext>
  );
}

const ItemKeyProvider = memo(
  ({ id, index, children }: { id: string; index: number; children: React.ReactNode }) => {
    const { disabled, readOnly } = useSortableListInput();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id,
      disabled: disabled || readOnly,
    });

    const style = {
      transform: CSS.Translate.toString(transform),
      transition,
      zIndex: isDragging ? 2 : 1,
      opacity: isDragging ? 0.6 : 1,
    };

    const contextValue = useMemo(
      () => ({
        id,
        index,
        isDragging,
        dragHandleProps: { attributes, listeners },
      }),
      [id, index, isDragging, attributes, listeners]
    );

    return (
      <SortableListInputItemContext.Provider value={contextValue}>
        <Box ref={setNodeRef} style={style} w="full" className="group">
          {children}
        </Box>
      </SortableListInputItemContext.Provider>
    );
  }
);
