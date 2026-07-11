import type { ArithmeticOperation, ArithmeticSettings } from '../topics/arithmetic/types';
import { FRACTION_MODES, fractionModeSupportsOperationsCount, type FractionSettings } from '../topics/fractions/types';
import { PERCENT_MODES, percentModeSupportsOperationsCount, type PercentSettings } from '../topics/percentages/types';
import { POWER_MODES, type PowerSettings } from '../topics/powers/types';
import { ROOT_MODES, type RootSettings } from '../topics/roots/types';
import { IDENTITY_MODES, type IdentitySettings } from '../topics/identities/types';
import { LINEAR_EQUATION_MODES, type LinearEquationSettings } from '../topics/linear-equations/types';
import { QUADRATIC_EQUATION_MODES, type QuadraticEquationSettings } from '../topics/quadratic-equations/types';
import {
  MIXABLE_TOPICS,
  type MixedSettings,
  type MixableTopicId,
} from '../topics/mixed/types';
import { pickRandom, pickRandomSubset, randomBool, randomInt, randomOrderedRange } from './random';

const ARITHMETIC_OPERATIONS: ArithmeticOperation[] = ['+', '-', '*', '/'];

export function randomArithmeticSettings(): ArithmeticSettings {
  const allowNegatives = randomBool(0.35);
  const range = allowNegatives
    ? randomOrderedRange(-25, 40)
    : randomOrderedRange(1, 40);
  const operationsCount = randomInt(1, 6);

  return {
    operationsCount,
    allowNegatives,
    allowNegativeAnswer: allowNegatives && randomBool(0.45),
    minValue: range.min,
    maxValue: Math.max(range.max, range.min + 1),
    allowedOperations: pickRandomSubset(ARITHMETIC_OPERATIONS, 1),
    problemsCount: randomInt(5, 20),
    useParentheses: operationsCount >= 2 && randomBool(0.4),
  };
}

export function randomFractionSettings(): FractionSettings {
  const mode = pickRandom(FRACTION_MODES).id;
  const allowNegative = randomBool(0.25);

  return {
    mode,
    operationsCount: fractionModeSupportsOperationsCount(mode) ? randomInt(1, 4) : 1,
    maxDenominator: randomInt(4, 20),
    maxNumerator: randomInt(4, 20),
    maxWhole: randomInt(2, 8),
    decimalPlaces: randomInt(1, 3),
    problemsCount: randomInt(5, 20),
    allowNegative,
    allowNegativeAnswer: allowNegative && randomBool(0.4),
  };
}

export function randomPercentSettings(): PercentSettings {
  const mode = pickRandom(PERCENT_MODES).id;
  const percentRange = randomOrderedRange(5, 80);
  const numberRange = randomOrderedRange(10, 250);
  const allowNegative = randomBool(0.2);

  return {
    mode,
    operationsCount: percentModeSupportsOperationsCount(mode) ? randomInt(1, 3) : 1,
    minPercent: percentRange.min,
    maxPercent: Math.max(percentRange.max, percentRange.min + 5),
    minNumber: numberRange.min,
    maxNumber: Math.max(numberRange.max, numberRange.min + 10),
    problemsCount: randomInt(5, 20),
    decimalPlaces: randomInt(0, 2),
    allowNegative,
    allowNegativeAnswer: allowNegative && randomBool(0.35),
    allowDecimalPercent: randomBool(0.35),
  };
}

export function randomPowerSettings(): PowerSettings {
  const baseRange = randomOrderedRange(2, 12);
  const expRange = randomOrderedRange(2, 6);
  const allowNegativeBase = randomBool(0.2);

  return {
    mode: pickRandom(POWER_MODES).id,
    minBase: baseRange.min,
    maxBase: Math.max(baseRange.max, baseRange.min + 1),
    minExponent: expRange.min,
    maxExponent: Math.max(expRange.max, expRange.min + 1),
    problemsCount: randomInt(5, 20),
    allowNegativeBase,
    allowNegativeAnswer: randomBool(0.25),
    maxResult: randomInt(100, 5000),
  };
}

export function randomRootSettings(): RootSettings {
  const range = randomOrderedRange(2, 15);

  return {
    mode: pickRandom(ROOT_MODES).id,
    minValue: range.min,
    maxValue: Math.max(range.max, range.min + 1),
    problemsCount: randomInt(5, 20),
    rootKind: pickRandom(['sqrt', 'cbrt', 'both'] as const),
    allowNegativeAnswer: randomBool(0.2),
  };
}

export function randomIdentitySettings(): IdentitySettings {
  const range = randomOrderedRange(2, 15);

  return {
    mode: pickRandom(IDENTITY_MODES).id,
    minValue: range.min,
    maxValue: Math.max(range.max, range.min + 1),
    problemsCount: randomInt(5, 20),
    allowNegativeAnswer: randomBool(0.25),
  };
}

export function randomLinearEquationSettings(): LinearEquationSettings {
  const coeffRange = randomOrderedRange(2, 12);
  const constRange = randomOrderedRange(1, 40);
  const allowNegativeCoeffs = randomBool(0.3);

  return {
    mode: pickRandom(LINEAR_EQUATION_MODES).id,
    minCoeff: coeffRange.min,
    maxCoeff: Math.max(coeffRange.max, coeffRange.min + 1),
    minConstant: constRange.min,
    maxConstant: Math.max(constRange.max, constRange.min + 1),
    problemsCount: randomInt(5, 20),
    allowNegativeCoeffs,
    allowNegativeAnswer: allowNegativeCoeffs && randomBool(0.4),
  };
}

export function randomQuadraticEquationSettings(): QuadraticEquationSettings {
  const coeffRange = randomOrderedRange(1, 8);
  const rootRange = randomOrderedRange(-12, 12);
  const allowNegativeCoeffs = randomBool(0.35);

  return {
    mode: pickRandom(QUADRATIC_EQUATION_MODES).id,
    minCoeff: coeffRange.min,
    maxCoeff: Math.max(coeffRange.max, coeffRange.min + 1),
    minRoot: rootRange.min,
    maxRoot: Math.max(rootRange.max, rootRange.min + 1),
    problemsCount: randomInt(5, 20),
    allowNegativeCoeffs,
    allowNegativeRoots: randomBool(0.55),
  };
}

export function randomMixedSettings(): MixedSettings {
  return {
    selectedTopics: pickRandomSubset(
      MIXABLE_TOPICS.map((topic) => topic.id),
      2,
    ) as MixableTopicId[],
    problemsCount: randomInt(8, 25),
    distribution: pickRandom(['balanced', 'random'] as const),
    difficulty: pickRandom(['easy', 'standard'] as const),
    shuffleOrder: randomBool(0.75),
    showTopicLabel: randomBool(0.85),
  };
}
