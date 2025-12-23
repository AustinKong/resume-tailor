import { AddButton } from './AddButton';
import { DeleteButton } from './DeleteButton';
import { Input } from './Input';
import { Item } from './Item';
import { Label } from './Label';
import { List } from './List';
import { Marker } from './Marker';
import { Root } from './Root';

/**
 * `SortableListInput` is a compound component for managing draggable, sortable
 * lists of inputs integrated with React Hook Form and dnd-kit.
 *
 * @example
 * interface MySchema {
 *   favouriteAnimals: { value: string; reference: string }[];
 * }
 *
 * const { control, register } = useForm<MySchema>({
 *   defaultValues: { favouriteAnimals: [{ value: "", reference: "" }] }
 * });
 * // Note: The 'reference' field can only be changed via direct manipulation
 * // from React Hook Form or initialized as a default value. Only value is changeable by the user.
 *
 * <SortableListInput.Root<MySchema>
 *   control={control}
 *   register={register}
 *   name="favouriteAnimals"
 * >
 *   <HStack justify="space-between">
 *     <SortableListInput.Label>Favourite Animals</SortableListInput.Label>
 *     <SortableListInput.AddButton />
 *   </HStack>
 *
 *   <SortableListInput.List>
 *     <SortableListInput.Item<MySchema>
 *       onMouseEnter={(item) => console.log(item.value, item.reference)}
 *     >
 *       // To use a custom drag handle icon, pass it as children:
 *       // Defaults to PiDot icon if no children provided.
 *       <SortableListInput.Marker>
 *         <CustomIcon />
 *       </SortableListInput.Marker>
 *       <SortableListInput.Input placeholder="Enter animal..." />
 *       <SortableListInput.DeleteButton />
 *     </SortableListInput.Item>
 *   </SortableListInput.List>
 * </SortableListInput.Root>
 *
 * @note Do not manually map over the items array. The List component handles rendering
 * and mapping internally. Just provide the Item component as a child of List.
 *
 * @template TFieldValues - The shape of the entire form state.
 */
export const SortableListInput = {
  AddButton,
  DeleteButton,
  Marker,
  Input,
  Item,
  Label,
  List,
  Root,
};
