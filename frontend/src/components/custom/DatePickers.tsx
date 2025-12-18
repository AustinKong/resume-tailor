import { Input, type InputProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

import { ISODate, ISOYearMonth } from '@/utils/date';

const NATIVE_PICKER_CSS = {
  '&::-webkit-calendar-picker-indicator': {
    cursor: 'pointer',
    padding: '4px',
    opacity: 0.6,
    transition: 'opacity 0.2s',
    _hover: { opacity: 1 },
  },
};

interface DateInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type'> {
  value?: ISODate | null;
  onChange?: (value: ISODate | null) => void;
}

export const ISODateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="date"
        value={value ?? ''}
        onChange={(e) => {
          const rawValue = e.target.value;
          onChange?.(rawValue ? (rawValue as ISODate) : null);
        }}
        css={NATIVE_PICKER_CSS}
        {...props}
      />
    );
  }
);
ISODateInput.displayName = 'ISODateInput';

interface MonthInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type'> {
  value?: ISOYearMonth | null;
  onChange?: (value: ISOYearMonth | null) => void;
}

export const ISOYearMonthInput = forwardRef<HTMLInputElement, MonthInputProps>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="month"
        value={value ?? ''}
        onChange={(e) => {
          const rawValue = e.target.value;
          onChange?.(rawValue ? (rawValue as ISOYearMonth) : null);
        }}
        css={NATIVE_PICKER_CSS}
        {...props}
      />
    );
  }
);
ISOYearMonthInput.displayName = 'ISOYearMonthInput';
