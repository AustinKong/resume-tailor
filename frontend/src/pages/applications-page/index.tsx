import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  Menu,
  Portal,
  Spacer,
  Spinner,
  Table,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  type OnChangeFn,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  PiArrowLeft,
  PiBookmarkSimple,
  PiCaretDown,
  PiCaretUp,
  PiCaretUpDown,
  PiCheckCircle,
  PiDownload,
  PiEye,
  PiGhost,
  PiHandHeart,
  PiMagnifyingGlass,
  PiMicrophone,
  PiPaperPlaneTilt,
  PiPlus,
  PiSliders,
  PiX,
  PiXCircle,
} from 'react-icons/pi';
import { useInView } from 'react-intersection-observer';
import { Link, useSearchParams } from 'react-router';

import CompanyLogo from '@/components/custom/CompanyLogo';
import { useDebounce } from '@/hooks/utils/useDebounce';
import { getApplications } from '@/services/applications';
import type { Application, StatusEnum } from '@/types/application';

import ApplicationDrawer from './Drawer';

// TODO: Format dates
// TODO: Add button linking to resume

interface TableMetaType {
  statusOptions?: { value: StatusEnum; label: string; icon: ReactNode }[];
  onStatusesChange?: (statuses: StatusEnum[]) => void;
  statuses?: StatusEnum[];
}

function StatusFilterMenu({
  statusOptions,
  currentStatuses,
  onStatusesChange,
}: {
  statusOptions: { value: StatusEnum; label: string; icon: ReactNode }[];
  currentStatuses: StatusEnum[];
  onStatusesChange: (statuses: StatusEnum[]) => void;
}) {
  const [draftStatuses, setDraftStatuses] = useState<StatusEnum[]>(currentStatuses);
  const [isOpen, setIsOpen] = useState(false);

  // Update draft when current statuses change (e.g., from URL)
  useEffect(() => {
    setDraftStatuses(currentStatuses);
  }, [currentStatuses]);

  // Check if draft is different from current (dirty)
  const isDirty = useMemo(() => {
    if (draftStatuses.length !== currentStatuses.length) return true;
    return (
      draftStatuses.some((status) => !currentStatuses.includes(status)) ||
      currentStatuses.some((status) => !draftStatuses.includes(status))
    );
  }, [draftStatuses, currentStatuses]);

  const handleDraftStatusChange = (status: StatusEnum, checked: boolean) => {
    setDraftStatuses((prev) => {
      if (checked) {
        return [...prev, status];
      } else {
        return prev.filter((s) => s !== status);
      }
    });
  };

  const handleOpenChange = (details: { open: boolean }) => {
    setIsOpen(details.open);
    // Reset draft to current when menu opens
    if (details.open) {
      setDraftStatuses(currentStatuses);
    }
  };

  const handleApply = () => {
    onStatusesChange(draftStatuses);
    setIsOpen(false); // Close the menu after applying
  };

  return (
    <Menu.Root closeOnSelect={false} open={isOpen} onOpenChange={handleOpenChange}>
      <Menu.Trigger asChild>
        <HStack
          alignItems="center"
          gap="1"
          cursor="pointer"
          userSelect="none"
          onClick={(e) => e.stopPropagation()}
        >
          <Text>Status {currentStatuses.length > 0 && `(${currentStatuses.length})`}</Text>
          {currentStatuses.length == 0 && <PiSliders size="14" />}
        </HStack>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>Filter by Status</Menu.ItemGroupLabel>
              {statusOptions.map((option) => (
                <Menu.CheckboxItem
                  key={option.value}
                  value={option.value}
                  checked={draftStatuses.includes(option.value)}
                  onCheckedChange={(checked) => handleDraftStatusChange(option.value, checked)}
                >
                  <HStack gap={2}>
                    {option.icon}
                    <Text>{option.label}</Text>
                  </HStack>
                  <Menu.ItemIndicator />
                </Menu.CheckboxItem>
              ))}
            </Menu.ItemGroup>
            <Menu.Separator />
            <Button size="xs" w="full" disabled={!isDirty} onClick={handleApply}>
              Apply Filters
            </Button>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
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
      const statusOptions = (table.options.meta as TableMetaType)?.statusOptions || [];
      const onStatusesChange =
        (table.options.meta as TableMetaType)?.onStatusesChange || (() => {});
      const statuses = (table.options.meta as TableMetaType)?.statuses || [];

      return (
        <StatusFilterMenu
          statusOptions={statusOptions}
          currentStatuses={statuses}
          onStatusesChange={onStatusesChange}
        />
      );
    },
    cell: (info) =>
      StatusBadge({
        status: info.getValue(),
        stage: info.row.original.currentStage,
      }),
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

export function StatusBadge({ status, stage }: { status: StatusEnum; stage: number }) {
  const STATUS_MAP: Record<StatusEnum, { colorPalette: string; label: string; icon: ReactNode }> = {
    SAVED: { colorPalette: 'grey', label: 'Saved', icon: <PiBookmarkSimple /> },
    APPLIED: { colorPalette: 'blue', label: 'Applied', icon: <PiPaperPlaneTilt /> },
    SCREENING: { colorPalette: 'blue', label: 'Screening', icon: <PiEye /> },
    INTERVIEW: { colorPalette: 'blue', label: 'Interview', icon: <PiMicrophone /> },
    OFFER_RECEIVED: { colorPalette: 'green', label: 'Offer Received', icon: <PiHandHeart /> },
    ACCEPTED: { colorPalette: 'green', label: 'Accepted', icon: <PiCheckCircle /> },
    REJECTED: { colorPalette: 'red', label: 'Rejected', icon: <PiXCircle /> },
    GHOSTED: { colorPalette: 'red', label: 'Ghosted', icon: <PiGhost /> },
    WITHDRAWN: { colorPalette: 'red', label: 'Withdrawn', icon: <PiArrowLeft /> },
    RESCINDED: { colorPalette: 'red', label: 'Rescinded', icon: <PiX /> },
  };

  const statusInfo = STATUS_MAP[status];

  return (
    <Badge variant="subtle" colorPalette={statusInfo.colorPalette}>
      <HStack gap={1}>
        {statusInfo.icon}
        <Text>{statusInfo.label}</Text>
        {stage > 0 && <Text>{stage}</Text>}
      </HStack>
    </Badge>
  );
}

// --- NEW COMPONENT: ISOLATED SENTINEL ---
// This component handles the intersection logic.
// When it enters/leaves view, ONLY this component re-renders.
// The massive ApplicationsTable ignores it completely.
// This MUST be its own component to prevent stuttering.
const InfiniteScrollSentinel = ({
  onFetchNext,
  hasNextPage,
  isFetching,
}: {
  onFetchNext: () => void;
  hasNextPage: boolean;
  isFetching: boolean;
}) => {
  const { ref, inView } = useInView({
    // Trigger fetch slightly before the user hits the exact bottom
    rootMargin: '200px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      onFetchNext();
    }
  }, [inView, hasNextPage, isFetching, onFetchNext]);

  // Always render a stable height container to prevent layout jumps
  return (
    <Box ref={ref} h="10" w="full" display="flex" alignItems="center" justifyContent="center">
      {isFetching && <Spinner size="sm" color="gray.500" />}

      {!hasNextPage && !isFetching && (
        <Text fontSize="xs" color="gray.400">
          No more applications
        </Text>
      )}
    </Box>
  );
};

