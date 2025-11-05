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
import { useCallback, useEffect, useRef } from 'react';
import { PiDotsThreeVertical } from 'react-icons/pi';

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
  const idsRef = useRef<string[]>([]);

  // Sync ids with bullets length to ensure keys are always available
  if (idsRef.current.length < bullets.length) {
    idsRef.current.push(
      ...Array.from({ length: bullets.length - idsRef.current.length }, () => crypto.randomUUID())
    );
  } else if (idsRef.current.length > bullets.length) {
    idsRef.current = idsRef.current.slice(0, bullets.length);
  }

  // Ensure there is always at least one bullet.
  useEffect(() => {
    if (bullets.length === 0) {
      idsRef.current = [crypto.randomUUID()];
      onBulletsChange(['']);
    }
  }, [bullets.length, onBulletsChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: { y: 8 } },
    })
  );

  const addAtIndex = useCallback(
    (index: number) => {
      const nextBullets = [...bullets];
      nextBullets.splice(index, 0, '');
      const nextIds = [...idsRef.current];
      nextIds.splice(index, 0, crypto.randomUUID());

      onBulletsChange(nextBullets);
      idsRef.current = nextIds;
    },
    [bullets, onBulletsChange]
  );

  const removeAtIndex = useCallback(
    (index: number) => {
      if (bullets.length <= 1) return;

      const nextBullets = [...bullets];
      nextBullets.splice(index, 1);
      const nextIds = [...idsRef.current];
      nextIds.splice(index, 1);

      onBulletsChange(nextBullets);
      idsRef.current = nextIds;
    },
    [bullets, onBulletsChange]
  );

  const handleChange = useCallback(
    (id: string, content: string) => {
      const index = idsRef.current.indexOf(id);
      const nextBullets = [...bullets];
      nextBullets[index] = content;
      onBulletsChange(nextBullets);
    },
    [bullets, onBulletsChange]
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over || active.id === over.id) return;
      const oldIndex = idsRef.current.indexOf(active.id as string);
      const newIndex = idsRef.current.indexOf(over.id as string);

      idsRef.current = arrayMove(idsRef.current, oldIndex, newIndex);
      onBulletsChange(arrayMove(bullets, oldIndex, newIndex));
    },
    [bullets, onBulletsChange]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext items={[...idsRef.current]} strategy={verticalListSortingStrategy}>
        <Text w="full" p="0" color="fg.muted" fontSize="sm" mb="-3">
          {label}
        </Text>
        <VStack gap="0.5" w="full">
          {bullets.map((content, index) => (
            <Bullet
              key={idsRef.current[index]}
              id={idsRef.current[index]}
              content={content}
              onChange={handleChange}
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
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id,
  });

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
        value={content ?? ''}
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
