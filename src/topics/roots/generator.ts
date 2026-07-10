import type { Problem, ExprPart } from '../../types';
import type { RootSettings, RootMode } from './types';
import { randomInt, intPow, compareValues } from './math';
import { formatNumberAnswer, formatComparisonAnswer } from './format';
import { fillUniqueProblems } from '../../utils/problemSignature';

let problemCounter = 0;

function textPart(text: string): ExprPart {
  return { kind: 'text', text };
}

function rootPart(index: 2 | 3, radicand: number): ExprPart {
  return { kind: 'root', index, radicand };
}

function rootUnknownRadicand(index: 2 | 3): ExprPart {
  return { kind: 'root', index, unknown: 'radicand' };
}

function nestedRootPart(index: 2 | 3, inner: { index: 2 | 3; radicand: number }): ExprPart {
  return { kind: 'root', index, inner };
}

function rootOfPowerPart(index: 2 | 3, base: number, exponent: number): ExprPart {
  return { kind: 'root', index, power: { base, exponent } };
}

function groupRootPowerPart(index: 2 | 3, radicand: number, exponent: number): ExprPart {
  return { kind: 'group-root-power', index, radicand, exponent };
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

function pickIndex(settings: RootSettings, forced?: 2 | 3): 2 | 3 {
  if (forced) return forced;
  if (settings.rootKind === 'sqrt') return 2;
  if (settings.rootKind === 'cbrt') return 3;
  return Math.random() < 0.5 ? 2 : 3;
}

function pickRootValue(settings: RootSettings): number {
  return randomInt(settings.minValue, settings.maxValue);
}

function perfectPair(value: number, index: 2 | 3): { root: number; radicand: number } {
  return { root: value, radicand: intPow(value, index) };
}

function isAnswerAllowed(problem: Problem, settings: RootSettings): boolean {
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

function genCompute(settings: RootSettings, id: string, index: 2 | 3): Problem | null {
  const value = pickRootValue(settings);
  const { radicand } = perfectPair(value, index);

  return makeProblem(
    id,
    [rootPart(index, radicand), textPart(' = ?')],
    formatNumberAnswer(value),
    { kind: 'integer', value },
  );
}

function genFindRadicand(settings: RootSettings, id: string, index?: 2 | 3): Problem | null {
  const rootIndex = pickIndex(settings, index);
  const value = pickRootValue(settings);
  const { radicand } = perfectPair(value, rootIndex);

  return makeProblem(
    id,
    [rootUnknownRadicand(rootIndex), textPart(` = ${value}`)],
    formatNumberAnswer(radicand),
    { kind: 'integer', value: radicand },
    'подкоренное выражение',
  );
}

function genCompare(settings: RootSettings, id: string): Problem | null {
  for (let i = 0; i < 200; i++) {
    const index1 = pickIndex(settings);
    const index2 = pickIndex(settings);
    const v1 = pickRootValue(settings);
    const v2 = pickRootValue(settings);
    const r1 = perfectPair(v1, index1).radicand;
    const r2 = perfectPair(v2, index2).radicand;
    const cmp = compareValues(v1, v2);

    return makeProblem(
      id,
      [rootPart(index1, r1), textPart('  ?  '), rootPart(index2, r2)],
      formatComparisonAnswer(cmp),
      { kind: 'compare', value: cmp },
      '<, > или =',
    );
  }
  return null;
}

function genRootOfPower(settings: RootSettings, id: string, index?: 2 | 3): Problem | null {
  for (let i = 0; i < 200; i++) {
    const rootIndex = pickIndex(settings, index);
    const base = pickRootValue(settings);
    const exponent = rootIndex;
    const radicand = intPow(base, exponent);
    const answer = base;

    if (!Number.isInteger(radicand)) continue;

    return makeProblem(
      id,
      [rootOfPowerPart(rootIndex, base, exponent), textPart(' = ?')],
      formatNumberAnswer(answer),
      { kind: 'integer', value: answer },
    );
  }
  return null;
}

function genPowerOfRoot(settings: RootSettings, id: string, index?: 2 | 3): Problem | null {
  for (let i = 0; i < 200; i++) {
    const rootIndex = pickIndex(settings, index);
    const value = pickRootValue(settings);
    const { radicand } = perfectPair(value, rootIndex);
    const exponent = rootIndex;
    const answer = intPow(value, exponent);

    return makeProblem(
      id,
      [groupRootPowerPart(rootIndex, radicand, exponent), textPart(' = ?')],
      formatNumberAnswer(answer),
      { kind: 'integer', value: answer },
    );
  }
  return null;
}

function genNested(settings: RootSettings, id: string): Problem | null {
  for (let i = 0; i < 200; i++) {
    const value = pickRootValue(settings);
    const outerRadicand = intPow(value, 4);
    if (outerRadicand > 1_000_000) continue;

    return makeProblem(
      id,
      [nestedRootPart(2, { index: 2, radicand: outerRadicand }), textPart(' = ?')],
      formatNumberAnswer(value),
      { kind: 'integer', value },
    );
  }
  return null;
}

const ALL_MODES: RootMode[] = [
  'sqrt',
  'cbrt',
  'find-radicand',
  'compare',
  'root-of-power',
  'power-of-root',
  'nested',
];

function modeAllowed(mode: RootMode, settings: RootSettings): boolean {
  if (settings.rootKind === 'both') return true;
  if (settings.rootKind === 'sqrt') {
    return mode !== 'cbrt';
  }
  return mode !== 'sqrt' && mode !== 'nested';
}

function pickAllMode(settings: RootSettings): RootMode {
  const allowed = ALL_MODES.filter((m) => modeAllowed(m, settings));
  return allowed[randomInt(0, allowed.length - 1)];
}

function generateByMode(settings: RootSettings, mode: RootMode, id: string): Problem | null {
  switch (mode) {
    case 'sqrt':
      return genCompute(settings, id, 2);
    case 'cbrt':
      return genCompute(settings, id, 3);
    case 'find-radicand':
      return genFindRadicand(settings, id);
    case 'compare':
      return genCompare(settings, id);
    case 'root-of-power':
      return genRootOfPower(settings, id);
    case 'power-of-root':
      return genPowerOfRoot(settings, id);
    case 'nested':
      return settings.rootKind === 'cbrt' ? null : genNested(settings, id);
    case 'roots-all':
      return generateByMode(settings, pickAllMode(settings), id);
    default:
      return null;
  }
}

function generateOne(settings: RootSettings): Problem | null {
  const id = `root-${++problemCounter}-${Date.now()}-${randomInt(0, 99999)}`;
  return generateByMode(settings, settings.mode, id);
}

export function generateRootProblems(settings: RootSettings): Problem[] {
  return fillUniqueProblems(settings.problemsCount, () => {
    const problem = generateOne(settings);
    if (!problem || !isAnswerAllowed(problem, settings)) return null;
    return problem;
  });
}
