import { HStack, Icon, Spinner, Text } from '@chakra-ui/react';
import { PiCheck } from 'react-icons/pi';

export default function Footer({
  selectedCount,
  totalCount,
  isSaving = false,
}: {
  selectedCount: number;
  totalCount: number;
  isSaving?: boolean;
}) {
  return (
    <HStack
      borderTop="1px solid"
      borderColor="border"
      px="4"
      py="2"
      justify="space-between"
      align="center"
      color="fg.muted"
      fontSize="sm"
      bgColor="bg.subtle"
    >
      <Text>
        {selectedCount} of {totalCount} selected
      </Text>

      <Text textAlign="center">AI can make mistakes, double-check everything</Text>

      <HStack align="center">
        {isSaving ? (
          <>
            <Spinner size="xs" mb="1" />
            <Text>Saving</Text>
          </>
        ) : (
          <>
            <Icon mb="1">
              <PiCheck />
            </Icon>
            <Text>Saved</Text>
          </>
        )}
      </HStack>
    </HStack>
  );
}
