import { Center, Spinner, Table as ChakraTable, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export default function TableFooter({
  onFetchNext,
  hasNextPage,
  isLoading,
}: {
  onFetchNext: () => void;
  hasNextPage: boolean;
  isLoading: boolean;
}) {
  const { ref, inView } = useInView({
    rootMargin: '200px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isLoading) {
      onFetchNext();
    }
  }, [inView, hasNextPage, isLoading, onFetchNext]);

  return (
    <ChakraTable.Row _hover={{ bg: 'transparent' }}>
      <ChakraTable.Cell colSpan={6} p="0">
        <Center ref={ref} h="10">
          {isLoading && <Spinner size="sm" />}

          {!hasNextPage && !isLoading && (
            <Text fontSize="xs" color="fg.subtle">
              No more applications
            </Text>
          )}
        </Center>
      </ChakraTable.Cell>
    </ChakraTable.Row>
  );
}
