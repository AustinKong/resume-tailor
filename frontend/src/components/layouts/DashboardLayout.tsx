import { HStack } from '@chakra-ui/react';
import { PiCards, PiGear, PiNewspaper } from 'react-icons/pi';

import Sidebar from '@/components/custom/Sidebar';

import Navbar from '../custom/Navbar';

const DASHBOARD_LINKS = [
  { label: 'Latest News', path: '/news', icon: <PiNewspaper /> },
  { label: 'My Cards', path: '/cards', icon: <PiCards /> },
  { label: 'Settings', path: '/settings', icon: <PiGear /> },
];

export default function DashboardLayout() {
  return (
    <HStack w="100vw" h="100vh">
      <Sidebar links={DASHBOARD_LINKS} />
      <Navbar />
    </HStack>
  );
}
