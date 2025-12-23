import { VStack } from '@chakra-ui/react';
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import React, { useEffect, useMemo } from 'react';
import {
  type ArrayPath,
  type Control,
  type FieldArray,
  type FieldValues,
  useFieldArray,
  type UseFormRegister,
} from 'react-hook-form';

import { SortableListInputContext } from './contexts';

export function Root<T extends FieldValues>({
  control,
  register,
  name,
  children,
  disabled,
  readOnly,
}: {
  control: Control<T>;
  register: UseFormRegister<T>;
  name: ArrayPath<T>;
  children: React.ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const { fields, remove, move, append, update, insert } = useFieldArray({ control, name });

  const defaultItem = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rootDefaults = (control._defaultValues as any)?.[name];
    const itemDefault = Array.isArray(rootDefaults) ? rootDefaults[0] : {};
    return itemDefault as FieldArray<T, ArrayPath<T>>;
  }, [control._defaultValues, name]);

  useEffect(() => {
    if (fields.length === 0) append(defaultItem);
  }, [fields.length, append, defaultItem]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: { y: 8 } } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (disabled || readOnly) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  const contextValue = useMemo(
    () => ({
      fields,
      append,
      remove,
      insert,
      update,
      register,
      name,
      disabled,
      readOnly,
      defaultItem,
    }),
    [fields, append, remove, insert, update, register, name, disabled, readOnly, defaultItem]
  );

  return (
    <SortableListInputContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <VStack gap="0" alignItems="stretch" w="full">
          {children}
        </VStack>
      </DndContext>
    </SortableListInputContext.Provider>
  );
}