function ApplicationsTable({
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  selectedApplication,
  setSelectedApplication,
  isDrawerOpen,
  setIsDrawerOpen,
  onDrawerClose,
  sorting,
  setSorting,
  statusOptions,
  onStatusesChange,
  statuses,
}: {
  data: Application[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  selectedApplication: Application | null;
  setSelectedApplication: (app: Application | null) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: () => void;
  onDrawerClose: () => void;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  statusOptions: { value: StatusEnum; label: string; icon: ReactNode }[];
  onStatusesChange: (statuses: StatusEnum[]) => void;
  statuses: StatusEnum[];
}) {
  // REMOVED: const { ref, inView } = useInView(); <-- This was the cause of the stutter

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
      statusOptions,
      onStatusesChange,
      statuses,
    },
  });

  return (
    <Flex w="full" h="full">
      <Box flex="1" minW="0" borderTop="1px solid" borderColor="border">
        <Table.ScrollArea h="full" overflowY="scroll">
          <Table.Root variant="outline" size="sm" w="full" stickyHeader>
            <Table.ColumnGroup>
              {table.getLeafHeaders().map((header) => (
                <Table.Column key={header.id} htmlWidth={`${header.getSize()}%`} />
              ))}
            </Table.ColumnGroup>
            <Table.Header>
              {table.getHeaderGroups().map((headerGroup) => (
                <Table.Row key={headerGroup.id} bg="bg.subtle">
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    return (
                      <Table.ColumnHeader
                        key={header.id}
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                        overflow="hidden"
                      >
                        <HStack
                          alignItems="center"
                          gap="2"
                          userSelect="none"
                          cursor={canSort ? 'pointer' : 'default'}
                          onClick={header.column.getToggleSortingHandler()}
                          display="inline-flex"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}

                          {header.column.getCanSort() && (
                            <Box as="span">
                              {{
                                asc: <PiCaretUp />,
                                desc: <PiCaretDown />,
                              }[header.column.getIsSorted() as string] ?? <PiCaretUpDown />}
                            </Box>
                          )}
                        </HStack>
                      </Table.ColumnHeader>
                    );
                  })}
                </Table.Row>
              ))}
            </Table.Header>
            <Table.Body>
              {table.getRowModel().rows.map((row) => (
                <Table.Row
                  key={row.id}
                  cursor="pointer"
                  _hover={{ bg: 'bg.subtle' }}
                  onClick={() => {
                    setSelectedApplication(row.original);
                    setIsDrawerOpen();
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell
                      key={cell.id}
                      whiteSpace="nowrap"
                      textOverflow="ellipsis"
                      overflow="hidden"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))}
              <Table.Row>
                <Table.Cell colSpan={columns.length} p={0} border="none">
                  <InfiniteScrollSentinel
                    onFetchNext={fetchNextPage}
                    hasNextPage={hasNextPage}
                    isFetching={isFetchingNextPage}
                  />
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Table.ScrollArea>
      </Box>
      <ApplicationDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        selectedApplication={selectedApplication}
      />
    </Flex>
  );
}

