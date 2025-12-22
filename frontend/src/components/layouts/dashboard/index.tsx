import { Box, HStack, VStack } from '@chakra-ui/react';
import { Outlet } from 'react-router';

import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function DashboardLayout() {
  return (
    <HStack w="100vw" h="100vh" overflow="hidden" gap="0">
      <Sidebar />
      <VStack w="full" h="full" bg="bg.main" p="0" gap="0" minW="0" align="stretch">
        <Navbar />
        <Box as="main" id="main-content" w="full" flex="1" overflow="hidden" p="0">
          <Outlet />
        </Box>
      </VStack>
    </HStack>
  );
}
