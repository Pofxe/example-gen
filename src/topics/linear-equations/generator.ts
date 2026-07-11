import type { Problem, ExprPart } from '../../types';
import type { LinearEquationSettings, LinearEquationMode } from './types';
import { randomInt, pickNonZeroInt } from './math';
import {
  formatNumberAnswer,
  formatStandardEquation,
  formatSimpleEquation,
  formatUnitEquation,
  formatBothSidesEquation,
} from './format';
import { fillUniqueProblems } from '../../utils/problemSignature';

let problemCounter = 0;

function textPart(text: string): ExprPart {
  return { kind: 'text', text };
}

function makeProblem(
  id: string,
  expression: string,
  x: number,
): Problem {
  return {
    id,
    parts: [textPart(`${expression}. x = ?`)],
    answer: formatNumberAnswer(x),
    answerDisplay: formatNumberAnswer(x),
    check: { kind: 'integer', value: x },
    inputPlaceholder: 'x',
  };
}

function pickX(settings: LinearEquationSettings): number {
  const min = settings.allowNegativeAnswer ? -settings.maxConstant : 1;
  const max = settings.maxConstant;
  return randomInt(min, max);
}

function pickCoeff(settings: LinearEquationSettings): number {
  const min = settings.allowNegativeCoeffs ? -settings.maxCoeff : Math.max(1, settings.minCoeff);
  const max = settings.maxCoeff;
  return pickNonZeroInt(min, max, settings.allowNegativeCoeffs);
}

function pickConstant(settings: LinearEquationSettings): number {
  const min = settings.allowNegativeCoeffs ? -settings.maxConstant : settings.minConstant;
  const max = settings.maxConstant;
  return randomInt(min, max);
}

function isAnswerAllowed(x: number, settings: LinearEquationSettings): boolean {
  if (!Number.isInteger(x)) return false;
  if (!settings.allowNegativeAnswer && x < 0) return false;
  return true;
}

function genStandard(settings: LinearEquationSettings, id: string): Problem | null {
  for (let i = 0; i < 200; i++) {
    const x = pickX(settings);
    const a = pickCoeff(settings);
    const b = pickConstant(settings);
    const c = a * x + b;
    if (!Number.isInteger(c)) continue;
    if (!isAnswerAllowed(x, settings)) continue;

    return makeProblem(id, formatStandardEquation(a, b, c), x);
  }
  return null;
}

function genNoConstantLeft(settings: LinearEquationSettings, id: string): Problem | null {
  for (let i = 0; i < 200; i++) {
    const x = pickX(settings);
    const a = pickCoeff(settings);
    const c = a * x;
    if (!isAnswerAllowed(x, settings)) continue;

    return makeProblem(id, formatSimpleEquation(a, c), x);
  }
  return null;
}

function genUnitCoeff(settings: LinearEquationSettings, id: string): Problem | null {
  for (let i = 0; i < 200; i++) {
    const x = pickX(settings);
    const b = pickConstant(settings);
    const c = x + b;
    if (!isAnswerAllowed(x, settings)) continue;

    return makeProblem(id, formatUnitEquation(b, c), x);
  }
  return null;
}

function genBothSides(settings: LinearEquationSettings, id: string): Problem | null {
  for (let i = 0; i < 200; i++) {
    const x = pickX(settings);
    let a = pickCoeff(settings);
    let c = pickCoeff(settings);
    if (a === c) c = a + (Math.random() < 0.5 ? 1 : -1);
    if (a === c) continue;

    const b = pickConstant(settings);
    const d = (a - c) * x + b;
    if (!Number.isInteger(d)) continue;
    if (!isAnswerAllowed(x, settings)) continue;

    return makeProblem(id, formatBothSidesEquation(a, b, c, d), x);
  }
  return null;
}

const ALL_MODES: LinearEquationMode[] = [
  'standard',
  'no-constant-left',
  'unit-coeff',
  'both-sides',
];

function generateByMode(
  settings: LinearEquationSettings,
  mode: LinearEquationMode,
  id: string,
): Problem | null {
  switch (mode) {
    case 'standard':
      return genStandard(settings, id);
    case 'no-constant-left':
      return genNoConstantLeft(settings, id);
    case 'unit-coeff':
      return genUnitCoeff(settings, id);
    case 'both-sides':
      return genBothSides(settings, id);
    case 'equations-all': {
      const picked = ALL_MODES[randomInt(0, ALL_MODES.length - 1)];
      return generateByMode(settings, picked, id);
    }
    default:
      return null;
  }
}

function generateOne(settings: LinearEquationSettings): Problem | null {
  const id = `linear-${++problemCounter}-${Date.now()}-${randomInt(0, 99999)}`;
  const problem = generateByMode(settings, settings.mode, id);
  if (!problem?.check || problem.check.kind !== 'integer') return problem;
  if (!isAnswerAllowed(problem.check.value, settings)) return null;
  return problem;
}

export function generateLinearEquationProblems(settings: LinearEquationSettings): Problem[] {
  return fillUniqueProblems(settings.problemsCount, () => generateOne(settings));
}
