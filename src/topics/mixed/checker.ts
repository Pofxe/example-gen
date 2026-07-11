import type { Problem } from '../../types';
import { checkAnswer as checkArithmeticAnswer } from '../arithmetic/evaluator';
import { checkFractionProblemAnswer } from '../fractions/checker';
import { checkPercentProblemAnswer } from '../percentages/checker';
import { checkPowerProblemAnswer } from '../powers/checker';
import { checkRootProblemAnswer } from '../roots/checker';
import { checkIdentityProblemAnswer } from '../identities/checker';
import { checkLinearEquationAnswer } from '../linear-equations/checker';
import { checkQuadraticEquationAnswer } from '../quadratic-equations/checker';
import type { MixableTopicId } from './types';

export function checkMixedProblemAnswer(problem: Problem, input: string): boolean {
  const topicId = problem.sourceTopicId as MixableTopicId | undefined;

  switch (topicId) {
    case 'arithmetic':
      if (problem.check?.kind === 'integer') {
        return checkArithmeticAnswer(input, problem.check.value);
      }
      return checkArithmeticAnswer(input, Number(problem.answer));
    case 'fractions':
      return checkFractionProblemAnswer(problem, input);
    case 'percentages':
      return checkPercentProblemAnswer(problem, input);
    case 'powers':
      return checkPowerProblemAnswer(problem, input);
    case 'roots':
      return checkRootProblemAnswer(problem, input);
    case 'identities':
      return checkIdentityProblemAnswer(problem, input);
    case 'linear-equations':
      return checkLinearEquationAnswer(problem, input);
    case 'quadratic-equations':
      return checkQuadraticEquationAnswer(problem, input);
    default:
      return input.trim() === problem.answer.trim();
  }
}
