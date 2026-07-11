import type { Problem } from '../../types';
import { checkRootsAnswer } from './format';

export function checkQuadraticEquationAnswer(problem: Problem, input: string): boolean {
  if (!problem.check) {
    return input.trim() === problem.answer.trim();
  }

  if (problem.check.kind === 'quadratic-roots') {
    return checkRootsAnswer(input, problem.check.roots);
  }

  return false;
}
