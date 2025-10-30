import { Button, Field, Input, VStack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

export default function PersonalInformation() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ fullName: string; email: string; phone: string; website?: string }>();
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <VStack maxW="3xl" gap="4" alignItems="start">
        <Field.Root required>
          <Field.Label>
            Full name
            <Field.RequiredIndicator />
          </Field.Label>
          <Input {...register('fullName', { required: 'Full name is required' })} />
          {errors.fullName ? (
            <Field.ErrorText>{errors.fullName.message}</Field.ErrorText>
          ) : (
            <Field.HelperText>Your full legal name.</Field.HelperText>
          )}
        </Field.Root>
        <Field.Root required>
          <Field.Label>
            Email Address
            <Field.RequiredIndicator />
          </Field.Label>
          <Input type="email" {...register('email', { required: 'Email is required' })} />
          {errors.email ? (
            <Field.ErrorText>{errors.email.message}</Field.ErrorText>
          ) : (
            <Field.HelperText>Your primary email address.</Field.HelperText>
          )}
        </Field.Root>
        <Field.Root required>
          <Field.Label>Phone Number</Field.Label>
          <Input type="tel" {...register('phone', { required: 'Phone number is required' })} />
          {errors.phone ? (
            <Field.ErrorText>{errors.phone.message}</Field.ErrorText>
          ) : (
            <Field.HelperText>Your primary phone number.</Field.HelperText>
          )}
        </Field.Root>
        <Field.Root>
          <Field.Label>Website</Field.Label>
          <Input type="url" {...register('website')} />
          <Field.HelperText>Your personal or professional website.</Field.HelperText>
        </Field.Root>
        <Button type="submit">Save Changes</Button>
      </VStack>
    </form>
  );
}
