import { Button, HStack, Menu, Portal, Text, useDisclosure } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { PiSliders } from 'react-icons/pi';

import { STATUS_OPTIONS } from '@/constants/statuses';
import type { StatusEnum } from '@/types/application';

export function StatusFilterMenu({
  currentStatuses,
  onStatusesChange,
}: {
  currentStatuses: StatusEnum[];
  onStatusesChange: (statuses: StatusEnum[]) => void;
}) {
  const [draftStatuses, setDraftStatuses] = useState<StatusEnum[]>(currentStatuses);
  const { open, setOpen, onClose } = useDisclosure();

  useEffect(() => {
    setDraftStatuses(currentStatuses);
  }, [currentStatuses]);

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
    setOpen(details.open);
    if (details.open) {
      setDraftStatuses(currentStatuses);
    }
  };

  const handleApply = () => {
    onStatusesChange(draftStatuses);
    onClose();
  };

  return (
    <Menu.Root closeOnSelect={false} open={open} onOpenChange={handleOpenChange}>
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
              {STATUS_OPTIONS.map((option) => (
                <Menu.CheckboxItem
                  key={option.value}
                  value={option.value}
                  checked={draftStatuses.includes(option.value)}
                  onCheckedChange={(checked) => handleDraftStatusChange(option.value, checked)}
                >
                  <option.icon />
                  <Text>{option.label}</Text>
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
