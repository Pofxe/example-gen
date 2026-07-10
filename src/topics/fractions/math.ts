export interface Frac {
  num: number;
  den: number;
}

export interface Mixed {
  whole: number;
  num: number;
  den: number;
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a * b) / gcd(a, b));
}

export function randomInt(min: number, max: number): number {
  if (min > max) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function reduce(f: Frac): Frac {
  if (f.num === 0) return { num: 0, den: 1 };
  const g = gcd(f.num, f.den);
  let num = f.num / g;
  let den = f.den / g;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  return { num, den };
}

export function fracToNumber(f: Frac): number {
  return f.num / f.den;
}

export function toImproper(m: Mixed): Frac {
  const sign = m.whole < 0 || m.num < 0 ? -1 : 1;
  const whole = Math.abs(m.whole);
  const num = Math.abs(m.num);
  const den = m.den;
  const total = whole * den + num;
  return reduce({ num: sign * total, den });
}

export function toMixed(f: Frac): Mixed {
  const r = reduce(f);
  const negative = r.num < 0;
  let num = Math.abs(r.num);
  const den = r.den;
  const whole = Math.floor(num / den) * (negative ? -1 : 1);
  num = num % den;
  return { whole, num, den };
}

export function addFrac(a: Frac, b: Frac): Frac {
  const den = lcm(a.den, b.den);
  const num = a.num * (den / a.den) + b.num * (den / b.den);
  return reduce({ num, den });
}

export function subFrac(a: Frac, b: Frac): Frac {
  const den = lcm(a.den, b.den);
  const num = a.num * (den / a.den) - b.num * (den / b.den);
  return reduce({ num, den });
}

export function mulFrac(a: Frac, b: Frac): Frac {
  return reduce({ num: a.num * b.num, den: a.den * b.den });
}

export function divFrac(a: Frac, b: Frac): Frac | null {
  if (b.num === 0) return null;
  return reduce({ num: a.num * b.den, den: a.den * b.num });
}

export function compareFrac(a: Frac, b: Frac): -1 | 0 | 1 {
  const va = fracToNumber(a);
  const vb = fracToNumber(b);
  if (va < vb) return -1;
  if (va > vb) return 1;
  return 0;
}

export function toCommonDenominator(a: Frac, b: Frac): { a: Frac; b: Frac; lcd: number } {
  const lcd = lcm(a.den, b.den);
  return {
    lcd,
    a: { num: a.num * (lcd / a.den), den: lcd },
    b: { num: b.num * (lcd / b.den), den: lcd },
  };
}

export function decimalToFrac(value: number, maxDen: number): Frac | null {
  const sign = value < 0 ? -1 : 1;
  const abs = Math.abs(value);

  let best: Frac | null = null;
  let bestErr = Infinity;

  for (let den = 1; den <= maxDen; den++) {
    const num = Math.round(abs * den);
    const err = Math.abs(abs - num / den);
    if (err < 1e-9 && err < bestErr) {
      bestErr = err;
      best = reduce({ num: sign * num, den });
    }
  }

  return best;
}

export function fracToDecimal(f: Frac, places: number): string {
  const n = fracToNumber(reduce(f));
  return n.toFixed(places).replace(/\.?0+$/, '') || '0';
}

export function roundDecimal(n: number, places: number): number {
  const p = 10 ** places;
  return Math.round(n * p) / p;
}

export type FracOp = '+' | '-' | '*' | '/';

export function applyFracOp(a: Frac, op: FracOp, b: Frac): Frac | null {
  switch (op) {
    case '+':
      return addFrac(a, b);
    case '-':
      return subFrac(a, b);
    case '*':
      return mulFrac(a, b);
    case '/':
      return divFrac(a, b);
    default:
      return null;
  }
}

export function applyDecimalOp(a: number, op: FracOp, b: number): number | null {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b === 0 ? null : a / b;
    default:
      return null;
  }
}
