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
    size: 40,
    header: ({ table }) => (
      <Checkbox.Root
        checked={table.getIsAllRowsSelected()}
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
  columnHelper.accessor('title', {
    header: 'Listing',
    size: 0,
    cell: (info) => {
      const listing = info.row.original;
      const isFailed = listing.status === 'failed';

      return (
        <HStack gap={2} alignItems={'center'} w="full" overflow="hidden">
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
    size: 150,
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
    getRowId: (row) => row.id,
    state: {
      rowSelection,
    },
  });

  return (
    <ChakraTable.ScrollArea h="full" overflowY="scroll" w="full" overflowX="hidden">
      <ChakraTable.Root size="sm" tableLayout="fixed" stickyHeader interactive>
        <ChakraTable.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <ChakraTable.Row key={headerGroup.id} bg="bg.subtle">
              {headerGroup.headers.map((header) => {
                const width = header.column.columnDef.size
                  ? `${header.column.columnDef.size}px`
                  : 'auto';

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
              onClick={() =>
                setSelectedListingId(selectedListingId === row.original.id ? null : row.original.id)
              }
              cursor="pointer"
            >
              {row.getVisibleCells().map((cell) => (
                <ChakraTable.Cell key={cell.id} overflow="hidden">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </ChakraTable.Cell>
              ))}
            </ChakraTable.Row>
          ))}
        </ChakraTable.Body>
      </ChakraTable.Root>
    </ChakraTable.ScrollArea>
  );
}
