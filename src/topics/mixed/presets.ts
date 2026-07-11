import type { ArithmeticSettings } from '../arithmetic/types';
import { DEFAULT_ARITHMETIC_SETTINGS } from '../arithmetic/types';
import type { FractionSettings } from '../fractions/types';
import { DEFAULT_FRACTION_SETTINGS } from '../fractions/types';
import type { PercentSettings } from '../percentages/types';
import { DEFAULT_PERCENT_SETTINGS } from '../percentages/types';
import type { PowerSettings } from '../powers/types';
import { DEFAULT_POWER_SETTINGS } from '../powers/types';
import type { RootSettings } from '../roots/types';
import { DEFAULT_ROOT_SETTINGS } from '../roots/types';
import type { IdentitySettings } from '../identities/types';
import { DEFAULT_IDENTITY_SETTINGS } from '../identities/types';
import type { LinearEquationSettings } from '../linear-equations/types';
import { DEFAULT_LINEAR_EQUATION_SETTINGS } from '../linear-equations/types';
import type { QuadraticEquationSettings } from '../quadratic-equations/types';
import { DEFAULT_QUADRATIC_EQUATION_SETTINGS } from '../quadratic-equations/types';
import type { MixedDifficulty, MixableTopicId } from './types';

type TopicSettingsMap = {
  arithmetic: ArithmeticSettings;
  fractions: FractionSettings;
  percentages: PercentSettings;
  powers: PowerSettings;
  roots: RootSettings;
  identities: IdentitySettings;
  'linear-equations': LinearEquationSettings;
  'quadratic-equations': QuadraticEquationSettings;
};

function withCount<T extends { problemsCount: number }>(settings: T, count: number): T {
  return { ...settings, problemsCount: count };
}

const EASY_PRESETS: { [K in MixableTopicId]: TopicSettingsMap[K] } = {
  arithmetic: {
    ...DEFAULT_ARITHMETIC_SETTINGS,
    minValue: 1,
    maxValue: 10,
    operationsCount: 1,
    allowedOperations: ['+', '-', '*'],
    useParentheses: false,
  },
  fractions: {
    ...DEFAULT_FRACTION_SETTINGS,
    mode: 'ordinary-add',
    maxDenominator: 8,
    maxNumerator: 8,
    maxWhole: 3,
    operationsCount: 1,
  },
  percentages: {
    ...DEFAULT_PERCENT_SETTINGS,
    mode: 'percent-of',
    minPercent: 5,
    maxPercent: 25,
    minNumber: 10,
    maxNumber: 100,
    operationsCount: 1,
  },
  powers: {
    ...DEFAULT_POWER_SETTINGS,
    mode: 'compute',
    minBase: 2,
    maxBase: 6,
    minExponent: 2,
    maxExponent: 3,
  },
  roots: {
    ...DEFAULT_ROOT_SETTINGS,
    mode: 'sqrt',
    minValue: 2,
    maxValue: 10,
    rootKind: 'sqrt',
  },
  identities: {
    ...DEFAULT_IDENTITY_SETTINGS,
    mode: 'square-sum-direct',
    minValue: 2,
    maxValue: 8,
  },
  'linear-equations': {
    ...DEFAULT_LINEAR_EQUATION_SETTINGS,
    mode: 'standard',
    minCoeff: 2,
    maxCoeff: 5,
    minConstant: 1,
    maxConstant: 20,
  },
  'quadratic-equations': {
    ...DEFAULT_QUADRATIC_EQUATION_SETTINGS,
    mode: 'monic',
    minRoot: -5,
    maxRoot: 5,
    allowNegativeRoots: true,
  },
};

const STANDARD_PRESETS: { [K in MixableTopicId]: TopicSettingsMap[K] } = {
  arithmetic: {
    ...DEFAULT_ARITHMETIC_SETTINGS,
    operationsCount: 2,
    allowedOperations: ['+', '-', '*', '/'],
  },
  fractions: {
    ...DEFAULT_FRACTION_SETTINGS,
    mode: 'ordinary-all',
    operationsCount: 2,
  },
  percentages: {
    ...DEFAULT_PERCENT_SETTINGS,
    mode: 'percent-all',
    operationsCount: 2,
  },
  powers: {
    ...DEFAULT_POWER_SETTINGS,
    mode: 'power-all',
  },
  roots: {
    ...DEFAULT_ROOT_SETTINGS,
    mode: 'roots-all',
  },
  identities: {
    ...DEFAULT_IDENTITY_SETTINGS,
    mode: 'formulas-all',
  },
  'linear-equations': {
    ...DEFAULT_LINEAR_EQUATION_SETTINGS,
    mode: 'equations-all',
  },
  'quadratic-equations': {
    ...DEFAULT_QUADRATIC_EQUATION_SETTINGS,
    mode: 'equations-all',
  },
};

export function getTopicSettingsForMixed<K extends MixableTopicId>(
  topicId: K,
  difficulty: MixedDifficulty,
  count: number,
): TopicSettingsMap[K] {
  const preset = difficulty === 'easy' ? EASY_PRESETS[topicId] : STANDARD_PRESETS[topicId];
  return withCount(preset, count) as TopicSettingsMap[K];
}
