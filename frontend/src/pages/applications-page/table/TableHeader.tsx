import { HStack, Table as ChakraTable } from '@chakra-ui/react';
import { flexRender, type Table } from '@tanstack/react-table';
import { PiCaretDown, PiCaretUp, PiCaretUpDown } from 'react-icons/pi';

import type { Application } from '@/types/application';

export function TableHeader({ table }: { table: Table<Application> }) {
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
