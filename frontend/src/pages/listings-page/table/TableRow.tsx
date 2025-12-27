import { Table as ChakraTable } from '@chakra-ui/react';
import { flexRender, type Row } from '@tanstack/react-table';

import type { ListingSummary } from '@/types/listing';

export function TableRow({
  row,
  onRowClick,
  onRowHover,
}: {
  row: Row<ListingSummary>;
  onRowClick: () => void;
  onRowHover: () => void;
}) {
  return (
    <ChakraTable.Row onClick={onRowClick} onMouseEnter={onRowHover} cursor="pointer">
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
