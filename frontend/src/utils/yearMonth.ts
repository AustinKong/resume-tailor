export type YearMonth = string & { readonly __brand: 'YearMonth' };

const YM_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const pad = (n: number) => String(n).padStart(2, '0');

function fromParts(year: number, month: number): YearMonth {
  return `${year}-${pad(month)}` as YearMonth;
}

function fromDate(d: Date): YearMonth {
  return fromParts(d.getFullYear(), d.getMonth() + 1);
}

function today(): YearMonth {
  return fromDate(new Date());
}

function is(value: string): value is YearMonth {
  return YM_RE.test(value);
}

export function parse(value: string): YearMonth {
  if (!YM_RE.test(value)) {
    throw new Error(`Invalid YearMonth: ${value}`);
  }
  return value as YearMonth;
}

export const YearMonth = {
  fromParts,
  fromDate,
  today,
  is,
  parse,
};
