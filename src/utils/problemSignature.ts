import type { ExprPart, Problem } from '../types';

/** Каноническая подпись примера для проверки на дубликаты */
export function problemSignature(problem: Pick<Problem, 'parts'>): string {
  return JSON.stringify(normalizeParts(problem.parts));
}

function normalizeParts(parts: ExprPart[]): unknown[] {
  return parts.map((part) => {
    if (part.kind === 'text') {
      return { t: part.text.replace(/\s+/g, ' ').trim() };
    }
    if (part.kind === 'decimal') {
      return { d: part.value };
    }
    return { f: part.num, den: part.den, w: part.whole ?? null };
  });
}

/** Генерирует уникальные примеры без повторяющихся условий */
export function fillUniqueProblems(
  count: number,
  generate: () => Problem | null,
  maxTotalAttempts = count * 500,
): Problem[] {
  const seen = new Set<string>();
  const problems: Problem[] = [];
  let attempts = 0;

  while (problems.length < count && attempts < maxTotalAttempts) {
    attempts++;
    const problem = generate();
    if (!problem) continue;

    const signature = problemSignature(problem);
    if (seen.has(signature)) continue;

    seen.add(signature);
    problems.push(problem);
  }

  return problems;
}
