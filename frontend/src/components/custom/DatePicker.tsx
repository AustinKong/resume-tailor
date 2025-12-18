import 'react-datepicker/dist/react-datepicker.css';

import { Box, Input, type InputProps } from '@chakra-ui/react';
import { type ComponentProps, forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';

interface CustomInputProps extends InputProps {
  isInvalid?: boolean;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ isInvalid, ...rest }, ref) => {
    return <Input ref={ref} aria-invalid={isInvalid} {...rest} />;
  }
);

type ReactDatePickerType = typeof ReactDatePicker;
type Props = ComponentProps<ReactDatePickerType> & {
  isInvalid?: boolean;
  colorPalette?: string;
};

export default function DatePicker({ isInvalid, colorPalette = 'blue', ...props }: Props) {
  return (
    <Box
      colorPalette={colorPalette}
      css={{
        '& .react-datepicker-popper': { zIndex: 'popover' },
        '& .react-datepicker': {
          fontFamily: 'inherit',
          fontSize: 'sm',
          bg: 'bg.panel',
          color: 'fg',
          border: '1px solid',
          borderColor: 'border.muted',
          borderRadius: 'md',
          boxShadow: 'sm',
          p: 0,
        },
        '& .react-datepicker__header': {
          bg: 'bg.subtle',
          borderBottom: 'none',
        },
        '& .react-datepicker__current-month': {
          color: 'fg',
          fontWeight: 'semibold',
          fontSize: 'sm',
        },
        '& .react-datepicker__navigation-icon::before': { borderColor: 'fg.muted' },
        '& .react-datepicker-popper[data-placement^="bottom"] .react-datepicker__triangle': {
          display: 'none',
        },

        // Day Picker
        '& .react-datepicker__day-name': {
          color: 'fg.muted',
          fontWeight: 'medium',
          fontSize: 'xs',
          width: '1.47rem',
          lineHeight: '1.7rem',
          margin: '0.166rem',
          display: 'inline-block',
        },

        '& .react-datepicker__day': {
          '--day-bg': 'transparent',
          '--day-color': 'colors.fg',
          '--day-hover-bg': 'colors.bg.muted',

          '&.react-datepicker__day--in-range, &.react-datepicker__day--in-selecting-range': {
            '--day-bg': 'colors.colorPalette.subtle',
            '--day-color': 'colors.colorPalette.fg',
            '--day-hover-bg': 'colors.colorPalette.muted',
            borderRadius: 0,
          },
          '&.react-datepicker__day--selected, &.react-datepicker__day--range-start, &.react-datepicker__day--range-end, &.react-datepicker__day--selecting-range-start':
            {
              '--day-bg': 'colors.colorPalette.solid',
              '--day-color': 'colors.colorPalette.contrast',
              '--day-hover-bg': 'colors.colorPalette.solid',
            },
          '&.react-datepicker__day--today': {
            fontWeight: 'bold',
            boxShadow: 'inset 0 0 0 1px var(--chakra-colors-colorPalette-solid)',
            '&.react-datepicker__day--selected, &.react-datepicker__day--in-range': {
              boxShadow: 'none',
            },
          },

          borderRadius: 'md',
          bg: 'var(--day-bg)',
          color: 'var(--day-color)',
          transition: 'background-color 0.1s',

          _hover: {
            bg: 'var(--day-hover-bg)',
            color: 'var(--day-color)',
          },
        },

        '& .react-datepicker__day--range-start': {
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
        '& .react-datepicker__day--range-end': {
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        },
        '& .react-datepicker__day--outside-month': {
          opacity: 0.5,
          pointerEvents: 'none',
        },

        // Month/Year Picker
        '& .react-datepicker__month-text, & .react-datepicker__year-text': {
          '--item-bg': 'transparent',
          '--item-color': 'colors.fg',
          '--item-hover-bg': 'colors.bg.muted',

          '&.react-datepicker__month-text--keyboard-selected, &.react-datepicker__year-text--keyboard-selected':
            {
              '--item-bg': 'colors.bg.muted',
              '--item-color': 'colors.fg',
            },

          '&.react-datepicker__month-text--in-range, &.react-datepicker__month-text--in-selecting-range, &.react-datepicker__year-text--in-range, &.react-datepicker__year-text--in-selecting-range':
            {
              '--item-bg': 'colors.colorPalette.subtle',
              '--item-color': 'colors.colorPalette.fg',
              '--item-hover-bg': 'colors.colorPalette.muted',
              borderRadius: 0,
            },

          '&.react-datepicker__month-text--selected, &.react-datepicker__month-text--range-start, &.react-datepicker__month-text--range-end, &.react-datepicker__month-text--selecting-range-start, &.react-datepicker__year-text--selected, &.react-datepicker__year-text--range-start, &.react-datepicker__year-text--range-end, &.react-datepicker__year-text--selecting-range-start':
            {
              '--item-bg': 'colors.colorPalette.solid',
              '--item-color': 'colors.colorPalette.contrast',
              '--item-hover-bg': 'colors.colorPalette.solid',
              borderRadius: 'md',
            },

          '&.react-datepicker__month-text--today, &.react-datepicker__year-text--today': {
            fontWeight: 'bold',
            color: 'colors.colorPalette.solid',
            '&.react-datepicker__month-text--selected, &.react-datepicker__year-text--selected, &.react-datepicker__month-text--range-start, &.react-datepicker__year-text--range-start':
              {
                color: 'colors.colorPalette.contrast',
              },
          },

          bg: 'var(--item-bg)',
          color: 'var(--item-color)',
          borderRadius: 'md',
          transition: 'background-color 0.1s',
          _hover: { bg: 'var(--item-hover-bg)' },
        },
      }}
    >
      <ReactDatePicker
        {...props}
        customInput={<CustomInput isInvalid={isInvalid} autoComplete="off" />}
        showPopperArrow={false}
      />
    </Box>
  );
}
