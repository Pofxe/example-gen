import type { Problem, ExprPart } from '../../types';
import type { QuadraticEquationSettings, QuadraticEquationMode } from './types';
import { randomInt, pickNonZeroInt, coeffsFromRoots } from './math';
import {
  formatRootsAnswer,
  formatQuadraticEquation,
  formatPureSquareEquation,
  formatNoLinearEquation,
  formatNoConstantEquation,
} from './format';
import { fillUniqueProblems } from '../../utils/problemSignature';

let problemCounter = 0;

function textPart(text: string): ExprPart {
  return { kind: 'text', text };
}

function makeProblem(id: string, expression: string, roots: [number, number]): Problem {
  const answer = formatRootsAnswer(roots);
  const isDouble = roots[0] === roots[1];

  return {
    id,
    parts: [textPart(`${expression}. x = ?`)],
    answer,
    answerDisplay: answer,
    check: { kind: 'quadratic-roots', roots },
    inputPlaceholder: isDouble ? 'корень' : 'x1, x2',
  };
}

function pickRoot(settings: QuadraticEquationSettings, excludeZero = false): number {
  let min = settings.allowNegativeRoots ? settings.minRoot : Math.max(0, settings.minRoot);
  let max = settings.maxRoot;

  if (!settings.allowNegativeRoots) {
    min = Math.max(1, min);
  }

  for (let i = 0; i < 200; i++) {
    const n = randomInt(min, max);
    if (excludeZero && n === 0) continue;
    return n;
  }

  return excludeZero ? 1 : 0;
}

function pickLeadingCoeff(settings: QuadraticEquationSettings): number {
  const min = settings.allowNegativeCoeffs ? -settings.maxCoeff : Math.max(1, settings.minCoeff);
  const max = settings.maxCoeff;
  return pickNonZeroInt(min, max, settings.allowNegativeCoeffs);
}

function rootsAllowed(roots: [number, number], settings: QuadraticEquationSettings): boolean {
  if (!settings.allowNegativeRoots && (roots[0] < 0 || roots[1] < 0)) return false;
  return true;
}

function genStandard(settings: QuadraticEquationSettings, id: string, forceA?: number): Problem | null {
  for (let i = 0; i < 200; i++) {
    const a = forceA ?? pickLeadingCoeff(settings);
    const r1 = pickRoot(settings);
    const r2 = pickRoot(settings);
    const { b, c, roots } = coeffsFromRoots(a, r1, r2);
    if (!rootsAllowed(roots, settings)) continue;

    return makeProblem(id, formatQuadraticEquation(a, b, c), roots);
  }
  return null;
}

function genMonic(settings: QuadraticEquationSettings, id: string): Problem | null {
  return genStandard(settings, id, 1);
}

function genNoLinear(settings: QuadraticEquationSettings, id: string): Problem | null {
  for (let i = 0; i < 200; i++) {
    const k = pickRoot(settings, true);
    const r1 = k;
    const r2 = -k;
    const c = -k * k;
    const roots: [number, number] = sortRootsPair(r1, r2);
    if (!rootsAllowed(roots, settings)) continue;

    return makeProblem(id, formatNoLinearEquation(c), roots);
  }
  return null;
}

function genNoConstant(settings: QuadraticEquationSettings, id: string): Problem | null {
  for (let i = 0; i < 200; i++) {
    const a = pickLeadingCoeff(settings);
    const r1 = 0;
    const r2 = pickRoot(settings, true);
    const b = -a * r2;
    const roots: [number, number] = sortRootsPair(r1, r2);
    if (!rootsAllowed(roots, settings)) continue;

    return makeProblem(id, formatNoConstantEquation(a, b), roots);
  }
  return null;
}

function genPureSquare(settings: QuadraticEquationSettings, id: string): Problem | null {
  for (let i = 0; i < 200; i++) {
    const a = pickLeadingCoeff(settings);
    const k = pickRoot(settings, true);
    const c = a * k * k;
    const roots: [number, number] = sortRootsPair(-k, k);
    if (!rootsAllowed(roots, settings)) continue;

    return makeProblem(id, formatPureSquareEquation(a, c), roots);
  }
  return null;
}

function sortRootsPair(r1: number, r2: number): [number, number] {
  return r1 <= r2 ? [r1, r2] : [r2, r1];
}

const ALL_MODES: QuadraticEquationMode[] = [
  'standard',
  'monic',
  'no-linear',
  'no-constant',
  'pure-square',
];

function generateByMode(
  settings: QuadraticEquationSettings,
  mode: QuadraticEquationMode,
  id: string,
): Problem | null {
  switch (mode) {
    case 'standard':
      return genStandard(settings, id);
    case 'monic':
      return genMonic(settings, id);
    case 'no-linear':
      return genNoLinear(settings, id);
    case 'no-constant':
      return genNoConstant(settings, id);
    case 'pure-square':
      return genPureSquare(settings, id);
    case 'equations-all': {
      const picked = ALL_MODES[randomInt(0, ALL_MODES.length - 1)];
      return generateByMode(settings, picked, id);
    }
    default:
      return null;
  }
}

function generateOne(settings: QuadraticEquationSettings): Problem | null {
  const id = `quadratic-${++problemCounter}-${Date.now()}-${randomInt(0, 99999)}`;
  return generateByMode(settings, settings.mode, id);
}

export function generateQuadraticEquationProblems(
  settings: QuadraticEquationSettings,
): Problem[] {
  return fillUniqueProblems(settings.problemsCount, () => generateOne(settings));
}
