import type { Frac, Mixed } from './math';
import { reduce, toImproper } from './math';

/** Ответ: «целое числитель/знаменатель» или «числитель/знаменатель» */
export function formatFracAnswer(f: Frac): string {
  const r = reduce(f);
  if (r.num === 0) return '0';

  if (r.num % r.den === 0) {
    return String(r.num / r.den);
  }

  const negative = r.num < 0;
  const absNum = Math.abs(r.num);
  const whole = Math.floor(absNum / r.den);
  const num = absNum % r.den;

  if (whole === 0) {
    return `${negative ? '-' : ''}${num}/${r.den}`;
  }
  if (num === 0) {
    return String(r.num / r.den);
  }
  return `${negative ? '-' : ''}${whole} ${num}/${r.den}`;
}

export function formatMixedAnswer(m: Mixed): string {
  return formatFracAnswer(toImproper(m));
}

export function formatComparisonAnswer(cmp: -1 | 0 | 1): string {
  if (cmp < 0) return '<';
  if (cmp > 0) return '>';
  return '=';
}

export function formatCommonDenomAnswer(a: Frac, b: Frac): string {
  return `${formatFracAnswer(a)} ${formatFracAnswer(b)}`;
}

export function normalizeAnswerInput(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/,/g, '.')
    .replace(/−/g, '-')
    .toLowerCase();
}

/** Парсинг ответа-дроби: 2 3/4, 3/4, -1 1/2, 5 */
export function parseFracAnswer(input: string): Frac | null {
  const s = normalizeAnswerInput(input);
  if (!s) return null;

  const cmp = s.match(/^([<>]=?|=)$/);
  if (cmp) {
    if (s === '<' || s === '>' || s === '=') return null;
  }

  const mixed = s.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const num = Number(mixed[2]);
    const den = Number(mixed[3]);
    if (den === 0 || num < 0 || num >= den) return null;
    const sign = whole < 0 ? -1 : 1;
    return reduce({ num: sign * (Math.abs(whole) * den + num), den });
  }

  const proper = s.match(/^(-?\d+)\/(\d+)$/);
  if (proper) {
    const num = Number(proper[1]);
    const den = Number(proper[2]);
    if (den === 0) return null;
    return reduce({ num, den });
  }

  const whole = s.match(/^-?\d+$/);
  if (whole) {
    const n = Number(s);
    return reduce({ num: n, den: 1 });
  }

  return null;
}

export function parseComparisonAnswer(input: string): -1 | 0 | 1 | null {
  const s = normalizeAnswerInput(input);
  if (s === '<') return -1;
  if (s === '>') return 1;
  if (s === '=') return 0;
  return null;
}

export function parseDecimalAnswer(input: string): number | null {
  const s = normalizeAnswerInput(input);
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function fracAnswersEqual(a: Frac, b: Frac): boolean {
  const ra = reduce(a);
  const rb = reduce(b);
  return ra.num === rb.num && ra.den === rb.den;
}

export function checkFracAnswer(input: string, expected: Frac): boolean {
  const parsed = parseFracAnswer(input);
  if (!parsed) return false;
  return fracAnswersEqual(parsed, expected);
}

export function checkComparisonAnswer(input: string, expected: -1 | 0 | 1): boolean {
  const parsed = parseComparisonAnswer(input);
  return parsed === expected;
}

export function checkDecimalAnswer(input: string, expected: number, places: number): boolean {
  const parsed = parseDecimalAnswer(input);
  if (parsed === null) return false;
  const rounded = Math.round(expected * 10 ** places) / 10 ** places;
  const parsedRounded = Math.round(parsed * 10 ** places) / 10 ** places;
  return parsedRounded === rounded;
}

export function checkCommonDenomAnswer(
  input: string,
  expectedA: Frac,
  expectedB: Frac,
): boolean {
  const parts = normalizeAnswerInput(input).split(/\s+/);
  if (parts.length < 2) return false;
  const a = parseFracAnswer(parts[0]);
  const b = parseFracAnswer(parts[1]);
  if (!a || !b) return false;
  if (a.den !== b.den) return false;
  return fracAnswersEqual(a, expectedA) && fracAnswersEqual(b, expectedB);
}
