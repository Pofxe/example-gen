import type { Problem, ExprPart } from '../../types';
import type { IdentitySettings, IdentityMode } from './types';
import { randomInt, squareSumValue, squareDiffValue, diffSquaresValue, cubeSumValue, cubeDiffValue, sumCubesValue, diffCubesValue } from './math';
import {
  formatNumberAnswer,
  formatExpandedSquareSum,
  formatExpandedSquareDiff,
  formatExpandedDiffSquares,
  formatFactoredSquareSum,
  formatFactoredSquareDiff,
  formatFactoredDiffSquares,
  formatExpandedCubeSum,
  formatExpandedCubeDiff,
  formatExpandedSumCubes,
  formatExpandedDiffCubes,
  formatFactoredCubeSum,
  formatFactoredCubeDiff,
  formatFactoredSumCubes,
  formatFactoredDiffCubes,
  formatFactoredSumCubesDisplay,
  formatFactoredDiffCubesDisplay,
} from './format';
import { fillUniqueProblems } from '../../utils/problemSignature';

let problemCounter = 0;

function textPart(text: string): ExprPart {
  return { kind: 'text', text };
}

function makeProblem(
  id: string,
  parts: ExprPart[],
  answer: string,
  check: Problem['check'],
  placeholder?: string,
): Problem {
  return {
    id,
    parts,
    answer,
    answerDisplay: answer,
    check,
    inputPlaceholder: placeholder,
  };
}

function pickPair(settings: IdentitySettings): { a: number; b: number } {
  let a = randomInt(settings.minValue, settings.maxValue);
  let b = randomInt(settings.minValue, settings.maxValue);
  if (b > a) [a, b] = [b, a];
  return { a, b };
}

function isAnswerAllowed(problem: Problem, settings: IdentitySettings): boolean {
  if (settings.allowNegativeAnswer || !problem.check) return true;

  if (problem.check.kind === 'integer') {
    return problem.check.value >= 0;
  }

  return true;
}

function genSquareSumDirect(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const value = squareSumValue(a, b);

  return makeProblem(
    id,
    [textPart(`(${a} + ${b})² = ?`)],
    formatNumberAnswer(value),
    { kind: 'integer', value },
  );
}

function genSquareSumExpand(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const answer = formatExpandedSquareSum(a, b);

  return makeProblem(
    id,
    [textPart(`(${a} + ${b})² = ?`)],
    answer,
    { kind: 'identity', variant: 'square-sum', a, b, form: 'expanded' },
    'a² + 2ab + b²',
  );
}

function genSquareSumFactor(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const answer = formatFactoredSquareSum(a, b);

  return makeProblem(
    id,
    [textPart(`${formatExpandedSquareSum(a, b)} = ?`)],
    answer,
    { kind: 'identity', variant: 'square-sum', a, b, form: 'factored' },
    '(a+b)²',
  );
}

function genSquareSumFromExpanded(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const value = squareSumValue(a, b);

  return makeProblem(
    id,
    [textPart(`${formatExpandedSquareSum(a, b)} = ?`)],
    formatNumberAnswer(value),
    { kind: 'integer', value },
  );
}

function genSquareDiffDirect(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const value = squareDiffValue(a, b);

  return makeProblem(
    id,
    [textPart(`(${a} − ${b})² = ?`)],
    formatNumberAnswer(value),
    { kind: 'integer', value },
  );
}

function genSquareDiffExpand(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const answer = formatExpandedSquareDiff(a, b);

  return makeProblem(
    id,
    [textPart(`(${a} − ${b})² = ?`)],
    answer,
    { kind: 'identity', variant: 'square-diff', a, b, form: 'expanded' },
    'a² − 2ab + b²',
  );
}

function genSquareDiffFactor(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const answer = formatFactoredSquareDiff(a, b);

  return makeProblem(
    id,
    [textPart(`${formatExpandedSquareDiff(a, b)} = ?`)],
    answer,
    { kind: 'identity', variant: 'square-diff', a, b, form: 'factored' },
    '(a−b)²',
  );
}

function genSquareDiffFromExpanded(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const value = squareDiffValue(a, b);

  return makeProblem(
    id,
    [textPart(`${formatExpandedSquareDiff(a, b)} = ?`)],
    formatNumberAnswer(value),
    { kind: 'integer', value },
  );
}

function genDiffSquaresDirect(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const value = diffSquaresValue(a, b);

  return makeProblem(
    id,
    [textPart(`(${a} + ${b})(${a} − ${b}) = ?`)],
    formatNumberAnswer(value),
    { kind: 'integer', value },
  );
}

