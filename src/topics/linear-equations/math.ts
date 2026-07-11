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

export function solveStandard(a: number, b: number, c: number): number | null {
  if (a === 0) return null;
  return (c - b) / a;
}

export function solveBothSides(a: number, b: number, c: number, d: number): number | null {
  const leftCoeff = a - c;
  if (leftCoeff === 0) return null;
  return (d - b) / leftCoeff;
}
