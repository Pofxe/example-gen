export function formatRootsAnswer(roots: [number, number]): string {
  const [r1, r2] = roots;
  if (r1 === r2) return String(r1);
  return `${r1}, ${r2}`;
}

export function normalizeInput(input: string): string {
  return input.trim().replace(/\s+/g, ' ').replace(/−/g, '-');
}

export function parseRootsAnswer(input: string): [number, number] | null {
  const s = normalizeInput(input).replace(/;/g, ',');
  const parts = s.split(',').map((p) => p.trim()).filter(Boolean);

  if (parts.length === 1) {
    if (!/^-?\d+$/.test(parts[0])) return null;
    const n = Number(parts[0]);
    return Number.isInteger(n) ? [n, n] : null;
  }

  if (parts.length !== 2) return null;
  if (!/^-?\d+$/.test(parts[0]) || !/^-?\d+$/.test(parts[1])) return null;

  const r1 = Number(parts[0]);
  const r2 = Number(parts[1]);
  if (!Number.isInteger(r1) || !Number.isInteger(r2)) return null;

  return r1 <= r2 ? [r1, r2] : [r2, r1];
}

export function checkRootsAnswer(input: string, expected: [number, number]): boolean {
  const parsed = parseRootsAnswer(input);
  return parsed !== null && parsed[0] === expected[0] && parsed[1] === expected[1];
}

export function formatVariableTerm(coeff: number, variable = 'x'): string {
  if (coeff === 1) return variable;
  if (coeff === -1) return `−${variable}`;
  return `${coeff}${variable}`;
}

export function formatSignedTerm(value: number, isFirst: boolean): string {
  if (isFirst) {
    return value < 0 ? `−${Math.abs(value)}` : String(value);
  }
  return value < 0 ? ` − ${Math.abs(value)}` : ` + ${value}`;
}

export function formatSignedVariableTerm(coeff: number, isFirst: boolean, variable = 'x'): string {
  const term = formatVariableTerm(coeff, variable);
  if (isFirst) {
    return coeff < 0 ? `−${formatVariableTerm(Math.abs(coeff), variable)}` : term;
  }
  return coeff < 0 ? ` − ${formatVariableTerm(Math.abs(coeff), variable)}` : ` + ${term}`;
}

export function formatSquaredTerm(coeff: number): string {
  if (coeff === 1) return 'x²';
  if (coeff === -1) return '−x²';
  return `${coeff}x²`;
}

export function formatSignedSquaredTerm(coeff: number, isFirst: boolean): string {
  const absTerm = formatSquaredTerm(Math.abs(coeff));
  if (isFirst) {
    return coeff < 0 ? `−${absTerm}` : absTerm;
  }
  return coeff < 0 ? ` − ${absTerm}` : ` + ${absTerm}`;
}

export function formatQuadraticEquation(a: number, b: number, c: number): string {
  let expr = '';
  let isFirst = true;

  if (a !== 0) {
    expr += formatSignedSquaredTerm(a, isFirst);
    isFirst = false;
  }
  if (b !== 0) {
    expr += formatSignedVariableTerm(b, isFirst);
    isFirst = false;
  }
  if (c !== 0) {
    expr += formatSignedTerm(c, isFirst);
  }

  if (!expr) return '0 = 0';
  return `${expr} = 0`;
}

export function formatPureSquareEquation(a: number, c: number): string {
  return `${formatSquaredTerm(a)} = ${c}`;
}

export function formatNoLinearEquation(c: number): string {
  return `x²${formatSignedTerm(c, false)} = 0`;
}

export function formatNoConstantEquation(a: number, b: number): string {
  return `${formatSignedSquaredTerm(a, true)}${formatSignedVariableTerm(b, false)} = 0`;
}
