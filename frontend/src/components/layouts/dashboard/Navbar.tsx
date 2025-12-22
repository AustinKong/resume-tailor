import { Avatar, DataList, Heading, HStack, Menu, Portal, Spacer, VStack } from '@chakra-ui/react';

import { ColorModeButton } from '@/components/ui/color-mode';

import { Breadcrumb } from './Breadcrumb';

export function Navbar() {
  return (
    <HStack
      as="nav"
      aria-label="Primary navigation"
      w="full"
      h="12"
      px="4"
      borderBottom="1px solid"
      borderColor="border"
    >
      <Breadcrumb />
      <Spacer />
      <ColorModeButton />
      <UserMenu />
    </HStack>
  );
}

function TokenCounter() {
  // Dummy values
  const totalTokens = 1000;
  const remainingTokens = 150;

  return (
    <VStack px="3" py="2" align="stretch" gap="2">
      <Heading id="user-menu-heading" size="sm">
        OpenAI Tokens
      </Heading>
      <DataList.Root size="md" orientation="horizontal" gap="1">
        <DataList.Item>
          <DataList.ItemLabel>Total</DataList.ItemLabel>
          <DataList.ItemValue>{totalTokens.toLocaleString()}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>Remaining</DataList.ItemLabel>
          <DataList.ItemValue>{remainingTokens.toLocaleString()}</DataList.ItemValue>
        </DataList.Item>
      </DataList.Root>
    </VStack>
  );
}

function UserMenu() {
  return (
    <Menu.Root positioning={{ placement: 'bottom-end' }}>
      <Menu.Trigger
        as="button"
        rounded="full"
        cursor="pointer"
        aria-haspopup="menu"
        aria-label="Open user menu"
        aria-controls="user-menu"
      >
        <Avatar.Root size="sm">
          <Avatar.Fallback name="User" />
          <Avatar.Image src="https://bit.ly/sage-adebayo" alt="" />
        </Avatar.Root>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content id="user-menu" minW="200px" aria-labelledby="user-menu-heading">
            <TokenCounter />
            <Menu.Separator />

            <Menu.Item value="settings">Settings</Menu.Item>
            <Menu.Item value="billing">Feedback</Menu.Item>
            <Menu.Separator />

            <Menu.Item value="donate" color="fg.info">
              Donate
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
