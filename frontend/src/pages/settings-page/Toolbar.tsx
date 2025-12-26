import { Button, HStack, SegmentGroup, Spacer } from '@chakra-ui/react';

export function Toolbar({
  showAdvanced,
  onShowAdvancedChange,
  isDirty,
  isLoading,
}: {
  showAdvanced: boolean;
  onShowAdvancedChange: (show: boolean) => void;
  isDirty: boolean;
  isLoading: boolean;
}) {
  return (
    <HStack p="1.5">
      <SegmentGroup.Root
        value={showAdvanced ? 'Advanced' : 'Basic'}
        onValueChange={(e) => onShowAdvancedChange(e.value === 'Advanced')}
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Items items={['Basic', 'Advanced']} cursor="pointer" />
      </SegmentGroup.Root>
      <Spacer />
      <Button type="submit" disabled={!isDirty || isLoading} loading={isLoading}>
        Save Changes
      </Button>
    </HStack>
  );
}
