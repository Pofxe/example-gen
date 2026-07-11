import type { Problem } from '../../types';
import { checkNumberAnswer } from './format';

export function checkLinearEquationAnswer(problem: Problem, input: string): boolean {
  if (!problem.check) {
    return input.trim() === problem.answer.trim();
  }

  if (problem.check.kind === 'integer') {
    return checkNumberAnswer(input, problem.check.value);
  }

  return false;
}
