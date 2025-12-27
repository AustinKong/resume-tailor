import { Button, Center, CloseButton, Spinner, Tabs } from '@chakra-ui/react';
import { PiPlus } from 'react-icons/pi';

import { useListingQuery } from '@/hooks/listings';

import { Application } from './Application';
import { Details } from './Details';
import { Header } from './Header';

export function Drawer({
  onClose,
  selectedListingId,
}: {
  onClose: () => void;
  selectedListingId: string;
}) {
  const { data: listing } = useListingQuery(selectedListingId);

  if (!listing) {
    return (
      <Center h="full">
        <Spinner size="lg" />
      </Center>
    );
  }

  // TODO: Make fallback to Details if no applications exist
  return (
    <Tabs.Root h="full" display="flex" flexDirection="column" defaultValue="details">
      <Tabs.List borderBottom="none">
        <Tabs.Trigger value="details">Details</Tabs.Trigger>
        {
          // Should need to sort by updatedAt first for deterministic ordering
          // .sort((a, b) => b.timeline[0].createdAt - a.timeline[0].createdAt)
          listing.applications.map((application, index) => (
            <Tabs.Trigger key={application.id} value={application.id}>
              Application {index + 1}
            </Tabs.Trigger>
          ))
        }
        <Button alignSelf="center" size="md" variant="ghost" p="2" color="fg.muted">
          <PiPlus />
          New Application
        </Button>
        <CloseButton position="absolute" right="0" onClick={onClose} />
      </Tabs.List>
      <Tabs.Content value="details" flex="1" overflowY="auto">
        <Header listing={listing} />
        <Details listing={listing} />
      </Tabs.Content>
      {listing.applications.map((application) => (
        <Tabs.Content key={application.id} value={application.id}>
          <Header listing={listing} />
          <Application application={application} />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
