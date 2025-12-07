/**
 * CompanyLogo component displays a company's logo using its domain.
 *
 * Uses Google's favicon service to fetch the logo for the given domain.
 * If the domain is invalid or not found, Google returns a generic 16x16 globe icon
 * instead of a 404 error. To avoid showing the globe, we check the image's natural width
 * and only render it if it's larger than 16px (indicating a real logo).
 * Otherwise, the Avatar fallback (company initials) is shown.
 *
 * Future improvements:
 * Use a dedicated logo service instead, fallback to Google if unavailable.
 * We can make this a paid service (with API key server-side) to ensure higher quality logos.
 *
 * @param {string} domain - The company's domain name (e.g., 'google.com').
 * @param {string} companyName - The company's display name (used for fallback initials).
 */
import { Avatar, type AvatarRootProps } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

interface CompanyLogoProps extends AvatarRootProps {
  domain: string;
  companyName: string;
}

function pickPalette(companyName: string): string {
  const colors = ['red', 'blue', 'green', 'orange', 'purple', 'teal', 'cyan', 'pink', 'yellow'];

  const index =
    companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

  return colors[index];
}

export default function CompanyLogo({
  domain,
  companyName,
  size = '2xs',
  ...rest
}: CompanyLogoProps) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!domain) return;

    // Google's favicon service returns a 16x16 globe icon for missing domains instead of a 404.
    // We check the image's naturalWidth to avoid showing the globe.
    const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    const img = new window.Image();
    img.src = googleUrl;

    img.onload = () => {
      if (img.naturalWidth > 16) {
        setImageSrc(googleUrl);
      }
    };

    img.onerror = () => {
      setImageSrc(undefined);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [domain]);

  return (
    <Avatar.Root
      {...rest}
      variant="subtle"
      shape={imageSrc ? 'square' : 'full'}
      bg={imageSrc ? 'transparent' : undefined}
      colorPalette={pickPalette(companyName)}
      size={size}
      display="inline-flex"
      verticalAlign="middle"
    >
      <Avatar.Image src={imageSrc} loading="lazy" />
      <Avatar.Fallback name={companyName} />
    </Avatar.Root>
  );
}
