// A simple implementation for handling ISO date strings in a type-safe manner
// Can be replaced with Temporal API in the future

// Full date: YYYY-MM-DD
export type ISODate = string & { readonly __brand: 'ISODate' };

// Full datetime: YYYY-MM-DDTHH:MM:SS.sssZ or similar ISO format
export type ISODatetime = string & { readonly __brand: 'ISODatetime' };

// Year and month only: YYYY-MM
export type ISOYearMonth = string & { readonly __brand: 'ISOYearMonth' };

const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const DATETIME_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
const YEAR_MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const pad = (n: number) => String(n).padStart(2, '0');

// === ISODate utilities ===

function dateFromParts(year: number, month: number, day: number): ISODate {
  return `${year}-${pad(month)}-${pad(day)}` as ISODate;
}

function dateFromNativeDate(d: Date): ISODate {
  return dateFromParts(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
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

// === ISODatetime utilities ===

function datetimeFromNativeDate(d: Date): ISODatetime {
  return d.toISOString() as ISODatetime;
}

function datetimeNow(): ISODatetime {
  return datetimeFromNativeDate(new Date());
}

function isISODatetime(value: string): value is ISODatetime {
  return DATETIME_RE.test(value);
}

function parseISODatetime(value: string): ISODatetime {
  if (!DATETIME_RE.test(value)) {
    throw new Error(`Invalid ISODatetime: ${value}`);
  }
  return value as ISODatetime;
}

export const ISODatetime = {
  fromNativeDate: datetimeFromNativeDate,
  now: datetimeNow,
  is: isISODatetime,
  parse: parseISODatetime,
};

// === ISOYearMonth utilities ===

function yearMonthFromParts(year: number, month: number): ISOYearMonth {
  return `${year}-${pad(month)}` as ISOYearMonth;
}

function yearMonthFromDate(d: Date): ISOYearMonth {
  return yearMonthFromParts(d.getUTCFullYear(), d.getUTCMonth() + 1);
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
