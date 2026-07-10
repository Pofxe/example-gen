import type { Problem } from '../../types';
import {
  checkNumberAnswer,
  checkPercentAnswer,
  checkComparisonAnswer,
  checkFracAnswer,
} from './format';

export function checkPercentProblemAnswer(problem: Problem, input: string): boolean {
  if (!problem.check) {
    return input.trim() === problem.answer.trim();
  }

  switch (problem.check.kind) {
    case 'integer':
      return checkNumberAnswer(input, problem.check.value, 0);
    case 'decimal':
      return checkNumberAnswer(input, problem.check.value, problem.check.places);
    case 'percent':
      return checkPercentAnswer(input, problem.check.value, problem.check.places);
    case 'compare':
      return checkComparisonAnswer(input, problem.check.value);
    case 'frac':
      return checkFracAnswer(input, problem.check.value);
    default:
      return false;
  }
}
