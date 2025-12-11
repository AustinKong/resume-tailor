import { Badge, Center, HStack, Spinner, Table as ChakraTable, Text } from '@chakra-ui/react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  type OnChangeFn,
  type Row,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect } from 'react';
import React from 'react';
import { PiCaretDown, PiCaretUp, PiCaretUpDown } from 'react-icons/pi';
import { useInView } from 'react-intersection-observer';

import CompanyLogo from '@/components/custom/CompanyLogo';
import { STATUS_DEFINITIONS } from '@/constants/statuses';
import type { Application, StatusEnum } from '@/types/application';

import StatusFilterMenu from './StatusFilter';

interface TableMetaType {
  onStatusesChange: (statuses: StatusEnum[]) => void;
  statuses: StatusEnum[];
}

const columnHelper = createColumnHelper<Application>();

const columns = [
  columnHelper.accessor('listing.company', {
    id: 'company',
    header: 'Company',
    cell: (info) => {
      const company = info.getValue();
      const domain = info.row.original.listing.domain;

      return (
        <HStack gap={2} alignItems={'center'}>
          <CompanyLogo domain={domain} companyName={company} size="2xs" />
          <Text>{company}</Text>
        </HStack>
      );
    },
    size: 15,
  }),
  columnHelper.accessor('listing.title', {
    id: 'title',
    header: 'Role',
    cell: (info) => info.getValue(),
    size: 25,
  }),
  columnHelper.accessor('currentStatus', {
    header: ({ table }) => {
      const { onStatusesChange, statuses } = (table.options.meta as TableMetaType) || {};
      return <StatusFilterMenu currentStatuses={statuses} onStatusesChange={onStatusesChange} />;
    },
    cell: (info) => {
      const status = info.getValue();
      const stage = info.row.original.currentStage;
      const statusInfo = STATUS_DEFINITIONS[status];

      return (
        <Badge variant="subtle" colorPalette={statusInfo.colorPalette}>
          <HStack gap={1}>
            <statusInfo.icon />
            <Text>{statusInfo.label}</Text>
            {stage > 0 && <Text>{stage}</Text>}
          </HStack>
        </Badge>
      );
    },
    size: 15,
    enableSorting: false,
  }),
  columnHelper.accessor('listing.location', {
    header: 'Location',
    cell: (info) => info.getValue(),
    size: 15,
    enableSorting: false,
  }),
  columnHelper.accessor('listing.postedDate', {
    id: 'posted_at',
    header: 'Posted',
    cell: (info) => info.getValue(),
    size: 15,
    sortDescFirst: false,
  }),
  columnHelper.accessor('timeline', {
    id: 'updated_at',
    header: 'Last Updated',
    cell: (info) => info.getValue()[0].createdAt,
    size: 15,
    sortDescFirst: false,
  }),
];

function TableHeader({ table }: { table: ReturnType<typeof useReactTable<Application>> }) {
  return (
    <ChakraTable.Header>
      {table.getHeaderGroups().map((headerGroup) => (
        <ChakraTable.Row key={headerGroup.id} bg="bg.subtle">
          {headerGroup.headers.map((header) => {
            const canSort = header.column.getCanSort();
            return (
              <ChakraTable.ColumnHeader
                key={header.id}
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                overflow="hidden"
              >
                <HStack
                  alignItems="center"
                  userSelect="none"
                  cursor={canSort ? 'pointer' : 'default'}
                  onClick={header.column.getToggleSortingHandler()}
                  display="inline-flex"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}

                  {header.column.getCanSort() &&
                    ({
                      asc: <PiCaretUp />,
                      desc: <PiCaretDown />,
                    }[header.column.getIsSorted() as string] ?? <PiCaretUpDown />)}
                </HStack>
              </ChakraTable.ColumnHeader>
            );
          })}
        </ChakraTable.Row>
      ))}
    </ChakraTable.Header>
  );
}

function TableRow({
  row,
  onRowClick,
  onRowHover,
}: {
  row: Row<Application>;
  onRowClick: () => void;
  onRowHover: () => void;
}) {
  return (
    <ChakraTable.Row
      cursor="pointer"
      _hover={{ bg: 'bg.subtle' }}
      onClick={onRowClick}
      onMouseEnter={onRowHover}
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
  );
}

function TableFooter({
  onFetchNext,
  hasNextPage,
  isLoading,
}: {
  onFetchNext: () => void;
  hasNextPage: boolean;
  isLoading: boolean;
}) {
  const { ref, inView } = useInView({
    rootMargin: '200px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isLoading) {
      onFetchNext();
    }
  }, [inView, hasNextPage, isLoading, onFetchNext]);

  return (
    <ChakraTable.Row>
      <ChakraTable.Cell colSpan={columns.length} p="0">
        <Center ref={ref} h="10">
          {isLoading && <Spinner size="sm" />}

          {!hasNextPage && !isLoading && (
            <Text fontSize="xs" color="fg.subtle">
              No more applications
            </Text>
          )}
        </Center>
      </ChakraTable.Cell>
    </ChakraTable.Row>
  );
}

function Table({
  data,
  fetchNextPage,
  hasNextPage,
  isLoading,
  onRowClick,
  onRowHover,
  sorting,
  setSorting,
  onStatusesChange,
  statuses,
}: {
  data: Application[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isLoading: boolean;
  onRowClick: (application: Application) => void;
  onRowHover: (id: string) => void;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  onStatusesChange: (statuses: StatusEnum[]) => void;
  statuses: StatusEnum[];
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    manualSorting: true,
    defaultColumn: {
      minSize: 0,
      size: 0,
    },
    meta: {
      onStatusesChange,
      statuses,
    },
  });

  return (
    <ChakraTable.ScrollArea
      h="full"
      overflowY="scroll"
      borderTop="1px solid"
      borderColor="border"
      flex="1"
    >
      <ChakraTable.Root size="sm" stickyHeader tableLayout="fixed">
        <ChakraTable.ColumnGroup>
          {table.getLeafHeaders().map((header) => (
            <ChakraTable.Column key={header.id} htmlWidth={`${header.getSize()}%`} />
          ))}
        </ChakraTable.ColumnGroup>

        <TableHeader table={table} />

        <ChakraTable.Body>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              row={row}
              onRowClick={() => onRowClick(row.original)}
              onRowHover={() => onRowHover(row.original.id)}
            />
          ))}
          <TableFooter
            onFetchNext={fetchNextPage}
            hasNextPage={hasNextPage}
            isLoading={isLoading}
          />
        </ChakraTable.Body>
      </ChakraTable.Root>
    </ChakraTable.ScrollArea>
  );
}

// Table is a very heavy component to render, so we memoize it. But its props MUST be stable.
export default React.memo(Table);
