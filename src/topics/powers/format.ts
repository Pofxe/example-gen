export function formatNumberAnswer(n: number): string {
  return String(n);
}

export function formatComparisonAnswer(cmp: -1 | 0 | 1): string {
  if (cmp < 0) return '<';
  if (cmp > 0) return '>';
  return '=';
}

export function normalizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ').replace(',', '.').replace(/−/g, '-');
}

export function parseNumberAnswer(input: string): number | null {
  const s = normalizeInput(input);
  if (!/^-?\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isInteger(n) ? n : null;
}

export function parseComparisonAnswer(input: string): -1 | 0 | 1 | null {
  const s = normalizeInput(input);
  if (s === '<') return -1;
  if (s === '>') return 1;
  if (s === '=') return 0;
  return null;
}

export function checkNumberAnswer(input: string, expected: number): boolean {
  const parsed = parseNumberAnswer(input);
  return parsed !== null && parsed === expected;
}

export function checkComparisonAnswer(input: string, expected: -1 | 0 | 1): boolean {
  return parseComparisonAnswer(input) === expected;
}
