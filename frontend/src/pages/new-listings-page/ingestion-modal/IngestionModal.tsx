import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Input,
  Portal,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

import { useListingMutations } from '@/hooks/listings';

import { useIngestion } from './ingestionContext';

export function IngestionModal() {
  const { ingestListing } = useListingMutations();
  const { dialog, context, close } = useIngestion();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<{
    url: string;
    content?: string;
  }>({
    mode: 'onChange',
    values: {
      url: context?.url || '',
      content: '',
    },
  });

  const urlValue = watch('url');
  const isUrlValid = !!urlValue && !errors.url;

  const onSubmit = handleSubmit((data) => {
    ingestListing(data.url, data.content, context?.id);
    if (context?.id) {
      close();
    }
    reset();
  });

  return (
    <Dialog.RootProvider size="lg" value={dialog}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content as="form" onSubmit={onSubmit}>
            <Dialog.Header>
              <Dialog.Title>Add Job Listing URLs</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack>
                <Field.Root required readOnly={!!context?.id}>
                  <Field.Label>
                    URL <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    {...register('url', {
                      required: 'URL is required',
                      pattern: {
                        value: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/,
                        message: 'Please enter a valid URL',
                      },
                    })}
                    placeholder="https://example.com/job-listing"
                    autoFocus
                  />
                  {errors.url && <Field.ErrorText>{errors.url.message}</Field.ErrorText>}
                </Field.Root>
                <Field.Root disabled={!isUrlValid}>
                  <Field.Label>Content</Field.Label>
                  <Textarea
                    {...register('content')}
                    placeholder="Paste the job listing content here"
                    rows={10}
                  />
                </Field.Root>
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" onClick={close}>
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button type="submit" disabled={!isUrlValid}>
                Scrape Listings
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild onClick={close}>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.RootProvider>
  );
}
