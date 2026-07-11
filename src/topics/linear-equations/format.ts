export function formatNumberAnswer(n: number): string {
  return String(n);
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

export function checkNumberAnswer(input: string, expected: number): boolean {
  const parsed = parseNumberAnswer(input);
  return parsed !== null && parsed === expected;
}

export function formatVariableTerm(coeff: number, variable = 'x'): string {
  if (coeff === 1) return variable;
  if (coeff === -1) return `−${variable}`;
  return `${coeff}${variable}`;
}

/** Знаковое слагаемое: + 5, − 3 (не для первого) */
export function formatSignedTerm(value: number, isFirst: boolean): string {
  if (isFirst) {
    return value < 0 ? `−${Math.abs(value)}` : String(value);
  }
  return value < 0 ? ` − ${Math.abs(value)}` : ` + ${value}`;
}

/** Знаковое слагаемое с x */
export function formatSignedVariableTerm(coeff: number, isFirst: boolean, variable = 'x'): string {
  const term = formatVariableTerm(coeff, variable);
  if (isFirst) {
    return coeff < 0 ? `−${formatVariableTerm(Math.abs(coeff), variable)}` : term;
  }
  return coeff < 0 ? ` − ${formatVariableTerm(Math.abs(coeff), variable)}` : ` + ${term}`;
}

export function formatStandardEquation(a: number, b: number, c: number): string {
  const left = `${formatSignedVariableTerm(a, true)}${formatSignedTerm(b, false)}`;
  return `${left} = ${c}`;
}

export function formatSimpleEquation(a: number, c: number): string {
  return `${formatVariableTerm(a)} = ${c}`;
}

export function formatUnitEquation(b: number, c: number): string {
  return `x${formatSignedTerm(b, false)} = ${c}`;
}

export function formatBothSidesEquation(a: number, b: number, c: number, d: number): string {
  const left = `${formatSignedVariableTerm(a, true)}${formatSignedTerm(b, false)}`;
  const right = `${formatSignedVariableTerm(c, true)}${formatSignedTerm(d, false)}`;
  return `${left} = ${right}`;
}
