import type { Problem, ExprPart } from '../../types';
import type { FractionSettings, FractionMode } from './types';
import { fractionModeSupportsOperationsCount } from './types';
import type { Frac, FracOp, Mixed } from './math';
import {
  randomInt,
  reduce,
  compareFrac,
  toCommonDenominator,
  toImproper,
  toMixed,
  fracToDecimal,
  fracToNumber,
  decimalToFrac,
  applyFracOp,
  applyDecimalOp,
  roundDecimal,
} from './math';
import {
  formatFracAnswer,
  formatComparisonAnswer,
  formatCommonDenomAnswer,
} from './format';
import { fillUniqueProblems } from '../../utils/problemSignature';

let fractionProblemCounter = 0;

function isAnswerAllowed(problem: Problem, settings: FractionSettings): boolean {
  if (settings.allowNegativeAnswer || !problem.check) return true;

  switch (problem.check.kind) {
    case 'compare':
    case 'common-denom':
      return true;
    case 'integer':
      return problem.check.value >= 0;
    case 'frac':
      return problem.check.value.num >= 0;
    case 'decimal':
      return problem.check.value >= 0;
    default:
      return true;
  }
}

function fracPart(f: Frac, options?: { whole?: number; asImproper?: boolean }): ExprPart {
  const whole = options?.whole;
  const asImproper = options?.asImproper ?? false;

  if (whole !== undefined) {
    return { kind: 'frac', num: f.num, den: f.den, whole };
  }

  const absNum = Math.abs(f.num);
  const den = f.den;

  if (!asImproper && absNum >= den) {
    const m = toMixed(f);
    if (m.whole !== 0 && m.num !== 0) {
      return { kind: 'frac', num: m.num, den: m.den, whole: m.whole };
    }
    if (m.whole !== 0 && m.num === 0) {
      return { kind: 'text', text: String(m.whole) };
    }
  }

  return { kind: 'frac', num: f.num, den: f.den };
}

function textPart(text: string): ExprPart {
  return { kind: 'text', text };
}

function decimalPart(value: number, places: number): ExprPart {
  const rounded = roundDecimal(value, places);
  return { kind: 'decimal', value: String(rounded) };
}

function randomDen(min: number, max: number): number {
  return randomInt(Math.max(2, min), max);
}

/** Случайная дробь: правильная (|числ| < знам.) или неправильная (|числ| ≥ знам.) */
function randomOrdinaryFrac(maxDen: number, maxNum: number, allowNeg: boolean): Frac {
  const den = randomDen(2, maxDen);
  const absMax = Math.max(maxNum, den);

  let absNum: number;
  if (Math.random() < 0.5 && den > 1) {
    absNum = randomInt(1, Math.min(maxNum, den - 1));
  } else {
    absNum = randomInt(den, Math.min(absMax, den * 3));
  }

  let num = absNum;
  if (allowNeg && Math.random() < 0.3) num = -num;
  return { num, den };
}

function randomUnreducedFrac(maxDen: number, maxNum: number): Frac {
  const base = randomOrdinaryFrac(maxDen, maxNum, false);
  const factor = randomInt(2, 4);
  return { num: base.num * factor, den: base.den * factor };
}

function randomImproperFrac(maxDen: number, maxNum: number, allowNeg: boolean): Frac {
  const den = randomDen(2, maxDen);
  let num = randomInt(den + 1, Math.min(maxNum * 2, den * 3));
  if (allowNeg && Math.random() < 0.3) num = -num;
  return { num, den };
}

function randomMixed(maxWhole: number, maxDen: number, maxNum: number, allowNeg: boolean): Mixed {
  let whole = randomInt(1, maxWhole);
  const den = randomDen(2, maxDen);
  const num = randomInt(1, Math.min(maxNum, den - 1));
  if (allowNeg && Math.random() < 0.3) whole = -whole;
  return { whole, num, den };
}

function randomDecimal(maxWhole: number, places: number, allowNeg: boolean): number {
  const max = maxWhole * 10 ** places;
  let n = randomInt(1, max) / 10 ** places;
  if (allowNeg && Math.random() < 0.3) n = -n;
  return roundDecimal(n, places);
}

function opSymbol(op: FracOp): string {
  return op === '+' ? ' + ' : op === '-' ? ' − ' : op === '*' ? ' × ' : ' ÷ ';
}