export default function ApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('q') || '';
  const sortByParam = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');
  const statusParams = searchParams.getAll('status');
  const statuses = useMemo(() => {
    return statusParams.length > 0 ? (statusParams as StatusEnum[]) : [];
  }, [statusParams]);

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    // Check if the URL is ALREADY set to this value to avoid
    // redundant history entries or router flashes
    if (debouncedSearch === search) return;

    setSearchParams(
      (prev) => {
        if (debouncedSearch) {
          prev.set('q', debouncedSearch);
        } else {
          prev.delete('q');
        }
        return prev;
      },
      { replace: true }
    );
  }, [debouncedSearch, setSearchParams, search]); // Add 'search' to deps

  // 4. Sync URL -> Input (Handle Browser Back Button)
  useEffect(() => {
    // Only update local state if it's actually different.
    // This prevents cursor jumping in some edge cases.
    if (search !== searchInput) {
      setSearchInput(search);
    }
  }, [search]);

  const sorting: SortingState = useMemo(
    () => (sortByParam ? [{ id: sortByParam, desc: sortOrder === 'desc' }] : []),
    [sortByParam, sortOrder]
  );

  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const {
    open: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure({ defaultOpen: false });

  const statusOptions: { value: StatusEnum; label: string; icon: ReactNode }[] = [
    { value: 'SAVED', label: 'Saved', icon: <PiBookmarkSimple /> },
    { value: 'APPLIED', label: 'Applied', icon: <PiPaperPlaneTilt /> },
    { value: 'SCREENING', label: 'Screening', icon: <PiEye /> },
    { value: 'INTERVIEW', label: 'Interview', icon: <PiMicrophone /> },
    { value: 'OFFER_RECEIVED', label: 'Offer Received', icon: <PiHandHeart /> },
    { value: 'ACCEPTED', label: 'Accepted', icon: <PiCheckCircle /> },
    { value: 'REJECTED', label: 'Rejected', icon: <PiXCircle /> },
    { value: 'GHOSTED', label: 'Ghosted', icon: <PiGhost /> },
    { value: 'WITHDRAWN', label: 'Withdrawn', icon: <PiArrowLeft /> },
    { value: 'RESCINDED', label: 'Rescinded', icon: <PiX /> },
  ];

  const handleStatusesChange = (newStatuses: StatusEnum[]) => {
    setSearchParams(
      (prev) => {
        // Remove all existing status params
        prev.delete('status');
        // Add each status as a separate param
        newStatuses.forEach((status) => {
          prev.append('status', status);
        });
        return prev;
      },
      { replace: true }
    );
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['applications', search, sortByParam, sortOrder, statuses],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getApplications(
        pageParam,
        20,
        search,
        statuses.length > 0 ? statuses : undefined,
        sortByParam as 'title' | 'company' | 'posted_at' | 'updated_at',
        sortOrder as 'asc' | 'desc'
      ),

    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.pages) return lastPage.page + 1;
      return undefined;
    },
  });

  const flatData = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data]);

  const handleSortChange: OnChangeFn<SortingState> = (updaterOrValue) => {
    // Tanstack Table gives us a function or value. We resolve it.
    const newSorting =
      typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;

    const sort = newSorting[0]; // We only support single-column sort
    console.log('Current State:', sorting);
    console.log('Table Requesting:', newSorting); // <--- Check this output

    setSearchParams(
      (prev) => {
        if (!sort) {
          prev.delete('sortBy');
          prev.delete('sortOrder');
        } else {
          prev.set('sortBy', sort.id);
          prev.set('sortOrder', sort.desc ? 'desc' : 'asc');
        }
        return prev;
      },
      { replace: true }
    );
  };

  return (
    <VStack h="full" alignItems="stretch" gap="0">
      <HStack p="1.5">
        <InputGroup startElement={<PiMagnifyingGlass />} w="md">
          <Input
            size="md"
            placeholder="Search applications"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </InputGroup>
        {/* <Text textStyle="sm" color="fg.subtle">
          Showing {flatData.length} of {data.pages[0].total} applications
        </Text> */}
        <Spacer />
        <Button variant="subtle">
          <PiDownload />
          Export
        </Button>
        <Button asChild>
          <Link to="/scraping">
            <PiPlus />
            New
          </Link>
        </Button>
      </HStack>
      <Box flex="1" overflow="hidden">
        {data ? (
          <ApplicationsTable
            data={flatData}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            selectedApplication={selectedApplication}
            setSelectedApplication={setSelectedApplication}
            isDrawerOpen={isDrawerOpen}
            setIsDrawerOpen={onDrawerOpen}
            onDrawerClose={onDrawerClose}
            sorting={sorting}
            setSorting={handleSortChange}
            statusOptions={statusOptions}
            onStatusesChange={handleStatusesChange}
            statuses={statuses}
          />
        ) : (
          <Spinner size="lg" />
        )}
      </Box>
    </VStack>
  );
}
