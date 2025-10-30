import { Avatar, Box, HStack, Spacer, VStack } from '@chakra-ui/react';
import { Outlet } from 'react-router';

import Breadcrumb from '@/components/custom/Breadcrumb';

export default function Navbar() {
  return (
    <VStack w="full" h="full" bg="bg.main" p="0">
      <HStack as="nav" w="full" p="2">
        <Breadcrumb />
        <Spacer />
        <Avatar.Root size="sm">
          <Avatar.Fallback name="User Avatar" />
          <Avatar.Image src="https://bit.ly/sage-adebayo" alt="User Avatar" />
        </Avatar.Root>
      </HStack>
      <Box as="main" w="full" flex="1" overflowY="auto" px="4">
        <Outlet />
      </Box>
    </VStack>
  );
}
