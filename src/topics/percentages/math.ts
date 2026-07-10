export function randomInt(min: number, max: number): number {
  if (min > max) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function roundTo(n: number, places: number): number {
  const p = 10 ** places;
  return Math.round(n * p) / p;
}

export function isInteger(n: number): boolean {
  return Number.isInteger(n);
}

export function percentOf(percent: number, number: number): number {
  return (percent / 100) * number;
}

export function numberFromPercent(percent: number, part: number): number {
  return (part * 100) / percent;
}

export function findPercent(part: number, whole: number): number {
  return (part / whole) * 100;
}

export function increaseByPercent(base: number, percent: number): number {
  return base + percentOf(percent, base);
}

export function decreaseByPercent(base: number, percent: number): number {
  return base - percentOf(percent, base);
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

export interface Frac {
  num: number;
  den: number;
}

export function reduceFrac(f: Frac): Frac {
  const g = gcd(f.num, f.den);
  return { num: f.num / g, den: f.den / g };
}

export function fracToPercent(f: Frac): number {
  return (f.num / f.den) * 100;
}

export function percentToFrac(percent: number): Frac {
  return reduceFrac({ num: percent, den: 100 });
}

export function compareValues(a: number, b: number): -1 | 0 | 1 {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
