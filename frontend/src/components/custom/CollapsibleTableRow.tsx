import { IconButton, Table } from '@chakra-ui/react';
import { type ReactNode, useState } from 'react';
import { LuChevronDown, LuChevronRight } from 'react-icons/lu';

interface CollapsibleTableRowProps {
  children: ReactNode;
  expandedContent: ReactNode;
}

/**
 * Collapsible table row component with smooth expand/collapse animation.
 *
 * Why we can't use Chakra UI's Collapsible component:
 *
 * HTML table structure requires strict parent-child relationships:
 * - `<tbody>` must only contain `<tr>` elements as direct children
 * - Any wrapper element between `<tbody>` and `<tr>` breaks table semantics and layout
 *
 * Chakra's Collapsible.Root, Collapsible.RootProvider, and similar components
 * all render wrapper `<div>` elements in the DOM
 *
 * Attempts made:
 * - as={Fragment}:     Failed - Collapsible.Root needs to pass data attributes which Fragment can't receive
 * - display: contents: Failed - Wrapper div still exists in DOM between `<tbody>` and `<tr>`
 * - RootProvider:      Failed - Also renders a wrapper div
 *
 * This component returns a React Fragment (no DOM wrapper) and uses the CSS Grid
 * technique (grid-template-rows: 0fr → 1fr) for height animations.
 */
export default function CollapsibleTableRow({
  children,
  expandedContent,
}: CollapsibleTableRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Table.Row>
        <Table.Cell width="auto" p="2">
          <IconButton
            size="sm"
            variant="ghost"
            onClick={handleToggle}
            aria-label={isOpen ? 'Collapse row' : 'Expand row'}
          >
            {isOpen ? <LuChevronDown /> : <LuChevronRight />}
          </IconButton>
        </Table.Cell>
        {children}
      </Table.Row>

      <Table.Row>
        <Table.Cell colSpan={100} p="0" overflow="hidden">
          <div
            style={{
              display: 'grid',
              gridTemplateRows: isOpen ? '1fr' : '0fr',
              transition: 'grid-template-rows 0.2s ease-out',
            }}
          >
            <div style={{ overflow: 'hidden' }}>
              <div style={{ padding: '1rem' }}>{expandedContent}</div>
            </div>
          </div>
        </Table.Cell>
      </Table.Row>
    </>
  );
}
