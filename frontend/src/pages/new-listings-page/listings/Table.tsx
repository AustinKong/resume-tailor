import { Badge, Checkbox, HStack, Icon, Table as ChakraTable, Text } from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { Dispatch, SetStateAction } from 'react';
import { PiWarning } from 'react-icons/pi';

import CompanyLogo from '@/components/custom/CompanyLogo';
import { type ScrapingListing } from '@/types/listing';

const columnHelper = createColumnHelper<ScrapingListing>();

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
        disabled={!row.getCanSelect()}
      >
        {/* TODO: Add an explaination why this is disabled (tooltip) */}
        <Checkbox.HiddenInput />
        <Checkbox.Control />
      </Checkbox.Root>
    ),
  }),
  columnHelper.accessor('title', {
    header: 'Listing',
    cell: (info) => {
      const listing = info.row.original;
      const isFailed = listing.status === 'failed';

      return (
        <HStack gap={2} alignItems={'center'} w="full" overflow="hidden" minW="0">
          {isFailed ? (
            <Icon size="lg" flexShrink={0}>
              <PiWarning />
            </Icon>
          ) : (
            <CompanyLogo domain={listing.domain} companyName={listing.company} flexShrink={0} />
          )}
          <Text truncate flex={1} minW={0}>
            {isFailed ? listing.url : `${listing.company} - ${listing.title}`}
          </Text>
        </HStack>
      );
    },
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => {
      const status = info.getValue();
      let colorScheme: string = 'gray';
      let label: string = status;

      switch (status) {
        case 'completed':
          colorScheme = 'green';
          label = 'OK';
          break;
        case 'duplicate_url':
          colorScheme = 'orange';
          label = 'Duplicate (URL)';
          break;
        case 'duplicate_semantic':
          colorScheme = 'yellow';
          label = 'Duplicate (Semantic)';
          break;
        case 'failed':
          colorScheme = 'red';
          label = 'Failed';
          break;
      }

      return <Badge colorScheme={colorScheme}>{label}</Badge>;
    },
  }),
];

export default function Table({
  listings,
  rowSelection,
  setRowSelection,
  selectedListingId,
  setSelectedListingId,
}: {
  listings: ScrapingListing[];
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
    enableRowSelection: (row) => row.original.status !== 'duplicate_url',
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
                const isListing = header.column.id === 'title';
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
                const isListing = cell.column.id === 'title';
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
