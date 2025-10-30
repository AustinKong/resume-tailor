import { HStack, IconButton, Menu, Text, Textarea, VStack } from '@chakra-ui/react';
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PiDotsThreeVertical } from 'react-icons/pi';

type SortableItem = {
  id: string;
  content: string;
};

/**
 * BulletInput is a draggable, sortable input component for managing a list of bullet points.
 * It allows users to add, edit, delete, and reorder bullets via drag-and-drop and a context menu.
 *
 * @param bullets - Array of strings representing the current bullet points.
 * @param onBulletsChange - Callback function invoked when the bullets array changes (e.g., on edit, add, delete, or reorder).
 * @param label - Label text displayed above the bullet list.
 */
export default function BulletInput({
  bullets,
  onBulletsChange,
  label,
}: {
  bullets: string[];
  onBulletsChange: (bullets: string[]) => void;
  label: string;
}) {
  const [sortableItems, setSortableItems] = useState<SortableItem[]>(
    bullets.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      content: item,
    }))
  );

  useEffect(() => {
    const internalContent = sortableItems.map((item) => item.content);
    const externalContent = bullets;

    if (JSON.stringify(internalContent) !== JSON.stringify(externalContent)) {
      setSortableItems(
        bullets.map((item, index) => ({
          id: `item-${Date.now()}-${index}`,
          content: item,
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bullets]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: { y: 8 } },
    })
  );

  const itemIds = useMemo(() => sortableItems.map((item) => item.id), [sortableItems]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = sortableItems.findIndex((item) => item.id === active.id);
        const newIndex = sortableItems.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(sortableItems, oldIndex, newIndex);

        setSortableItems(newItems);
        onBulletsChange(newItems.map((item) => item.content));
      }
    },
    [sortableItems, onBulletsChange]
  );

  const onBulletContentChange = useCallback(
    (id: string, content: string) => {
      const newItems = sortableItems.map((item) => (item.id === id ? { ...item, content } : item));
      setSortableItems(newItems);
      onBulletsChange(newItems.map((item) => item.content));
    },
    [sortableItems, onBulletsChange]
  );

  const addBulletAtIndex = useCallback(
    (index: number) => {
      const newItem: SortableItem = {
        id: `item-${Date.now()}`,
        content: '',
      };

      const newItems = [...sortableItems];
      newItems.splice(index, 0, newItem);
      setSortableItems(newItems);
      onBulletsChange(newItems.map((item) => item.content));
    },
    [sortableItems, onBulletsChange]
  );

  const deleteBullet = useCallback(
    (id: string) => {
      const newItems = sortableItems.filter((item) => item.id !== id);
      setSortableItems(newItems);
      onBulletsChange(newItems.map((item) => item.content));
    },
    [sortableItems, onBulletsChange]
  );

  const insertBulletAbove = useCallback(
    (id: string) => {
      const index = sortableItems.findIndex((item) => item.id === id);
      addBulletAtIndex(index);
    },
    [sortableItems, addBulletAtIndex]
  );

  const insertBulletBelow = useCallback(
    (id: string) => {
      const index = sortableItems.findIndex((item) => item.id === id);
      addBulletAtIndex(index + 1);
    },
    [sortableItems, addBulletAtIndex]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <Text w="full" p="0" color="fg.muted" fontSize="sm" mb="-3">
          {label}
        </Text>
        <VStack gap="0.5" w="full">
          {sortableItems.map((item) => (
            <Bullet
              key={item.id}
              id={item.id}
              content={item.content}
              onChange={onBulletContentChange}
              handleInsertAbove={insertBulletAbove}
              handleInsertBelow={insertBulletBelow}
              handleDelete={deleteBullet}
            />
          ))}
        </VStack>
      </SortableContext>
    </DndContext>
  );
}

function Bullet({
  id,
  content,
  onChange,
  handleInsertAbove,
  handleInsertBelow,
  handleDelete,
}: {
  id: string;
  content: string;
  onChange: (id: string, content: string) => void;
  handleInsertAbove: (id: string) => void;
  handleInsertBelow: (id: string) => void;
  handleDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <HStack ref={setNodeRef} style={style} {...attributes} {...listeners} w="full">
      <Text mb="auto" pt="0.25rem" pl="2" cursor="grab">
        •
      </Text>
      <Textarea
        value={content}
        onChange={(e) => onChange(id, e.target.value)}
        rows={1}
        autoresize
        variant="flushed"
        spellCheck="false"
        py="1.5"
      />
      <BulletMenu
        handleInsertAbove={handleInsertAbove}
        handleInsertBelow={handleInsertBelow}
        handleDelete={handleDelete}
        id={id}
      />
    </HStack>
  );
}

function BulletMenu({
  handleInsertAbove,
  handleInsertBelow,
  handleDelete,
  id,
}: {
  handleInsertAbove: (id: string) => void;
  handleInsertBelow: (id: string) => void;
  handleDelete: (id: string) => void;
  id: string;
}) {
  function handleSelect({ value }: { value: string }) {
    switch (value) {
      case 'insert-above':
        handleInsertAbove(id);
        break;
      case 'insert-below':
        handleInsertBelow(id);
        break;
      case 'delete':
        handleDelete(id);
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
      <Menu.Positioner>
        <Menu.Content>
          <Menu.Item value="insert-above">Insert Above</Menu.Item>
          <Menu.Item value="insert-below">Insert Below</Menu.Item>
          <Menu.Item value="delete" color="fg.error" _hover={{ bg: 'bg.error', color: 'fg.error' }}>
            Delete
          </Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}
