import { HStack, Icon, IconButton, Text, Textarea, VStack } from '@chakra-ui/react';
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
import { useEffect } from 'react';
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
import { PiPlus, PiX } from 'react-icons/pi';

type BulletInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  name: ArrayPath<TFieldValues>;
  label: string;
  marker?: Marker;
  onItemMouseEnter?: (item: FieldArray<TFieldValues, ArrayPath<TFieldValues>>) => void;
  onItemMouseLeave?: (item: FieldArray<TFieldValues, ArrayPath<TFieldValues>>) => void;
  disabled?: boolean;
  defaultItem: FieldArray<TFieldValues, ArrayPath<TFieldValues>>;
};

type Marker = {
  icon: React.ReactNode;
  color?: IconBaseProps['color'];
};

// TODO: Make this open component composition instead of exposing onItemMouseEnter and onItemMouseLeave etc.
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
  defaultItem,
}: BulletInputProps<TFieldValues>) {
  const { fields, remove, move, append, update } = useFieldArray({
    control,
    name,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: { y: 8 } } })
  );

  useEffect(() => {
    if (fields.length === 0) {
      append(defaultItem);
    }
  }, [fields.length, append, defaultItem]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (disabled) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  const handleRemove = (index: number) => {
    if (fields.length <= 1) {
      update(index, defaultItem);
    } else {
      remove(index);
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
        <VStack align="stretch">
          <HStack justifyContent="space-between" p="0">
            <Text p="0" color={disabled ? 'fg.subtle' : 'fg'} fontSize="sm">
              {label}
            </Text>
            <IconButton
              onClick={() => append(defaultItem)}
              disabled={disabled}
              size="2xs"
              variant="ghost"
            >
              <PiPlus />
            </IconButton>
          </HStack>
          <VStack gap="0.5">
            {fields.map((field, index) => (
              <Bullet<TFieldValues>
                key={field.id}
                id={field.id}
                index={index}
                register={register}
                name={name}
                handleDelete={() => handleRemove(index)}
                marker={marker}
                onItemMouseEnter={onItemMouseEnter}
                onItemMouseLeave={onItemMouseLeave}
                field={field}
                disabled={disabled}
                disableDelete={fields.length <= 1}
              />
            ))}
          </VStack>
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
  handleDelete: () => void;
  marker?: Marker;
  field: FieldArray<TFieldValues, ArrayPath<TFieldValues>>;
  onItemMouseEnter?: (item: FieldArray<TFieldValues, ArrayPath<TFieldValues>>) => void;
  onItemMouseLeave?: (item: FieldArray<TFieldValues, ArrayPath<TFieldValues>>) => void;
  disabled?: boolean;
  disableDelete?: boolean;
};

function Bullet<T extends FieldValues>({
  id,
  index,
  register,
  name,
  handleDelete,
  marker,
  onItemMouseEnter,
  onItemMouseLeave,
  field,
  disabled = false,
  disableDelete = false,
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
    <HStack ref={setNodeRef} style={style} w="full" className="group">
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

      <IconButton
        onClick={handleDelete}
        disabled={disabled || disableDelete}
        size="2xs"
        variant="ghost"
        _groupHover={{ opacity: 1 }}
        color="fg.muted"
        opacity={0.2}
      >
        <PiX />
      </IconButton>
    </HStack>
  );
}
