import type { Problem, ExprPart } from '../../types';
import type { PowerSettings, PowerMode } from './types';
import { randomInt, intPow, compareValues } from './math';
import { formatNumberAnswer, formatComparisonAnswer } from './format';
import { fillUniqueProblems } from '../../utils/problemSignature';

let problemCounter = 0;

function textPart(text: string): ExprPart {
  return { kind: 'text', text };
}

function powerPart(base: number, exponent: number): ExprPart {
  return { kind: 'power', base, exponent };
}

function powerUnknownExponent(base: number): ExprPart {
  return { kind: 'power', base, unknown: 'exponent' };
}

function powerUnknownBase(exponent: number): ExprPart {
  return { kind: 'power', exponent, unknown: 'base' };
}

function groupPowerPart(
  base: number,
  innerExponent: number,
  outerExponent: number,
): ExprPart {
  return { kind: 'group-power', base, innerExponent, outerExponent };
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

function pickBase(settings: PowerSettings): number {
  if (!settings.allowNegativeBase) {
    return randomInt(Math.max(2, settings.minBase), settings.maxBase);
  }

  const abs = randomInt(Math.max(2, settings.minBase), settings.maxBase);
  return Math.random() < 0.3 ? -abs : abs;
}

function pickExponent(settings: PowerSettings): number {
  return randomInt(settings.minExponent, settings.maxExponent);
}

function isResultAllowed(value: number, settings: PowerSettings): boolean {
  if (!Number.isInteger(value)) return false;
  if (!settings.allowNegativeAnswer && value < 0) return false;
  if (Math.abs(value) > settings.maxResult) return false;
  return true;
}

function isAnswerAllowed(problem: Problem, settings: PowerSettings): boolean {
  if (settings.allowNegativeAnswer || !problem.check) return true;

  switch (problem.check.kind) {
    case 'compare':
      return true;
    case 'integer':
      return problem.check.value >= 0;
    default:
      return true;
  }
}

function genCompute(settings: PowerSettings, id: string): Problem | null {
  for (let i = 0; i < 200; i++) {
    const base = pickBase(settings);
    const exponent = pickExponent(settings);
    const result = intPow(base, exponent);
    if (!isResultAllowed(result, settings)) continue;

    return makeProblem(
      id,
      [powerPart(base, exponent), textPart(' = ?')],
      formatNumberAnswer(result),
      { kind: 'integer', value: result },
    );
  }
  return null;
}

function genFindExponent(settings: PowerSettings, id: string): Problem | null {
  for (let i = 0; i < 200; i++) {
    const base = pickBase(settings);
    const exponent = pickExponent(settings);
    const result = intPow(base, exponent);
    if (!isResultAllowed(result, settings)) continue;

    return makeProblem(
      id,
      [powerUnknownExponent(base), textPart(` = ${result}`)],
      formatNumberAnswer(exponent),
      { kind: 'integer', value: exponent },
      'показатель',
    );
  }
  return null;
}

function genFindBase(settings: PowerSettings, id: string): Problem | null {
  for (let i = 0; i < 200; i++) {
    const base = pickBase(settings);
    const exponent = pickExponent(settings);
    const result = intPow(base, exponent);
    if (!isResultAllowed(result, settings)) continue;
    if (!settings.allowNegativeAnswer && base < 0) continue;

    return makeProblem(
      id,
      [powerUnknownBase(exponent), textPart(` = ${result}`)],
      formatNumberAnswer(base),
      { kind: 'integer', value: base },
      'основание',
    );
  }
  return null;
}

function genCompare(settings: PowerSettings, id: string): Problem | null {
  for (let i = 0; i < 200; i++) {
    const base1 = pickBase(settings);
    const base2 = pickBase(settings);
    const exp1 = pickExponent(settings);
    const exp2 = pickExponent(settings);
    const v1 = intPow(base1, exp1);
    const v2 = intPow(base2, exp2);
    if (!Number.isInteger(v1) || !Number.isInteger(v2)) continue;
    if (Math.abs(v1) > settings.maxResult || Math.abs(v2) > settings.maxResult) continue;

    const cmp = compareValues(v1, v2);

    return makeProblem(
      id,
      [powerPart(base1, exp1), textPart('  ?  '), powerPart(base2, exp2)],
      formatComparisonAnswer(cmp),
      { kind: 'compare', value: cmp },
      '<, > или =',
    );
  }
  return null;
}

function genMultiplyPowers(settings: PowerSettings, id: string): Problem | null {
  for (let i = 0; i < 200; i++) {
    const base = pickBase(settings);
    const exp1 = pickExponent(settings);
    const exp2 = pickExponent(settings);
    const answer = exp1 + exp2;
    if (!settings.allowNegativeAnswer && answer < 0) continue;

    return makeProblem(
      id,
      [
        powerPart(base, exp1),
        textPart(' × '),
        powerPart(base, exp2),
        textPart(' = '),
        powerUnknownExponent(base),
      ],
      formatNumberAnswer(answer),
      { kind: 'integer', value: answer },
      'показатель',
    );
  }
  return null;
}

function genDividePowers(settings: PowerSettings, id: string): Problem | null {
  for (let i = 0; i < 200; i++) {
    const base = pickBase(settings);
    let exp1 = pickExponent(settings);
    let exp2 = pickExponent(settings);
    if (exp1 < exp2) [exp1, exp2] = [exp2, exp1];
    if (exp1 === exp2 && settings.minExponent < settings.maxExponent) {
      exp1 = Math.min(settings.maxExponent, exp2 + 1);
    }
    const answer = exp1 - exp2;
    if (!settings.allowNegativeAnswer && answer < 0) continue;

    return makeProblem(
      id,
      [
        powerPart(base, exp1),
        textPart(' ÷ '),
        powerPart(base, exp2),
        textPart(' = '),
        powerUnknownExponent(base),
      ],
      formatNumberAnswer(answer),
      { kind: 'integer', value: answer },
      'показатель',
    );
  }
  return null;
}

function genPowerOfPower(settings: PowerSettings, id: string): Problem | null {
  for (let i = 0; i < 200; i++) {
    const base = pickBase(settings);
    const innerExp = pickExponent(settings);
    const outerExp = pickExponent(settings);
    const answer = innerExp * outerExp;
    const result = intPow(base, answer);
    if (!isResultAllowed(result, settings)) continue;

    return makeProblem(
      id,
      [
        groupPowerPart(base, innerExp, outerExp),
        textPart(' = '),
        powerUnknownExponent(base),
      ],
      formatNumberAnswer(answer),
      { kind: 'integer', value: answer },
      'показатель',
    );
  }
  return null;
}

const ALL_MODES: PowerMode[] = [
  'compute',
  'find-exponent',
  'find-base',
  'compare',
  'multiply-powers',
  'divide-powers',
  'power-of-power',
];

function generateByMode(settings: PowerSettings, mode: PowerMode, id: string): Problem | null {
  switch (mode) {
    case 'compute':
      return genCompute(settings, id);
    case 'find-exponent':
      return genFindExponent(settings, id);
    case 'find-base':
      return genFindBase(settings, id);
    case 'compare':
      return genCompare(settings, id);
    case 'multiply-powers':
      return genMultiplyPowers(settings, id);
    case 'divide-powers':
      return genDividePowers(settings, id);
    case 'power-of-power':
      return genPowerOfPower(settings, id);
    case 'power-all': {
      const picked = ALL_MODES[randomInt(0, ALL_MODES.length - 1)];
      return generateByMode(settings, picked, id);
    }
    default:
      return null;
  }
}

function generateOne(settings: PowerSettings): Problem | null {
  const id = `power-${++problemCounter}-${Date.now()}-${randomInt(0, 99999)}`;
  return generateByMode(settings, settings.mode, id);
}

export function generatePowerProblems(settings: PowerSettings): Problem[] {
  return fillUniqueProblems(settings.problemsCount, () => {
    const problem = generateOne(settings);
    if (!problem || !isAnswerAllowed(problem, settings)) return null;
    return problem;
  });
}
