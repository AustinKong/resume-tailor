// A simple implementation for handling ISO date strings in a type-safe manner
// Can be replaced with Temporal API in the future

// Full date: YYYY-MM-DD
export type ISODate = string & { readonly __brand: 'ISODate' };

// Year and month only: YYYY-MM
export type ISOYearMonth = string & { readonly __brand: 'ISOYearMonth' };

const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const YEAR_MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const pad = (n: number) => String(n).padStart(2, '0');

// === ISODate utilities ===

function dateFromParts(year: number, month: number, day: number): ISODate {
  return `${year}-${pad(month)}-${pad(day)}` as ISODate;
}

function dateFromNativeDate(d: Date): ISODate {
  return dateFromParts(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

function dateToday(): ISODate {
  return dateFromNativeDate(new Date());
}

function isISODate(value: string): value is ISODate {
  return DATE_RE.test(value);
}

function parseISODate(value: string): ISODate {
  if (!DATE_RE.test(value)) {
    throw new Error(`Invalid ISODate: ${value}`);
  }
  return value as ISODate;
}

export const ISODate = {
  fromParts: dateFromParts,
  fromNativeDate: dateFromNativeDate,
  today: dateToday,
  is: isISODate,
  parse: parseISODate,
};

// === ISOYearMonth utilities ===

function yearMonthFromParts(year: number, month: number): ISOYearMonth {
  return `${year}-${pad(month)}` as ISOYearMonth;
}

function yearMonthFromDate(d: Date): ISOYearMonth {
  return yearMonthFromParts(d.getFullYear(), d.getMonth() + 1);
}

function yearMonthToday(): ISOYearMonth {
  return yearMonthFromDate(new Date());
}

function isISOYearMonth(value: string): value is ISOYearMonth {
  return YEAR_MONTH_RE.test(value);
}

function parseISOYearMonth(value: string): ISOYearMonth {
  if (!YEAR_MONTH_RE.test(value)) {
    throw new Error(`Invalid ISOYearMonth: ${value}`);
  }
  return value as ISOYearMonth;
}

export const ISOYearMonth = {
  fromParts: yearMonthFromParts,
  fromDate: yearMonthFromDate,
  today: yearMonthToday,
  is: isISOYearMonth,
  parse: parseISOYearMonth,
};
