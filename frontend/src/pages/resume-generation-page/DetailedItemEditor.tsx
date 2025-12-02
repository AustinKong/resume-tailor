import { HStack, IconButton, Input, Menu, Portal, VStack } from '@chakra-ui/react';
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useRef } from 'react';
import { PiDotsSixVertical, PiDotsThreeVertical } from 'react-icons/pi';

import BulletInput from '@/components/custom/BulletInput';
import type { DetailedItem } from '@/types/resume';

interface DetailedItemEditorProps {
  items: DetailedItem[];
  onItemsChange: (items: DetailedItem[]) => void;
}

export default function DetailedItemEditor({ items, onItemsChange }: DetailedItemEditorProps) {
  const idsRef = useRef<string[]>([]);

  // Sync ids with items length
  if (idsRef.current.length < items.length) {
    idsRef.current.push(
      ...Array.from({ length: items.length - idsRef.current.length }, () => crypto.randomUUID())
    );
  } else if (idsRef.current.length > items.length) {
    idsRef.current = idsRef.current.slice(0, items.length);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: { y: 8 } },
    })
  );

  const addAtIndex = useCallback(
    (index: number) => {
      const newItem: DetailedItem = {
        title: '',
        subtitle: '',
        startDate: '',
        endDate: '',
        bullets: [''],
      };
      const nextItems = [...items];
      nextItems.splice(index, 0, newItem);
      const nextIds = [...idsRef.current];
      nextIds.splice(index, 0, crypto.randomUUID());

      onItemsChange(nextItems);
      idsRef.current = nextIds;
    },
    [items, onItemsChange]
  );

  const removeAtIndex = useCallback(
    (index: number) => {
      if (items.length <= 1) return;

      const nextItems = [...items];
      nextItems.splice(index, 1);
      const nextIds = [...idsRef.current];
      nextIds.splice(index, 1);

      onItemsChange(nextItems);
      idsRef.current = nextIds;
    },
    [items, onItemsChange]
  );

  const updateItem = useCallback(
    (index: number, updatedItem: DetailedItem) => {
      const nextItems = [...items];
      nextItems[index] = updatedItem;
      onItemsChange(nextItems);
    },
    [items, onItemsChange]
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;
      const oldIndex = idsRef.current.indexOf(active.id as string);
      const newIndex = idsRef.current.indexOf(over.id as string);

      idsRef.current = arrayMove(idsRef.current, oldIndex, newIndex);
      onItemsChange(arrayMove(items, oldIndex, newIndex));
    },
    [items, onItemsChange]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={[...idsRef.current]} strategy={verticalListSortingStrategy}>
        <VStack gap="4" w="full" align="stretch">
          {items.map((item, index) => (
            <DetailedItemCard
              key={idsRef.current[index]}
              id={idsRef.current[index]}
              item={item}
              onItemChange={(updatedItem) => updateItem(index, updatedItem)}
              handleInsertAbove={() => addAtIndex(index)}
              handleInsertBelow={() => addAtIndex(index + 1)}
              handleDelete={() => removeAtIndex(index)}
            />
          ))}
        </VStack>
      </SortableContext>
    </DndContext>
  );
}

function DetailedItemCard({
  id,
  item,
  onItemChange,
  handleInsertAbove,
  handleInsertBelow,
  handleDelete,
}: {
  id: string;
  item: DetailedItem;
  onItemChange: (item: DetailedItem) => void;
  handleInsertAbove: () => void;
  handleInsertBelow: () => void;
  handleDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <VStack
      ref={setNodeRef}
      style={style}
      w="full"
      align="stretch"
      p="4"
      borderWidth="1px"
      borderRadius="md"
      bg="bg.panel"
      position="relative"
      zIndex={transform ? 1 : 0}
    >
      <HStack justify="space-between" w="full">
        <HStack
          {...attributes}
          {...listeners}
          cursor="grab"
          color="fg.muted"
          _active={{ cursor: 'grabbing' }}
        >
          <PiDotsSixVertical />
        </HStack>
        <ItemMenu
          handleInsertAbove={handleInsertAbove}
          handleInsertBelow={handleInsertBelow}
          handleDelete={handleDelete}
        />
      </HStack>

      <VStack gap="3" w="full" align="stretch">
        <Input
          placeholder="Title"
          value={item.title}
          onChange={(e) => onItemChange({ ...item, title: e.target.value })}
          variant="flushed"
        />
        <Input
          placeholder="Subtitle (optional)"
          value={item.subtitle ?? ''}
          onChange={(e) => onItemChange({ ...item, subtitle: e.target.value })}
          variant="flushed"
        />
        <HStack w="full">
          <Input
            placeholder="Start Date"
            value={item.startDate ?? ''}
            onChange={(e) => onItemChange({ ...item, startDate: e.target.value })}
            variant="flushed"
          />
          <Input
            placeholder="End Date"
            value={item.endDate ?? ''}
            onChange={(e) => onItemChange({ ...item, endDate: e.target.value })}
            variant="flushed"
          />
        </HStack>
        <BulletInput
          bullets={item.bullets}
          onBulletsChange={(bullets) => onItemChange({ ...item, bullets })}
          label="Bullets"
        />
      </VStack>
    </VStack>
  );
}

function ItemMenu({
  handleInsertAbove,
  handleInsertBelow,
  handleDelete,
}: {
  handleInsertAbove: () => void;
  handleInsertBelow: () => void;
  handleDelete: () => void;
}) {
  function handleSelect({ value }: { value: string }) {
    switch (value) {
      case 'insert-above':
        handleInsertAbove();
        break;
      case 'insert-below':
        handleInsertBelow();
        break;
      case 'delete':
        handleDelete();
        break;
    }
  }

  return (
    <Menu.Root onSelect={handleSelect}>
      <Menu.Trigger asChild>
        <IconButton variant="ghost" size="xs" color="fg.muted">
          <PiDotsThreeVertical />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="insert-above">Insert Above</Menu.Item>
            <Menu.Item value="insert-below">Insert Below</Menu.Item>
            <Menu.Item
              value="delete"
              color="fg.error"
              _hover={{ bg: 'bg.error', color: 'fg.error' }}
            >
              Delete
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
