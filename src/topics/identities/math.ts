export function randomInt(min: number, max: number): number {
  if (min > max) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function intPow(base: number, exponent: number): number {
  if (!Number.isInteger(exponent) || exponent < 0) return NaN;
  let result = 1;
  for (let i = 0; i < exponent; i++) {
    result *= base;
  }
  return result;
}

export function squareSumValue(a: number, b: number): number {
  return intPow(a + b, 2);
}

export function squareDiffValue(a: number, b: number): number {
  return intPow(a - b, 2);
}

export function diffSquaresValue(a: number, b: number): number {
  return intPow(a, 2) - intPow(b, 2);
}

export function cubeSumValue(a: number, b: number): number {
  return intPow(a + b, 3);
}

export function cubeDiffValue(a: number, b: number): number {
  return intPow(a - b, 3);
}

export function sumCubesValue(a: number, b: number): number {
  return intPow(a, 3) + intPow(b, 3);
}

export function diffCubesValue(a: number, b: number): number {
  return intPow(a, 3) - intPow(b, 3);
}
