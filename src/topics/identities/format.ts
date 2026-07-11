import {
  cubeDiffValue,
  cubeSumValue,
  diffCubesValue,
  diffSquaresValue,
  squareDiffValue,
  squareSumValue,
  sumCubesValue,
} from './math';

export function formatNumberAnswer(n: number): string {
  return String(n);
}

export function normalizeInput(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, '')
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/·/g, '*')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .toLowerCase();
}

export function parseNumberAnswer(input: string): number | null {
  const s = input.trim().replace(/−/g, '-').replace(',', '.');
  if (!/^-?\d+$/.test(s)) return null;
  const n = Number(s);
  return Number.isInteger(n) ? n : null;
}

export function checkNumberAnswer(input: string, expected: number): boolean {
  const parsed = parseNumberAnswer(input);
  return parsed !== null && parsed === expected;
}

export function formatExpandedSquareSum(a: number, b: number): string {
  return `${a}² + 2·${a}·${b} + ${b}²`;
}

export function formatExpandedSquareDiff(a: number, b: number): string {
  return `${a}² − 2·${a}·${b} + ${b}²`;
}

export function formatExpandedDiffSquares(a: number, b: number): string {
  return `${a}² − ${b}²`;
}

export function formatFactoredSquareSum(a: number, b: number): string {
  return `(${a}+${b})²`;
}

export function formatFactoredSquareDiff(a: number, b: number): string {
  return `(${a}-${b})²`;
}

export function formatFactoredDiffSquares(a: number, b: number): string {
  return `(${a}+${b})(${a}-${b})`;
}

export function formatExpandedCubeSum(a: number, b: number): string {
  return `${a}³ + 3·${a}²·${b} + 3·${a}·${b}² + ${b}³`;
}

export function formatExpandedCubeDiff(a: number, b: number): string {
  return `${a}³ − 3·${a}²·${b} + 3·${a}·${b}² − ${b}³`;
}

export function formatExpandedSumCubes(a: number, b: number): string {
  return `${a}³ + ${b}³`;
}

export function formatExpandedDiffCubes(a: number, b: number): string {
  return `${a}³ − ${b}³`;
}

export function formatFactoredCubeSum(a: number, b: number): string {
  return `(${a}+${b})³`;
}

export function formatFactoredCubeDiff(a: number, b: number): string {
  return `(${a}-${b})³`;
}

export function formatFactoredSumCubes(a: number, b: number): string {
  return `(${a}+${b})(${a}²-${a}*${b}+${b}²)`;
}

export function formatFactoredDiffCubes(a: number, b: number): string {
  return `(${a}-${b})(${a}²+${a}*${b}+${b}²)`;
}

export function formatFactoredSumCubesDisplay(a: number, b: number): string {
  return `(${a} + ${b})(${a}² − ${a}·${b} + ${b}²)`;
}

export function formatFactoredDiffCubesDisplay(a: number, b: number): string {
  return `(${a} − ${b})(${a}² + ${a}·${b} + ${b}²)`;
}

function parseFactoredSquare(input: string): { a: number; b: number; op: '+' | '-' } | null {
  const s = normalizeInput(input);
  const match = s.match(/^\((-?\d+)([+-])(\d+)\)²$/);
  if (!match) return null;
  return { a: Number(match[1]), b: Number(match[3]), op: match[2] as '+' | '-' };
}

function parseFactoredProduct(input: string): { a: number; b: number } | null {
  const s = normalizeInput(input);
  const match = s.match(/^\((-?\d+)\+(-?\d+)\)\((-?\d+)-(-?\d+)\)$/);
  if (!match) return null;
  const a1 = Number(match[1]);
  const b1 = Number(match[2]);
  const a2 = Number(match[3]);
  const b2 = Number(match[4]);
  if (a1 !== a2 || b1 !== b2) return null;
  return { a: a1, b: b1 };
}

function parseExpandedSquareSum(input: string): { a: number; b: number } | null {
  const s = normalizeInput(input);
  const match = s.match(/^(-?\d+)²\+2\*(-?\d+)\*(-?\d+)\+(-?\d+)²$/);
  if (!match) return null;
  const a = Number(match[1]);
  const midA = Number(match[2]);
  const midB = Number(match[3]);
  const b = Number(match[4]);
  if (a !== midA || b !== midB) return null;
  return { a, b };
}

function parseExpandedSquareDiff(input: string): { a: number; b: number } | null {
  const s = normalizeInput(input);
  const match = s.match(/^(-?\d+)²-2\*(-?\d+)\*(-?\d+)\+(-?\d+)²$/);
  if (!match) return null;
  const a = Number(match[1]);
  const midA = Number(match[2]);
  const midB = Number(match[3]);
  const b = Number(match[4]);
  if (a !== midA || b !== midB) return null;
  return { a, b };
}

function parseExpandedDiffSquares(input: string): { a: number; b: number } | null {
  const s = normalizeInput(input);
  const match = s.match(/^(-?\d+)²-(-?\d+)²$/);
  if (!match) return null;
  return { a: Number(match[1]), b: Number(match[2]) };
}

function parseFactoredCube(input: string): { a: number; b: number; op: '+' | '-' } | null {
  const s = normalizeInput(input);
  const match = s.match(/^\((-?\d+)([+-])(\d+)\)³$/);
  if (!match) return null;
  return { a: Number(match[1]), b: Number(match[3]), op: match[2] as '+' | '-' };
}

function parseExpandedCubeSum(input: string): { a: number; b: number } | null {
  const s = normalizeInput(input);
  const match = s.match(
    /^(-?\d+)³\+3\*(-?\d+)²\*(-?\d+)\+3\*(-?\d+)\*(-?\d+)²\+(-?\d+)³$/,
  );
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[6]);
  if (a !== Number(match[2]) || a !== Number(match[4]) || b !== Number(match[3]) || b !== Number(match[5])) {
    return null;
  }
  return { a, b };
}

