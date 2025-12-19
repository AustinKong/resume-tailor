import { HStack, Icon, IconButton, Menu, Portal, Text, Textarea, VStack } from '@chakra-ui/react';
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  type ArrayPath,
  type Control,
  type FieldArray,
  type FieldValues,
  type Path,
  useFieldArray,
  type UseFormRegister,
} from 'react-hook-form';
import type { IconBaseProps } from 'react-icons';
import { PiDotsThreeVertical } from 'react-icons/pi';

type BulletInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  name: ArrayPath<TFieldValues>;
  label: string;
  marker?: Marker;
  onItemMouseEnter?: (item: FieldArray<TFieldValues, ArrayPath<TFieldValues>>) => void;
  onItemMouseLeave?: (item: FieldArray<TFieldValues, ArrayPath<TFieldValues>>) => void;
  disabled?: boolean;
};

type Marker = {
  icon: React.ReactNode;
  color?: IconBaseProps['color'];
};

/**
 * BulletInput is a draggable, sortable input component integrated with React Hook Form.
 *
 * @template TFieldValues - The shape of the form values.
 *
 * @param props.control - The `control` object from `useForm`. Required for state management.
 * @param props.register - The `register` function from `useForm`. Used to bind inputs.
 * @param props.name - The path to the array field in the form data.
 * **Important:** The array schema must be an array of objects containing a `value` key.
 * Example: `[{ value: "Item 1" }, { value: "Item 2" }]`.
 * @param props.label - The label text displayed above the list.
 */
export default function BulletInput<TFieldValues extends FieldValues>({
  control,
  register,
  name,
  label,
  marker,
  onItemMouseEnter,
  onItemMouseLeave,
  disabled = false,
}: BulletInputProps<TFieldValues>) {
  const { fields, remove, move, insert } = useFieldArray({
    control,
    name,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: { y: 8 } } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (disabled) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext items={fields} strategy={verticalListSortingStrategy} disabled={disabled}>
        <Text w="full" p="0" color={disabled ? 'fg.subtle' : 'fg.error'} fontSize="sm" mb="-3">
          {label}
        </Text>
        <VStack gap="0.5" w="full">
          {fields.map((field, index) => (
            <Bullet<TFieldValues>
              key={field.id}
              id={field.id}
              index={index}
              register={register}
              name={name}
              handleInsertAbove={() => insert(index, { value: '' } as Parameters<typeof insert>[1])}
              handleInsertBelow={() =>
                insert(index + 1, { value: '' } as Parameters<typeof insert>[1])
              }
              handleDelete={() => remove(index)}
              marker={marker}
              onItemMouseEnter={onItemMouseEnter}
              onItemMouseLeave={onItemMouseLeave}
              field={field}
              disabled={disabled}
            />
          ))}
        </VStack>
      </SortableContext>
    </DndContext>
  );
}

type BulletProps<TFieldValues extends FieldValues> = {
  id: string;
  index: number;
  register: UseFormRegister<TFieldValues>;
  name: ArrayPath<TFieldValues>;
  handleInsertAbove: () => void;
  handleInsertBelow: () => void;
  handleDelete: () => void;
  marker?: Marker;
  field: FieldArray<TFieldValues, ArrayPath<TFieldValues>>;
  onItemMouseEnter?: (item: FieldArray<TFieldValues, ArrayPath<TFieldValues>>) => void;
  onItemMouseLeave?: (item: FieldArray<TFieldValues, ArrayPath<TFieldValues>>) => void;
  disabled?: boolean;
};

function Bullet<T extends FieldValues>({
  id,
  index,
  register,
  name,
  handleInsertAbove,
  handleInsertBelow,
  handleDelete,
  marker,
  onItemMouseEnter,
  onItemMouseLeave,
  field,
  disabled = false,
}: BulletProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <HStack ref={setNodeRef} style={style} w="full">
      {marker ? (
        <Icon
          {...attributes}
          {...listeners}
          color={marker.color}
          mb="auto"
          mt="0.5rem"
          cursor={disabled ? 'default' : 'grab'}
          size="sm"
          _active={disabled ? {} : { cursor: 'grabbing' }}
          _focus={{ boxShadow: 'none' }}
          outline="none"
        >
          {marker.icon}
        </Icon>
      ) : (
        <Text
          {...attributes}
          {...listeners}
          mb="auto"
          mt="0.25rem"
          ml="2"
          cursor={disabled ? 'default' : 'grab'}
          _active={disabled ? {} : { cursor: 'grabbing' }}
        >
          •
        </Text>
      )}

      <Textarea
        {...register(`${name}.${index}.value` as Path<T>, { disabled })}
        rows={1}
        variant="flushed"
        py="1.5"
        // Less jittery than autoresize
        css={{ fieldSizing: 'content' }}
        spellCheck="false"
        resize="none"
        onMouseEnter={() => onItemMouseEnter?.(field)}
        onMouseLeave={() => onItemMouseLeave?.(field)}
      />

      <BulletMenu
        handleInsertAbove={handleInsertAbove}
        handleInsertBelow={handleInsertBelow}
        handleDelete={handleDelete}
        disabled={disabled}
      />
    </HStack>
  );
}

function BulletMenu({
  handleInsertAbove,
  handleInsertBelow,
  handleDelete,
  disabled,
}: {
  handleInsertAbove: () => void;
  handleInsertBelow: () => void;
  handleDelete: () => void;
  disabled?: boolean;
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
      <Menu.Trigger asChild disabled={disabled}>
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
