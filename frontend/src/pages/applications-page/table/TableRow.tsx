import { Table as ChakraTable } from '@chakra-ui/react';
import { flexRender, type Row } from '@tanstack/react-table';

import type { Application } from '@/types/application';

export default function TableRow({
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