function genDiffSquaresFactor(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const answer = formatFactoredDiffSquares(a, b);

  return makeProblem(
    id,
    [textPart(`${formatExpandedDiffSquares(a, b)} = ?`)],
    answer,
    { kind: 'identity', variant: 'diff-squares', a, b, form: 'factored' },
    '(a+b)(a−b)',
  );
}

function genDiffSquaresFromExpanded(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const value = diffSquaresValue(a, b);

  return makeProblem(
    id,
    [textPart(`${formatExpandedDiffSquares(a, b)} = ?`)],
    formatNumberAnswer(value),
    { kind: 'integer', value },
  );
}

function genCubeSumDirect(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const value = cubeSumValue(a, b);

  return makeProblem(
    id,
    [textPart(`(${a} + ${b})³ = ?`)],
    formatNumberAnswer(value),
    { kind: 'integer', value },
  );
}

function genCubeSumExpand(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const answer = formatExpandedCubeSum(a, b);

  return makeProblem(
    id,
    [textPart(`(${a} + ${b})³ = ?`)],
    answer,
    { kind: 'identity', variant: 'cube-sum', a, b, form: 'expanded' },
    'a³ + 3a²b + 3ab² + b³',
  );
}

function genCubeSumFactor(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const answer = formatFactoredCubeSum(a, b);

  return makeProblem(
    id,
    [textPart(`${formatExpandedCubeSum(a, b)} = ?`)],
    answer,
    { kind: 'identity', variant: 'cube-sum', a, b, form: 'factored' },
    '(a+b)³',
  );
}

function genCubeSumFromExpanded(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const value = cubeSumValue(a, b);

  return makeProblem(
    id,
    [textPart(`${formatExpandedCubeSum(a, b)} = ?`)],
    formatNumberAnswer(value),
    { kind: 'integer', value },
  );
}

function genCubeDiffDirect(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const value = cubeDiffValue(a, b);

  return makeProblem(
    id,
    [textPart(`(${a} − ${b})³ = ?`)],
    formatNumberAnswer(value),
    { kind: 'integer', value },
  );
}

function genCubeDiffExpand(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const answer = formatExpandedCubeDiff(a, b);

  return makeProblem(
    id,
    [textPart(`(${a} − ${b})³ = ?`)],
    answer,
    { kind: 'identity', variant: 'cube-diff', a, b, form: 'expanded' },
    'a³ − 3a²b + 3ab² − b³',
  );
}

function genCubeDiffFactor(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const answer = formatFactoredCubeDiff(a, b);

  return makeProblem(
    id,
    [textPart(`${formatExpandedCubeDiff(a, b)} = ?`)],
    answer,
    { kind: 'identity', variant: 'cube-diff', a, b, form: 'factored' },
    '(a−b)³',
  );
}

function genCubeDiffFromExpanded(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const value = cubeDiffValue(a, b);

  return makeProblem(
    id,
    [textPart(`${formatExpandedCubeDiff(a, b)} = ?`)],
    formatNumberAnswer(value),
    { kind: 'integer', value },
  );
}

function genSumCubesDirect(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const value = sumCubesValue(a, b);

  return makeProblem(
    id,
    [textPart(`${formatFactoredSumCubesDisplay(a, b)} = ?`)],
    formatNumberAnswer(value),
    { kind: 'integer', value },
  );
}

function genSumCubesFactor(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const answer = formatFactoredSumCubes(a, b);

  return makeProblem(
    id,
    [textPart(`${formatExpandedSumCubes(a, b)} = ?`)],
    answer,
    { kind: 'identity', variant: 'sum-cubes', a, b, form: 'factored' },
    '(a+b)(a²−ab+b²)',
  );
}

function genSumCubesFromExpanded(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const value = sumCubesValue(a, b);

  return makeProblem(
    id,
    [textPart(`${formatExpandedSumCubes(a, b)} = ?`)],
    formatNumberAnswer(value),
    { kind: 'integer', value },
  );
}

function genDiffCubesDirect(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const value = diffCubesValue(a, b);

  return makeProblem(
    id,
    [textPart(`${formatFactoredDiffCubesDisplay(a, b)} = ?`)],
    formatNumberAnswer(value),
    { kind: 'integer', value },
  );
}