function parseExpandedCubeDiff(input: string): { a: number; b: number } | null {
  const s = normalizeInput(input);
  const match = s.match(
    /^(-?\d+)³-3\*(-?\d+)²\*(-?\d+)\+3\*(-?\d+)\*(-?\d+)²-(-?\d+)³$/,
  );
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[6]);
  if (a !== Number(match[2]) || a !== Number(match[4]) || b !== Number(match[3]) || b !== Number(match[5])) {
    return null;
  }
  return { a, b };
}

function parseExpandedSumCubes(input: string): { a: number; b: number } | null {
  const s = normalizeInput(input);
  const match = s.match(/^(-?\d+)³\+(-?\d+)³$/);
  if (!match) return null;
  return { a: Number(match[1]), b: Number(match[2]) };
}

function parseExpandedDiffCubes(input: string): { a: number; b: number } | null {
  const s = normalizeInput(input);
  const match = s.match(/^(-?\d+)³-(-?\d+)³$/);
  if (!match) return null;
  return { a: Number(match[1]), b: Number(match[2]) };
}

function parseFactoredSumCubes(input: string): { a: number; b: number } | null {
  const s = normalizeInput(input);
  const match = s.match(/^\((-?\d+)\+(-?\d+)\)\((-?\d+)²-(-?\d+)\*(-?\d+)\+(-?\d+)²\)$/);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);
  if (a !== Number(match[3]) || b !== Number(match[6]) || a !== Number(match[4]) || b !== Number(match[5])) {
    return null;
  }
  return { a, b };
}

function parseFactoredDiffCubes(input: string): { a: number; b: number } | null {
  const s = normalizeInput(input);
  const match = s.match(/^\((-?\d+)-(-?\d+)\)\((-?\d+)²\+(-?\d+)\*(-?\d+)\+(-?\d+)²\)$/);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[2]);
  if (a !== Number(match[3]) || b !== Number(match[6]) || a !== Number(match[4]) || b !== Number(match[5])) {
    return null;
  }
  return { a, b };
}

export type IdentityVariant =
  | 'square-sum'
  | 'square-diff'
  | 'diff-squares'
  | 'cube-sum'
  | 'cube-diff'
  | 'sum-cubes'
  | 'diff-cubes';

export function checkIdentityAnswer(
  input: string,
  check: {
    variant: IdentityVariant;
    a: number;
    b: number;
    form: 'factored' | 'expanded';
  },
): boolean {
  if (check.form === 'factored') {
    if (check.variant === 'square-sum') {
      const parsed = parseFactoredSquare(input);
      return parsed !== null && parsed.op === '+' && parsed.a === check.a && parsed.b === check.b;
    }
    if (check.variant === 'square-diff') {
      const parsed = parseFactoredSquare(input);
      return parsed !== null && parsed.op === '-' && parsed.a === check.a && parsed.b === check.b;
    }
    if (check.variant === 'diff-squares') {
      const parsed = parseFactoredProduct(input);
      return parsed !== null && parsed.a === check.a && parsed.b === check.b;
    }
    if (check.variant === 'cube-sum') {
      const parsed = parseFactoredCube(input);
      return parsed !== null && parsed.op === '+' && parsed.a === check.a && parsed.b === check.b;
    }
    if (check.variant === 'cube-diff') {
      const parsed = parseFactoredCube(input);
      return parsed !== null && parsed.op === '-' && parsed.a === check.a && parsed.b === check.b;
    }
    if (check.variant === 'sum-cubes') {
      const parsed = parseFactoredSumCubes(input);
      return parsed !== null && parsed.a === check.a && parsed.b === check.b;
    }
    const parsed = parseFactoredDiffCubes(input);
    return parsed !== null && parsed.a === check.a && parsed.b === check.b;
  }

  if (check.variant === 'square-sum') {
    const parsed = parseExpandedSquareSum(input);
    return parsed !== null && parsed.a === check.a && parsed.b === check.b;
  }
  if (check.variant === 'square-diff') {
    const parsed = parseExpandedSquareDiff(input);
    return parsed !== null && parsed.a === check.a && parsed.b === check.b;
  }
  if (check.variant === 'diff-squares') {
    const parsed = parseExpandedDiffSquares(input);
    return parsed !== null && parsed.a === check.a && parsed.b === check.b;
  }
  if (check.variant === 'cube-sum') {
    const parsed = parseExpandedCubeSum(input);
    return parsed !== null && parsed.a === check.a && parsed.b === check.b;
  }
  if (check.variant === 'cube-diff') {
    const parsed = parseExpandedCubeDiff(input);
    return parsed !== null && parsed.a === check.a && parsed.b === check.b;
  }
  if (check.variant === 'sum-cubes') {
    const parsed = parseExpandedSumCubes(input);
    return parsed !== null && parsed.a === check.a && parsed.b === check.b;
  }
  const parsed = parseExpandedDiffCubes(input);
  return parsed !== null && parsed.a === check.a && parsed.b === check.b;
}

export function expectedIdentityValue(variant: IdentityVariant, a: number, b: number): number {
  switch (variant) {
    case 'square-sum':
      return squareSumValue(a, b);
    case 'square-diff':
      return squareDiffValue(a, b);
    case 'diff-squares':
      return diffSquaresValue(a, b);
    case 'cube-sum':
      return cubeSumValue(a, b);
    case 'cube-diff':
      return cubeDiffValue(a, b);
    case 'sum-cubes':
      return sumCubesValue(a, b);
    case 'diff-cubes':
      return diffCubesValue(a, b);
  }
}
