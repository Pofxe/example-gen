import type { Problem, ExprPart } from '../../types';
import type { FractionSettings, FractionMode } from './types';
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
  gcd,
} from './math';
import {
  formatFracAnswer,
  formatComparisonAnswer,
  formatCommonDenomAnswer,
} from './format';

function fracPart(f: Frac, whole?: number): ExprPart {
  if (whole !== undefined) {
    return { kind: 'frac', num: f.num, den: f.den, whole };
  }
  const m = toMixed(f);
  if (m.whole !== 0 && m.num !== 0) {
    return { kind: 'frac', num: m.num, den: m.den, whole: m.whole };
  }
  if (m.whole !== 0 && m.num === 0) {
    return { kind: 'text', text: String(m.whole) };
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

function randomProperFrac(maxDen: number, maxNum: number, allowNeg: boolean): Frac {
  const den = randomDen(2, maxDen);
  let num = randomInt(1, Math.min(maxNum, den - 1));
  if (allowNeg && Math.random() < 0.3) num = -num;
  return { num, den };
}

function randomUnreducedFrac(maxDen: number, maxNum: number): Frac {
  const base = randomProperFrac(maxDen, maxNum, false);
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
  const a = randomProperFrac(settings.maxDenominator, settings.maxNumerator, settings.allowNegative);
  const b = randomProperFrac(settings.maxDenominator, settings.maxNumerator, settings.allowNegative);
  const cmp = compareFrac(a, b);

  return makeProblem(
    id,
    [fracPart(a), textPart('  ?  '), fracPart(b)],
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
    [fracPart(unreduced), textPart(' = ?')],
    formatFracAnswer(answer),
    { kind: 'frac', value: answer },
    'числитель/знаменатель',
  );
}

function genCommonDenom(settings: FractionSettings, id: string): Problem | null {
  let a = randomProperFrac(settings.maxDenominator, settings.maxNumerator, false);
  let b = randomProperFrac(settings.maxDenominator, settings.maxNumerator, false);
  if (a.den === b.den) b = { ...b, den: b.den + 1 > settings.maxDenominator ? 2 : b.den + 1 };

  const { a: ca, b: cb } = toCommonDenominator(a, b);

  return makeProblem(
    id,
    [
      textPart('Запишите с общим знаменателем: '),
      fracPart(a),
      textPart(' и '),
      fracPart(b),
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
    [fracPart({ num: m.num, den: m.den }, m.whole), textPart(' = ?')],
    formatFracAnswer(answer),
    { kind: 'frac', value: answer },
  );
}

function genImproperToMixed(settings: FractionSettings, id: string): Problem | null {
  const f = randomImproperFrac(settings.maxDenominator, settings.maxNumerator, settings.allowNegative);

  return makeProblem(
    id,
    [fracPart(f), textPart(' = ?')],
    formatFracAnswer(f),
    { kind: 'frac', value: f },
  );
}

function genOrdinaryToDecimal(settings: FractionSettings, id: string): Problem | null {
  const den = randomInt(2, Math.min(10, settings.maxDenominator));
  const num = randomInt(1, den - 1);
  const factor = gcd(num, den) === 1 ? 1 : 2;
  const f = reduce({ num: num * factor, den: den * factor });
  const dec = fracToNumber(f);
  const rounded = roundDecimal(dec, settings.decimalPlaces);

  if (!Number.isFinite(rounded)) return null;

  return makeProblem(
    id,
    [fracPart(f), textPart(' = ?')],
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

function genOrdinaryOp(
  settings: FractionSettings,
  id: string,
  op: FracOp,
): Problem | null {
  const a = randomProperFrac(settings.maxDenominator, settings.maxNumerator, settings.allowNegative);
  const b = randomProperFrac(settings.maxDenominator, settings.maxNumerator, settings.allowNegative);
  const result = applyFracOp(a, op, b);
  if (!result) return null;

  return makeProblem(
    id,
    [fracPart(a), textPart(opSymbol(op)), fracPart(b), textPart(' = ?')],
    formatFracAnswer(result),
    { kind: 'frac', value: result },
    'числитель/знаменатель',
  );
}

function genMixedOp(settings: FractionSettings, id: string): Problem | null {
  const op = randomOrdinaryOp();
  const ma = randomMixed(settings.maxWhole, settings.maxDenominator, settings.maxNumerator, settings.allowNegative);
  const mb = randomMixed(settings.maxWhole, settings.maxDenominator, settings.maxNumerator, settings.allowNegative);
  const a = toImproper(ma);
  const b = toImproper(mb);
  const result = applyFracOp(a, op, b);
  if (!result) return null;

  return makeProblem(
    id,
    [
      fracPart({ num: ma.num, den: ma.den }, ma.whole),
      textPart(opSymbol(op)),
      fracPart({ num: mb.num, den: mb.den }, mb.whole),
      textPart(' = ?'),
    ],
    formatFracAnswer(result),
    { kind: 'frac', value: result },
  );
}

function genDecimalOp(
  settings: FractionSettings,
  id: string,
  op: FracOp,
): Problem | null {
  const a = randomDecimal(settings.maxWhole, settings.decimalPlaces, settings.allowNegative);
  const b = randomDecimal(Math.max(1, settings.maxWhole), settings.decimalPlaces, false);
  if (op === '/' && b === 0) return null;

  const result = applyDecimalOp(a, op, b);
  if (result === null || !Number.isFinite(result)) return null;

  const rounded = roundDecimal(result, settings.decimalPlaces);

  return makeProblem(
    id,
    [
      textPart(`${fracToDecimal({ num: Math.round(a * 10 ** settings.decimalPlaces), den: 10 ** settings.decimalPlaces }, settings.decimalPlaces)}${opSymbol(op)}${fracToDecimal({ num: Math.round(b * 10 ** settings.decimalPlaces), den: 10 ** settings.decimalPlaces }, settings.decimalPlaces)} = ?`),
    ],
    fracToDecimal({ num: Math.round(rounded * 10 ** settings.decimalPlaces), den: 10 ** settings.decimalPlaces }, settings.decimalPlaces),
    { kind: 'decimal', value: rounded, places: settings.decimalPlaces },
  );
}

function genMixedTypes(settings: FractionSettings, id: string): Problem | null {
  const op = randomOrdinaryOp();
  const a = randomProperFrac(settings.maxDenominator, settings.maxNumerator, settings.allowNegative);
  const dec = randomDecimal(settings.maxWhole, settings.decimalPlaces, settings.allowNegative);
  const bFrac = decimalToFrac(dec, settings.maxDenominator);
  if (!bFrac) return null;

  const useFracFirst = Math.random() < 0.5;
  const left = useFracFirst ? a : bFrac;
  const right = useFracFirst ? bFrac : a;

  const result = applyFracOp(left, op, right);
  if (!result) return null;

  const parts: ExprPart[] = useFracFirst
    ? [fracPart(a), textPart(opSymbol(op)), decimalPart(dec, settings.decimalPlaces), textPart(' = ?')]
    : [decimalPart(dec, settings.decimalPlaces), textPart(opSymbol(op)), fracPart(a), textPart(' = ?')];

  return makeProblem(
    id,
    parts,
    formatFracAnswer(result),
    { kind: 'frac', value: result },
  );
}

function generateOne(settings: FractionSettings, index: number): Problem | null {
  const id = `frac-${index}-${Date.now()}-${randomInt(0, 99999)}`;
  const { mode } = settings;

  const singleOp = modeToOp(mode);
  if (singleOp && mode.startsWith('ordinary-')) return genOrdinaryOp(settings, id, singleOp);
  if (singleOp && mode.startsWith('decimal-')) return genDecimalOp(settings, id, singleOp);

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
      return genOrdinaryOp(settings, id, randomOrdinaryOp());
    case 'mixed':
      return genMixedOp(settings, id);
    case 'decimal-all':
      return genDecimalOp(settings, id, randomOrdinaryOp());
    case 'mixed-types':
      return genMixedTypes(settings, id);
    default:
      return null;
  }
}

export function generateFractionProblems(settings: FractionSettings): Problem[] {
  const problems: Problem[] = [];

  for (let i = 0; i < settings.problemsCount; i++) {
    for (let attempt = 0; attempt < 200; attempt++) {
      const p = generateOne(settings, i);
      if (p) {
        problems.push(p);
        break;
      }
    }
  }

  return problems;
}
