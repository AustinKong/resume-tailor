import { Text, type TextProps, useLocaleContext } from '@chakra-ui/react';

import { ISODate, ISODatetime, ISOYearMonth } from '@/utils/date';

interface DisplayDateProps extends TextProps {
  date: string | null | undefined;
  options?: Intl.DateTimeFormatOptions;
}

export function DisplayDate({ date, options, ...props }: DisplayDateProps) {
  const { locale = 'en-US' } = useLocaleContext();

  if (!date) {
    return (
      <Text as="span" color="fg.muted" {...props}>
        -
      </Text>
    );
  }

  let formatted: string;

  if (ISODatetime.is(date)) {
    formatted = ISODatetime.format(date, options, locale);
  } else if (ISODate.is(date)) {
    formatted = ISODate.format(date, options, locale);
  } else if (ISOYearMonth.is(date)) {
    formatted = ISOYearMonth.format(date, options, locale);
  } else {
    // Unknown format, fallback to native Date
    formatted = new Date(date).toLocaleDateString(locale, options);
  }

  return (
    <Text as="span" whiteSpace="nowrap" {...props}>
      {formatted}
    </Text>
  );
}
