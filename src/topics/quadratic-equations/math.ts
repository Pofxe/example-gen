import type { QuadraticCoeffs } from './types';

export function randomInt(min: number, max: number): number {
  if (min > max) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickNonZeroInt(min: number, max: number, allowNegative: boolean): number {
  for (let i = 0; i < 200; i++) {
    let n = randomInt(min, max);
    if (!allowNegative) n = Math.abs(n) || randomInt(Math.max(1, min), max);
    else if (n === 0) n = randomInt(1, max) * (Math.random() < 0.5 ? -1 : 1);
    if (n !== 0) return n;
  }
  return allowNegative ? -1 : 1;
}

export function sortRoots(r1: number, r2: number): [number, number] {
  return r1 <= r2 ? [r1, r2] : [r2, r1];
}

export function coeffsFromRoots(a: number, r1: number, r2: number): QuadraticCoeffs {
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;
  return { a, b, c, roots: sortRoots(r1, r2) };
}
