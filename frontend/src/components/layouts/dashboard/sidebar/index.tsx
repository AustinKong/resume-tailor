import { Box, Center, chakra, Heading, HStack, Icon, Image, Text, VStack } from '@chakra-ui/react';
import { PiBookmarkSimple, PiCaretLeft, PiCaretRight, PiGear, PiPlus } from 'react-icons/pi';
import { NavLink } from 'react-router';

import { useColorModeValue } from '@/components/ui/color-mode';
import { useLocalStorage } from '@/hooks/utils/useLocalStorage';

import rootPackage from '../../../../../package.json';
import { Alert } from './Alert';

type NavItemConfig = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItemConfig[] = [
  { label: 'Applications', path: '/applications', icon: <PiBookmarkSimple /> },
  { label: 'New Listing', path: '/listings/new', icon: <PiPlus /> },
  { label: 'Settings', path: '/settings', icon: <PiGear /> },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useLocalStorage('sidebar-open', true);

  const onToggle = () => setIsOpen(!isOpen);

  return (
    <VStack
      as="aside"
      minW={isOpen ? '60' : '3.25rem'}
      w={isOpen ? '60' : '3.25rem'}
      bg="bg.subtle"
      h="full"
      alignItems="stretch"
      transition="all 0.1s ease-in-out"
      borderRight="1px solid"
      borderColor="border"
      gap="0"
    >
      <Box
        h="12"
        px="2"
        borderBottom="1px solid"
        borderColor="border"
        display="flex"
        alignItems="center"
      >
        <Logo isOpen={isOpen} />
      </Box>

      <VStack as="nav" alignItems="stretch" gap="0" flex="1" p="2">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} isOpen={isOpen} item={item} />
        ))}
      </VStack>

      {isOpen && <Alert />}

      <CollapseButton isOpen={isOpen} onToggle={onToggle} />
    </VStack>
  );
}

function Logo({ isOpen }: { isOpen: boolean }) {
  const imageSrc = useColorModeValue('/light-icon.png', '/dark-icon.png');

  return (
    <SidebarItem gap="2">
      <Center w="6" h="6" flexShrink={0}>
        <Image w="5" h="5" objectFit="contain" src={imageSrc} />
      </Center>
      <SidebarLabel opacity={isOpen ? 1 : 0} as={HStack}>
        <Heading as="h1" size="xl">
          Atto
        </Heading>
        <Text textStyle="xs" color="fg.muted">
          v{rootPackage.version}
        </Text>
      </SidebarLabel>
    </SidebarItem>
  );
}

function NavItem({ isOpen, item }: { isOpen: boolean; item: NavItemConfig }) {
  return (
    <NavLink to={item.path}>
      {({ isActive }: { isActive: boolean }) => (
        <SidebarItem
          bg={isActive ? 'bg.emphasized' : 'transparent'}
          _hover={isActive ? undefined : { bg: 'bg.muted' }}
          aria-current={isActive ? 'page' : undefined}
          title={!isOpen ? item.label : undefined}
        >
          <SidebarIcon size="md" aria-hidden="true">
            {item.icon}
          </SidebarIcon>
          <SidebarLabel opacity={isOpen ? 1 : 0}>{item.label}</SidebarLabel>
        </SidebarItem>
      )}
    </NavLink>
  );
}

function CollapseButton({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <Box p="2">
      <SidebarItem
        as="button"
        w="full"
        cursor="pointer"
        _hover={{ bg: 'bg.muted' }}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <SidebarIcon size="sm" aria-hidden="true">
          {isOpen ? <PiCaretLeft /> : <PiCaretRight />}
        </SidebarIcon>
        <SidebarLabel opacity={isOpen ? 1 : 0}>Collapse</SidebarLabel>
      </SidebarItem>
    </Box>
  );
}

const SidebarItem = chakra(HStack, {
  base: {
    p: '1.5',
    h: '9',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    borderRadius: 'sm',
    alignItems: 'center',
  },
});

const SidebarIcon = chakra(Icon, {
  base: {
    w: '6',
    aspectRatio: '1',
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'center',
  },
});

const SidebarLabel = chakra(Text, {
  base: {
    fontSize: 'sm',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    transition: 'opacity 0.1s ease-in-out',
  },
});
