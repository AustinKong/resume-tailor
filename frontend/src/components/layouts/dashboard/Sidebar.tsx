import { Box, chakra, HStack, Icon, Image, Text, useDisclosure, VStack } from '@chakra-ui/react';
import {
  PiBookmarkSimple,
  PiCards,
  PiCaretLeft,
  PiCaretRight,
  PiGear,
  PiMagnifyingGlass,
  PiNewspaper,
  PiUser,
} from 'react-icons/pi';
import { NavLink } from 'react-router';

type NavItemConfig = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItemConfig[] = [
  { label: 'Profile', path: '/profile', icon: <PiUser /> },
  { label: 'Scrape Jobs', path: '/scraping', icon: <PiMagnifyingGlass /> },
  { label: 'Saved Listings', path: '/saved', icon: <PiBookmarkSimple /> },
  { label: 'Latest News', path: '/news', icon: <PiNewspaper /> },
  { label: 'My Cards', path: '/cards', icon: <PiCards /> },
  { label: 'Settings', path: '/settings', icon: <PiGear /> },
];

export default function Sidebar() {
  const { open: isOpen, onToggle } = useDisclosure();

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

      <CollapseButton isOpen={isOpen} onToggle={onToggle} />
    </VStack>
  );
}

function Logo({ isOpen }: { isOpen: boolean }) {
  return (
    <SidebarItem gap="2">
      <Box w="6" h="6" flexShrink={0}>
        <Image
          w="full"
          h="full"
          objectFit="contain"
          src="https://play-lh.googleusercontent.com/Edz6eN6m8D-g6wEPFpIOC_ZyLE9AOSonFNGBM5jib_ImFbmezVlzj-HlxFWt6WS-ig4h"
        />
      </Box>
      <SidebarLabel as="h1" fontSize="md" fontWeight="bold" opacity={isOpen ? 1 : 0}>
        Unknown Project
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
