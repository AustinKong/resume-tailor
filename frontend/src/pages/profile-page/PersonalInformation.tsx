import { Button, Field, Input, VStack } from '@chakra-ui/react';

import BulletInput from '@/components/custom/BulletInput';
import { useProfile } from '@/hooks/useProfile';

export default function PersonalInformation() {
  const { profile, setProfileField, saveProfile } = useProfile();

  return (
    <VStack maxW="3xl" gap="4" alignItems="start">
      <Field.Root required>
        <Field.Label>
          Full name
          <Field.RequiredIndicator />
        </Field.Label>
        <Input
          value={profile.fullName ?? ''}
          onChange={(e) => setProfileField({ fullName: e.target.value })}
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
          value={profile.email ?? ''}
          onChange={(e) => setProfileField({ email: e.target.value })}
          required
        />
        <Field.HelperText>Your primary email address.</Field.HelperText>
      </Field.Root>
      <Field.Root>
        <Field.Label>Phone Number</Field.Label>
        <Input
          type="tel"
          value={profile.phone ?? ''}
          onChange={(e) => setProfileField({ phone: e.target.value })}
        />
        <Field.HelperText>Your primary phone number.</Field.HelperText>
      </Field.Root>
      <Field.Root>
        <Field.Label>Location</Field.Label>
        <Input
          value={profile.location ?? ''}
          onChange={(e) => setProfileField({ location: e.target.value })}
        />
        <Field.HelperText>Your location.</Field.HelperText>
      </Field.Root>
      <Field.Root>
        <Field.Label>Website</Field.Label>
        <Input
          type="url"
          value={profile.website ?? ''}
          onChange={(e) => setProfileField({ website: e.target.value })}
        />
        <Field.HelperText>Your personal or professional website.</Field.HelperText>
      </Field.Root>
      <BulletInput
        label="Certifications"
        bullets={profile.certifications}
        onBulletsChange={(certifications) => setProfileField({ certifications })}
      />
      <BulletInput
        label="Awards"
        bullets={profile.awards}
        onBulletsChange={(awards) => setProfileField({ awards })}
      />
      <Button onClick={() => saveProfile()}>Save Changes</Button>
    </VStack>
  );
}