function modeToOp(mode: FractionMode): FracOp | null {
  if (mode === 'ordinary-add' || mode === 'decimal-add') return '+';
  if (mode === 'ordinary-sub' || mode === 'decimal-sub') return '-';
  if (mode === 'ordinary-mul' || mode === 'decimal-mul') return '*';
  if (mode === 'ordinary-div' || mode === 'decimal-div') return '/';
  return null;
}

function randomOrdinaryOp(): FracOp {
  const ops: FracOp[] = ['+', '-', '*', '/'];
  return ops[randomInt(0, ops.length - 1)];
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

function genCompare(settings: FractionSettings, id: string): Problem | null {
  const a = randomOrdinaryFrac(settings.maxDenominator, settings.maxNumerator, settings.allowNegative);
  const b = randomOrdinaryFrac(settings.maxDenominator, settings.maxNumerator, settings.allowNegative);
  const cmp = compareFrac(a, b);

  return makeProblem(
    id,
    [fracPart(a, { asImproper: true }), textPart('  ?  '), fracPart(b, { asImproper: true })],
    formatComparisonAnswer(cmp),
    { kind: 'compare', value: cmp },
    '<, > или =',
  );
}

function genReduce(settings: FractionSettings, id: string): Problem | null {
  const unreduced = randomUnreducedFrac(settings.maxDenominator, settings.maxNumerator);
  const answer = reduce(unreduced);

  return makeProblem(
    id,
    [fracPart(unreduced, { asImproper: true }), textPart(' = ?')],
    formatFracAnswer(answer),
    { kind: 'frac', value: answer },
    'числитель/знаменатель',
  );
}

function genCommonDenom(settings: FractionSettings, id: string): Problem | null {
  let a = randomOrdinaryFrac(settings.maxDenominator, settings.maxNumerator, false);
  let b = randomOrdinaryFrac(settings.maxDenominator, settings.maxNumerator, false);
  if (a.den === b.den && Math.abs(a.num) === Math.abs(b.num)) {
    b = { ...b, num: b.num + 1 };
  } else if (a.den === b.den) {
    b = { ...b, den: b.den + 1 > settings.maxDenominator ? 2 : b.den + 1 };
  }

  const { a: ca, b: cb } = toCommonDenominator(a, b);

  return makeProblem(
    id,
    [
      textPart('Запишите с общим знаменателем: '),
      fracPart(a, { asImproper: true }),
      textPart(' и '),
      fracPart(b, { asImproper: true }),
    ],
    formatCommonDenomAnswer(ca, cb),
    { kind: 'common-denom', a: ca, b: cb },
    '3/6 2/6',
  );
}

function genMixedToImproper(settings: FractionSettings, id: string): Problem | null {
  const m = randomMixed(settings.maxWhole, settings.maxDenominator, settings.maxNumerator, settings.allowNegative);
  const answer = toImproper(m);

  return makeProblem(
    id,
    [fracPart({ num: m.num, den: m.den }, { whole: m.whole }), textPart(' = ?')],
    formatFracAnswer(answer),
    { kind: 'frac', value: answer },
  );
}

function genImproperToMixed(settings: FractionSettings, id: string): Problem | null {
  const f = randomImproperFrac(settings.maxDenominator, settings.maxNumerator, settings.allowNegative);

  return makeProblem(
    id,
    [fracPart(f, { asImproper: true }), textPart(' = ?')],
    formatFracAnswer(f),
    { kind: 'frac', value: f },
  );
}

function genOrdinaryToDecimal(settings: FractionSettings, id: string): Problem | null {
  const f = reduce(randomOrdinaryFrac(settings.maxDenominator, settings.maxNumerator, settings.allowNegative));
  const dec = fracToNumber(f);
  const rounded = roundDecimal(dec, settings.decimalPlaces);

  if (!Number.isFinite(rounded)) return null;

  return makeProblem(
    id,
    [fracPart(f, { asImproper: true }), textPart(' = ?')],
    fracToDecimal(f, settings.decimalPlaces),
    { kind: 'decimal', value: rounded, places: settings.decimalPlaces },
  );
}

function genDecimalToOrdinary(settings: FractionSettings, id: string): Problem | null {
  const dec = randomDecimal(settings.maxWhole, settings.decimalPlaces, settings.allowNegative);
  const f = decimalToFrac(dec, settings.maxDenominator);
  if (!f) return null;

  return makeProblem(
    id,
    [textPart(`${fracToDecimal({ num: Math.round(dec * 10 ** settings.decimalPlaces), den: 10 ** settings.decimalPlaces }, settings.decimalPlaces)} = ?`)],
    formatFracAnswer(f),
    { kind: 'frac', value: f },
  );
}

function genOrdinaryChain(
  settings: FractionSettings,
  id: string,
  fixedOp?: FracOp,
): Problem | null {
  const count = settings.operationsCount;
  const operands: Frac[] = [randomOrdinaryFrac(settings.maxDenominator, settings.maxNumerator, settings.allowNegative)];
  const ops: FracOp[] = [];

  for (let i = 0; i < count; i++) {
    ops.push(fixedOp ?? randomOrdinaryOp());
    operands.push(randomOrdinaryFrac(settings.maxDenominator, settings.maxNumerator, settings.allowNegative));
  }

  let result = operands[0];
  for (let i = 0; i < count; i++) {
    const next = applyFracOp(result, ops[i], operands[i + 1]);
    if (!next) return null;
    result = next;
  }

  const parts: ExprPart[] = [fracPart(operands[0], { asImproper: true })];
  for (let i = 0; i < count; i++) {
    parts.push(textPart(opSymbol(ops[i])));
    parts.push(fracPart(operands[i + 1], { asImproper: true }));
  }
  parts.push(textPart(' = ?'));

  return makeProblem(
    id,
    parts,
    formatFracAnswer(result),
    { kind: 'frac', value: result },
    'числитель/знаменатель',
  );
}

function genMixedChain(settings: FractionSettings, id: string): Problem | null {
  const count = settings.operationsCount;
  const mixedOperands: Mixed[] = [];
  const ops: FracOp[] = [];

  for (let i = 0; i <= count; i++) {
    mixedOperands.push(
      randomMixed(settings.maxWhole, settings.maxDenominator, settings.maxNumerator, settings.allowNegative),
    );
    if (i < count) ops.push(randomOrdinaryOp());
  }

  let result = toImproper(mixedOperands[0]);
  for (let i = 0; i < count; i++) {
    const next = applyFracOp(result, ops[i], toImproper(mixedOperands[i + 1]));
    if (!next) return null;
    result = next;
  }

  const parts: ExprPart[] = [
    fracPart({ num: mixedOperands[0].num, den: mixedOperands[0].den }, { whole: mixedOperands[0].whole }),
  ];
  for (let i = 0; i < count; i++) {
    const m = mixedOperands[i + 1];
    parts.push(textPart(opSymbol(ops[i])));
    parts.push(fracPart({ num: m.num, den: m.den }, { whole: m.whole }));
  }
  parts.push(textPart(' = ?'));

  return makeProblem(
    id,
    parts,
    formatFracAnswer(result),
    { kind: 'frac', value: result },
  );
}

function genDecimalChain(
  settings: FractionSettings,
  id: string,
  fixedOp?: FracOp,
): Problem | null {
  const count = settings.operationsCount;
  const operands: number[] = [];
  const ops: FracOp[] = [];
  const scale = 10 ** settings.decimalPlaces;

  for (let i = 0; i <= count; i++) {
    operands.push(
      randomDecimal(
        i === 0 ? settings.maxWhole : Math.max(1, settings.maxWhole),
        settings.decimalPlaces,
        i === 0 ? settings.allowNegative : false,
      ),
    );
    if (i < count) ops.push(fixedOp ?? randomOrdinaryOp());
  }

  let result = operands[0];
  for (let i = 0; i < count; i++) {
    if (ops[i] === '/' && operands[i + 1] === 0) return null;
    const next = applyDecimalOp(result, ops[i], operands[i + 1]);
    if (next === null || !Number.isFinite(next)) return null;
    result = next;
  }

  const rounded = roundDecimal(result, settings.decimalPlaces);
  const parts: ExprPart[] = [
    textPart(
      `${fracToDecimal({ num: Math.round(operands[0] * scale), den: scale }, settings.decimalPlaces)}`,
    ),
  ];
  for (let i = 0; i < count; i++) {
    const b = operands[i + 1];
    parts.push(
      textPart(
        `${opSymbol(ops[i])}${fracToDecimal({ num: Math.round(b * scale), den: scale }, settings.decimalPlaces)}`,
      ),
    );
  }
  parts.push(textPart(' = ?'));

  return makeProblem(
    id,
    parts,
    fracToDecimal({ num: Math.round(rounded * scale), den: scale }, settings.decimalPlaces),
    { kind: 'decimal', value: rounded, places: settings.decimalPlaces },
  );
}

type MixedTypeOperand =
  | { kind: 'frac'; frac: Frac }
  | { kind: 'decimal'; value: number };

function genMixedTypesChain(settings: FractionSettings, id: string): Problem | null {
  const count = settings.operationsCount;
  const operands: MixedTypeOperand[] = [];
  const ops: FracOp[] = [];

  for (let i = 0; i <= count; i++) {
    if (Math.random() < 0.5) {
      operands.push({
        kind: 'frac',
        frac: randomOrdinaryFrac(settings.maxDenominator, settings.maxNumerator, settings.allowNegative),
      });
    } else {
      const dec = randomDecimal(settings.maxWhole, settings.decimalPlaces, settings.allowNegative);
      const frac = decimalToFrac(dec, settings.maxDenominator);
      if (!frac) return null;
      operands.push({ kind: 'decimal', value: dec });
    }
    if (i < count) ops.push(randomOrdinaryOp());
  }

  const toFrac = (op: MixedTypeOperand): Frac | null => {
    if (op.kind === 'frac') return op.frac;
    return decimalToFrac(op.value, settings.maxDenominator);
  };

  let result = toFrac(operands[0]);
  if (!result) return null;

  for (let i = 0; i < count; i++) {
    const right = toFrac(operands[i + 1]);
    if (!right) return null;
    const next = applyFracOp(result, ops[i], right);
    if (!next) return null;
    result = next;
  }

  const operandPart = (op: MixedTypeOperand): ExprPart => {
    if (op.kind === 'frac') return fracPart(op.frac, { asImproper: true });
    return decimalPart(op.value, settings.decimalPlaces);
  };

  const parts: ExprPart[] = [operandPart(operands[0])];
  for (let i = 0; i < count; i++) {
    parts.push(textPart(opSymbol(ops[i])));
    parts.push(operandPart(operands[i + 1]));
  }
  parts.push(textPart(' = ?'));

  return makeProblem(
    id,
    parts,
    formatFracAnswer(result),
    { kind: 'frac', value: result },
  );
}

function generateOne(settings: FractionSettings): Problem | null {
  const id = `frac-${++fractionProblemCounter}-${Date.now()}-${randomInt(0, 99999)}`;
  const { mode } = settings;
  const opsSettings = fractionModeSupportsOperationsCount(mode)
    ? settings
    : { ...settings, operationsCount: 1 };

  const singleOp = modeToOp(mode);
  if (singleOp && mode.startsWith('ordinary-')) return genOrdinaryChain(opsSettings, id, singleOp);
  if (singleOp && mode.startsWith('decimal-')) return genDecimalChain(opsSettings, id, singleOp);

  switch (mode) {
    case 'compare':
      return genCompare(settings, id);
    case 'reduce':
      return genReduce(settings, id);
    case 'common-denom':
      return genCommonDenom(settings, id);
    case 'mixed-to-improper':
      return genMixedToImproper(settings, id);
    case 'improper-to-mixed':
      return genImproperToMixed(settings, id);
    case 'ordinary-to-decimal':
      return genOrdinaryToDecimal(settings, id);
    case 'decimal-to-ordinary':
      return genDecimalToOrdinary(settings, id);
    case 'ordinary-all':
      return genOrdinaryChain(opsSettings, id);
    case 'mixed':
      return genMixedChain(opsSettings, id);
    case 'decimal-all':
      return genDecimalChain(opsSettings, id);
    case 'mixed-types':
      return genMixedTypesChain(opsSettings, id);
    default:
      return null;
  }
}

export function generateFractionProblems(settings: FractionSettings): Problem[] {
  return fillUniqueProblems(settings.problemsCount, () => {
    const problem = generateOne(settings);
    if (!problem || !isAnswerAllowed(problem, settings)) return null;
    return problem;
  });
}
