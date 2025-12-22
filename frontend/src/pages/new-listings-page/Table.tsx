import {
  Badge,
  Checkbox,
  HStack,
  Icon,
  Loader,
  Table as ChakraTable,
  Text,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { Dispatch, SetStateAction } from 'react';
import { PiWarning } from 'react-icons/pi';

import { CompanyLogo } from '@/components/custom/CompanyLogo';
import {
  DRAFT_LISTING_DEFINITIONS,
  getCompany,
  getDomain,
  getTitle,
} from '@/constants/draftListings';
import { type ListingDraft } from '@/types/listing';

const columnHelper = createColumnHelper<ListingDraft>();

const columns = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <Checkbox.Root
        checked={table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllRowsSelected()}
        onCheckedChange={(changes) => table.toggleAllRowsSelected(!!changes.checked)}
        aria-label="Select all rows"
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
      </Checkbox.Root>
    ),
    cell: ({ row }) => (
      <Checkbox.Root
        checked={row.getIsSelected()}
        onCheckedChange={(changes) => row.toggleSelected(!!changes.checked)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Select row"
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
      </Checkbox.Root>
    ),
  }),
  columnHelper.accessor('listing', {
    id: 'listing',
    header: 'Listing',
    cell: (info) => {
      const listing = info.row.original;
      const isError = listing.status === 'error';
      const isPending = listing.status === 'pending';

      return (
        <HStack gap={2} alignItems={'center'} w="full" overflow="hidden" minW="0">
          {isError ? (
            <Icon size="lg" flexShrink={0}>
              <PiWarning />
            </Icon>
          ) : isPending ? (
            <Loader flexShrink={0} />
          ) : (
            <CompanyLogo
              domain={getDomain(listing)}
              companyName={getCompany(listing)}
              flexShrink={0}
            />
          )}
          <Text truncate flex={1} minW={0}>
            {isError || isPending ? listing.url : `${getCompany(listing)} - ${getTitle(listing)}`}
          </Text>
        </HStack>
      );
    },
  }),
  columnHelper.accessor('status', {
    id: 'status',
    header: 'Status',
    cell: (info) => {
      const status = info.getValue();
      const definition = DRAFT_LISTING_DEFINITIONS[status];

      return <Badge colorScheme={definition.colorPalette}>{definition.label}</Badge>;
    },
  }),
];

export function Table({
  listings,
  rowSelection,
  setRowSelection,
  selectedListingId,
  setSelectedListingId,
}: {
  listings: ListingDraft[];
  rowSelection: Record<string, boolean>;
  setRowSelection: Dispatch<SetStateAction<Record<string, boolean>>>;
  selectedListingId: string | null;
  setSelectedListingId: (id: string | null) => void;
}) {
  const table = useReactTable({
    data: listings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    state: {
      rowSelection,
    },
  });

  return (
    <ChakraTable.ScrollArea h="full" overflowY="scroll" w="full" overflowX="hidden">
      <ChakraTable.Root size="sm" stickyHeader interactive>
        <ChakraTable.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <ChakraTable.Row key={headerGroup.id} bg="bg.subtle">
              {headerGroup.headers.map((header) => {
                // TODO: Abit complex, is there no native way to do this?
                const isListing = header.column.id === 'listing';
                const width = isListing ? '100%' : 'auto';
                const whiteSpace = isListing ? 'normal' : 'nowrap';

                return (
                  <ChakraTable.ColumnHeader key={header.id} w={width} whiteSpace={whiteSpace}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </ChakraTable.ColumnHeader>
                );
              })}
            </ChakraTable.Row>
          ))}
        </ChakraTable.Header>
        <ChakraTable.Body>
          {table.getRowModel().rows.map((row) => (
            <ChakraTable.Row
              key={row.id}
              onClick={() =>
                setSelectedListingId(selectedListingId === row.original.id ? null : row.original.id)
              }
              cursor="pointer"
            >
              {row.getVisibleCells().map((cell) => {
                const isListing = cell.column.id === 'listing';
                return (
                  <ChakraTable.Cell
                    key={cell.id}
                    maxW={isListing ? '0' : 'none'}
                    w={isListing ? '100%' : 'auto'}
                    whiteSpace={isListing ? 'normal' : 'nowrap'}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </ChakraTable.Cell>
                );
              })}
            </ChakraTable.Row>
          ))}
        </ChakraTable.Body>
      </ChakraTable.Root>
    </ChakraTable.ScrollArea>
  );
}
