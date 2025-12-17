import {
  Badge,
  Checkbox,
  HStack,
  Icon,
  Link as ChakraLink,
  Table as ChakraTable,
  Text,
} from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { PiWarning } from 'react-icons/pi';

import CompanyLogo from '@/components/custom/CompanyLogo';
import { type ScrapingListing } from '@/types/listing';

const columnHelper = createColumnHelper<ScrapingListing>();

const columns = [
  columnHelper.display({
    id: 'select',
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
    cell: (info) => {
      const listing = info.row.original;
      const isFailed = listing.status === 'failed';

      if (isFailed) {
        return (
          <HStack gap={2} alignItems={'center'}>
            <Icon size="lg">
              <PiWarning />
            </Icon>
            <ChakraLink href={listing.url} target="_blank" rel="noopener noreferrer">
              {listing.url}
            </ChakraLink>
          </HStack>
        );
      }

      return (
        <HStack gap={2} alignItems={'center'}>
          <CompanyLogo domain={listing.domain} companyName={listing.company} />
          <Text>
            {listing.company} - {listing.title}
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
  selectedListingId,
  setSelectedListingId,
}: {
  listings: ScrapingListing[];
  selectedListingId: string | null;
  setSelectedListingId: (id: string | null) => void;
}) {
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: listings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  return (
    <ChakraTable.ScrollArea h="full" overflowY="scroll" w="lg" overflowX="hidden">
      <ChakraTable.Root size="sm">
        <ChakraTable.Header>
          {table.getHeaderGroups().map((headerGroup) => (
            <ChakraTable.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <ChakraTable.ColumnHeader key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </ChakraTable.ColumnHeader>
              ))}
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
                <ChakraTable.Cell
                  key={cell.id}
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                  overflow="hidden"
                >
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
