import { roundTo } from './math';

export function formatNumberAnswer(n: number, places: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(roundTo(n, places)).replace(/\.?0+$/, '') || '0';
}

export function formatPercentAnswer(n: number, places: number): string {
  return formatNumberAnswer(n, places);
}

export function formatComparisonAnswer(cmp: -1 | 0 | 1): string {
  if (cmp < 0) return '<';
  if (cmp > 0) return '>';
  return '=';
}

export function formatFracAnswer(num: number, den: number): string {
  if (num % den === 0) return String(num / den);
  return `${num}/${den}`;
}

export function normalizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ').replace(',', '.').replace(/−/g, '-');
}

export function parseNumberAnswer(input: string): number | null {
  const s = normalizeInput(input);
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function parseComparisonAnswer(input: string): -1 | 0 | 1 | null {
  const s = normalizeInput(input);
  if (s === '<') return -1;
  if (s === '>') return 1;
  if (s === '=') return 0;
  return null;
}

export function parseFracAnswer(input: string): { num: number; den: number } | null {
  const s = normalizeInput(input);
  const mixed = s.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const num = Number(mixed[2]);
    const den = Number(mixed[3]);
    if (den === 0 || num < 0 || num >= den) return null;
    const sign = whole < 0 ? -1 : 1;
    return { num: sign * (Math.abs(whole) * den + num), den };
  }
  const proper = s.match(/^(-?\d+)\/(\d+)$/);
  if (proper) {
    const den = Number(proper[2]);
    if (den === 0) return null;
    return { num: Number(proper[1]), den };
  }
  const whole = s.match(/^-?\d+$/);
  if (whole) return { num: Number(s), den: 1 };
  return null;
}

export function checkNumberAnswer(input: string, expected: number, places: number): boolean {
  const parsed = parseNumberAnswer(input);
  if (parsed === null) return false;
  return roundTo(parsed, places) === roundTo(expected, places);
}

export function checkPercentAnswer(input: string, expected: number, places: number): boolean {
  return checkNumberAnswer(input, expected, places);
}

export function checkComparisonAnswer(input: string, expected: -1 | 0 | 1): boolean {
  return parseComparisonAnswer(input) === expected;
}

export function checkFracAnswer(
  input: string,
  expected: { num: number; den: number },
): boolean {
  const parsed = parseFracAnswer(input);
  if (!parsed) return false;
  return parsed.num * expected.den === expected.num * parsed.den;
}