function genDiffCubesFactor(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const answer = formatFactoredDiffCubes(a, b);

  return makeProblem(
    id,
    [textPart(`${formatExpandedDiffCubes(a, b)} = ?`)],
    answer,
    { kind: 'identity', variant: 'diff-cubes', a, b, form: 'factored' },
    '(a−b)(a²+ab+b²)',
  );
}

function genDiffCubesFromExpanded(settings: IdentitySettings, id: string): Problem | null {
  const { a, b } = pickPair(settings);
  const value = diffCubesValue(a, b);

  return makeProblem(
    id,
    [textPart(`${formatExpandedDiffCubes(a, b)} = ?`)],
    formatNumberAnswer(value),
    { kind: 'integer', value },
  );
}

const ALL_MODES: IdentityMode[] = [
  'square-sum-direct',
  'square-sum-expand',
  'square-sum-factor',
  'square-sum-from-expanded',
  'square-diff-direct',
  'square-diff-expand',
  'square-diff-factor',
  'square-diff-from-expanded',
  'diff-squares-direct',
  'diff-squares-factor',
  'diff-squares-from-expanded',
  'cube-sum-direct',
  'cube-sum-expand',
  'cube-sum-factor',
  'cube-sum-from-expanded',
  'cube-diff-direct',
  'cube-diff-expand',
  'cube-diff-factor',
  'cube-diff-from-expanded',
  'sum-cubes-direct',
  'sum-cubes-factor',
  'sum-cubes-from-expanded',
  'diff-cubes-direct',
  'diff-cubes-factor',
  'diff-cubes-from-expanded',
];

function generateByMode(settings: IdentitySettings, mode: IdentityMode, id: string): Problem | null {
  switch (mode) {
    case 'square-sum-direct':
      return genSquareSumDirect(settings, id);
    case 'square-sum-expand':
      return genSquareSumExpand(settings, id);
    case 'square-sum-factor':
      return genSquareSumFactor(settings, id);
    case 'square-sum-from-expanded':
      return genSquareSumFromExpanded(settings, id);
    case 'square-diff-direct':
      return genSquareDiffDirect(settings, id);
    case 'square-diff-expand':
      return genSquareDiffExpand(settings, id);
    case 'square-diff-factor':
      return genSquareDiffFactor(settings, id);
    case 'square-diff-from-expanded':
      return genSquareDiffFromExpanded(settings, id);
    case 'diff-squares-direct':
      return genDiffSquaresDirect(settings, id);
    case 'diff-squares-factor':
      return genDiffSquaresFactor(settings, id);
    case 'diff-squares-from-expanded':
      return genDiffSquaresFromExpanded(settings, id);
    case 'cube-sum-direct':
      return genCubeSumDirect(settings, id);
    case 'cube-sum-expand':
      return genCubeSumExpand(settings, id);
    case 'cube-sum-factor':
      return genCubeSumFactor(settings, id);
    case 'cube-sum-from-expanded':
      return genCubeSumFromExpanded(settings, id);
    case 'cube-diff-direct':
      return genCubeDiffDirect(settings, id);
    case 'cube-diff-expand':
      return genCubeDiffExpand(settings, id);
    case 'cube-diff-factor':
      return genCubeDiffFactor(settings, id);
    case 'cube-diff-from-expanded':
      return genCubeDiffFromExpanded(settings, id);
    case 'sum-cubes-direct':
      return genSumCubesDirect(settings, id);
    case 'sum-cubes-factor':
      return genSumCubesFactor(settings, id);
    case 'sum-cubes-from-expanded':
      return genSumCubesFromExpanded(settings, id);
    case 'diff-cubes-direct':
      return genDiffCubesDirect(settings, id);
    case 'diff-cubes-factor':
      return genDiffCubesFactor(settings, id);
    case 'diff-cubes-from-expanded':
      return genDiffCubesFromExpanded(settings, id);
    case 'formulas-all': {
      const picked = ALL_MODES[randomInt(0, ALL_MODES.length - 1)];
      return generateByMode(settings, picked, id);
    }
    default:
      return null;
  }
}

function generateOne(settings: IdentitySettings): Problem | null {
  const id = `identity-${++problemCounter}-${Date.now()}-${randomInt(0, 99999)}`;
  return generateByMode(settings, settings.mode, id);
}

export function generateIdentityProblems(settings: IdentitySettings): Problem[] {
  return fillUniqueProblems(settings.problemsCount, () => {
    const problem = generateOne(settings);
    if (!problem || !isAnswerAllowed(problem, settings)) return null;
    return problem;
  });
}
