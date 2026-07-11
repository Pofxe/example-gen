export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomBool(probability = 0.5): boolean {
  return Math.random() < probability;
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)];
}

export function pickRandomSubset<T>(items: readonly T[], minCount = 1): T[] {
  const count = randomInt(Math.min(minCount, items.length), items.length);
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function randomOrderedRange(minCap: number, maxCap: number): { min: number; max: number } {
  const a = randomInt(minCap, maxCap);
  const b = randomInt(minCap, maxCap);
  return { min: Math.min(a, b), max: Math.max(a, b) };
}
