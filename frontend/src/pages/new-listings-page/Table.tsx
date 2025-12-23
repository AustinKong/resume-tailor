import {
  Badge,
  Checkbox,
  HStack,
  Icon,
  Spinner,
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
import { useListingsQuery } from '@/hooks/listings';
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

      let icon = <CompanyLogo domain={getDomain(listing)} companyName={getCompany(listing)} />;
      let text = listing.url;
      if (listing.status === 'error') {
        icon = (
          <Icon size="lg">
            <PiWarning />
          </Icon>
        );
      } else if (listing.status === 'pending') {
        icon = <Spinner size="sm" />;
      } else {
        text = `${getCompany(listing)} - ${getTitle(listing)}`;
      }

      return (
        <HStack gap={2} alignItems={'center'} w="full" overflow="hidden" minW="0">
          {icon}
          <Text truncate flex={1} minW={0}>
            {text}
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

      return <Badge colorPalette={definition.colorPalette}>{definition.label}</Badge>;
    },
  }),
];

export function Table({
  rowSelection,
  setRowSelection,
  setSelectedListingId,
}: {
  rowSelection: Record<string, boolean>;
  setRowSelection: Dispatch<SetStateAction<Record<string, boolean>>>;
  setSelectedListingId: (id: string | null) => void;
}) {
  const { listings } = useListingsQuery();

  console.log(listings);

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
                const width = header.column.id === 'listing' ? '100%' : 'auto';

                return (
                  <ChakraTable.ColumnHeader key={header.id} w={width}>
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
              onClick={() => setSelectedListingId(row.original.id)}
              cursor="pointer"
            >
              {row.getVisibleCells().map((cell) => {
                const isListing = cell.column.id === 'listing';
                return (
                  <ChakraTable.Cell
                    key={cell.id}
                    maxW={isListing ? '0' : 'none'}
                    w={isListing ? '100%' : 'auto'}
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
