import type { Problem } from '../../types';
import { checkIdentityAnswer, checkNumberAnswer } from './format';

export function checkIdentityProblemAnswer(problem: Problem, input: string): boolean {
  if (!problem.check) {
    return input.trim() === problem.answer.trim();
  }

  switch (problem.check.kind) {
    case 'integer':
      return checkNumberAnswer(input, problem.check.value);
    case 'identity':
      return checkIdentityAnswer(input, problem.check);
    default:
      return false;
  }
}
