import type { Problem } from '../../types';
import {
  checkCommonDenomAnswer,
  checkComparisonAnswer,
  checkDecimalAnswer,
  checkFracAnswer,
} from './format';

/** Проверка ответа на задачу по дробям */
export function checkFractionProblemAnswer(problem: Problem, input: string): boolean {
  if (!problem.check) {
    return normalize(input) === normalize(problem.answer);
  }

  switch (problem.check.kind) {
    case 'frac':
      return checkFracAnswer(input, problem.check.value);
    case 'compare':
      return checkComparisonAnswer(input, problem.check.value);
    case 'decimal':
      return checkDecimalAnswer(input, problem.check.value, problem.check.places);
    case 'common-denom':
      return checkCommonDenomAnswer(input, problem.check.a, problem.check.b);
    case 'integer':
      return parseUserAnswer(input) === problem.check.value;
    default:
      return false;
  }
}

function parseUserAnswer(input: string): number | null {
  const s = input.trim().replace(',', '.');
  if (!/^-?\d+$/.test(s)) return null;
  return Number(s);
}

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

export { checkFracAnswer, checkComparisonAnswer, checkDecimalAnswer };
