import { Button, Field, Input, VStack } from '@chakra-ui/react';
import { useState } from 'react';

// import BulletInput from '@/components/custom/BulletInput';
import { useProfileMutations, useProfileQuery } from '@/hooks/profile';
import type { Profile } from '@/types/profile';

interface PersonalInformationProps {
  initialData: Profile;
}

function PersonalInformationForm({ initialData }: PersonalInformationProps) {
  const [formData, setFormData] = useState<Profile>(initialData);
  const { updateProfile } = useProfileMutations();

  const setFormField = (updates: Partial<Profile>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <VStack maxW="3xl" gap="4" alignItems="start">
      <Field.Root required>
        <Field.Label>
          Full name
          <Field.RequiredIndicator />
        </Field.Label>
        <Input
          value={formData.fullName ?? ''}
          onChange={(e) => setFormField({ fullName: e.target.value })}
          required
        />
        <Field.HelperText>Your full legal name.</Field.HelperText>
      </Field.Root>
      <Field.Root required>
        <Field.Label>
          Email Address
          <Field.RequiredIndicator />
        </Field.Label>
        <Input
          type="email"
          value={formData.email ?? ''}
          onChange={(e) => setFormField({ email: e.target.value })}
          required
        />
        <Field.HelperText>Your primary email address.</Field.HelperText>
      </Field.Root>
      <Field.Root>
        <Field.Label>Phone Number</Field.Label>
        <Input
          type="tel"
          value={formData.phone ?? ''}
          onChange={(e) => setFormField({ phone: e.target.value })}
        />
        <Field.HelperText>Your primary phone number.</Field.HelperText>
      </Field.Root>
      <Field.Root>
        <Field.Label>Location</Field.Label>
        <Input
          value={formData.location ?? ''}
          onChange={(e) => setFormField({ location: e.target.value })}
        />
        <Field.HelperText>Your location.</Field.HelperText>
      </Field.Root>
      <Field.Root>
        <Field.Label>Website</Field.Label>
        <Input
          type="url"
          value={formData.website ?? ''}
          onChange={(e) => setFormField({ website: e.target.value })}
        />
        <Field.HelperText>Your personal or professional website.</Field.HelperText>
      </Field.Root>
      {/* <BulletInput
        label="Certifications"
        bullets={formData.certifications}
        onBulletsChange={(certifications) => setFormField({ certifications })}
      /> */}
      {/* <BulletInput
        label="Awards"
        bullets={formData.awards}
        onBulletsChange={(awards) => setFormField({ awards })}
      /> */}
      <Button onClick={() => updateProfile(formData)}>Save Changes</Button>
    </VStack>
  );
}

export function PersonalInformation() {
  const { profile, isLoading } = useProfileQuery();

  if (isLoading || !profile) {
    return <div>Loading...</div>;
  }

  return <PersonalInformationForm key={profile ? 'loaded' : 'loading'} initialData={profile} />;
}
