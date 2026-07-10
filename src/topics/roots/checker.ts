import type { Problem } from '../../types';
import { checkNumberAnswer, checkComparisonAnswer } from './format';

export function checkRootProblemAnswer(problem: Problem, input: string): boolean {
  if (!problem.check) {
    return input.trim() === problem.answer.trim();
  }

  switch (problem.check.kind) {
    case 'integer':
      return checkNumberAnswer(input, problem.check.value);
    case 'compare':
      return checkComparisonAnswer(input, problem.check.value);
    default:
      return false;
  }
}
