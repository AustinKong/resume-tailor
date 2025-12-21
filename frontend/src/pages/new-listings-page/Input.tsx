import { Button, Center, HStack, IconButton } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { MdDelete } from 'react-icons/md';

import BulletInput from '@/components/custom/BulletInput';

type FormData = {
  urls: { value: string }[];
};

export default function Input({
  onSubmit,
  onClearCache,
}: {
  onSubmit: (urls: string[]) => void;
  onClearCache: () => void;
}) {
  const { control, register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      urls: [{ value: '' }],
    },
  });

  const handleFormSubmit = (data: FormData) => {
    const urls = data.urls.map((item) => item.value.trim()).filter((value) => value.length > 0);
    onSubmit(urls);
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <Center height="full" flexDirection="column" gap={4}>
        <form onSubmit={handleSubmit(handleFormSubmit)} style={{ width: '80%' }}>
          <BulletInput
            control={control}
            register={register}
            name="urls"
            label="Job Listing URLs"
            defaultItem={{ value: '' }}
          />
          <HStack justifyContent="center" mt={4}>
            <Button type="submit">Submit</Button>
          </HStack>
        </form>
      </Center>

      {/* Floating Action Button */}
      <IconButton
        aria-label="Clear cache"
        colorScheme="red"
        size="lg"
        position="fixed"
        bottom="20px"
        right="20px"
        borderRadius="full"
        boxShadow="lg"
        onClick={onClearCache}
        title="Clear cached listings"
      >
        <MdDelete />
      </IconButton>
    </div>
  );
}
