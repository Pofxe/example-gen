import type { Problem, ExprPart } from '../../types';
import type { PercentSettings, PercentMode } from './types';
import { percentModeSupportsOperationsCount } from './types';
import {
  randomInt,
  roundTo,
  isInteger,
  percentOf,
  increaseByPercent,
  decreaseByPercent,
  compareValues,
  fracToPercent,
  percentToFrac,
  reduceFrac,
} from './math';
import {
  formatNumberAnswer,
  formatPercentAnswer,
  formatComparisonAnswer,
  formatFracAnswer,
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

function pickPercent(settings: PercentSettings): number {
  if (settings.allowDecimalPercent) {
    const step = 10 ** settings.decimalPlaces;
    const min = settings.minPercent * step;
    const max = settings.maxPercent * step;
    return randomInt(min, max) / step;
  }
  return randomInt(settings.minPercent, settings.maxPercent);
}

function pickNumber(settings: PercentSettings): number {
  const n = randomInt(settings.minNumber, settings.maxNumber);
  if (!settings.allowNegative) return Math.abs(n) || 1;
  return n;
}

function isAnswerAllowed(problem: Problem, settings: PercentSettings): boolean {
  if (settings.allowNegativeAnswer || !problem.check) return true;

  switch (problem.check.kind) {
    case 'compare':
      return true;
    case 'integer':
      return problem.check.value >= 0;
    case 'decimal':
    case 'percent':
      return problem.check.value >= 0;
    case 'frac':
      return problem.check.value.num >= 0;
    default:
      return true;
  }
}

function randomConnector(): '+' | '-' {
  return Math.random() < 0.7 ? '+' : '-';
}

function tryPercentOfTerm(
  settings: PercentSettings,
): { text: string; value: number } | null {
  const percent = pickPercent(settings);
  const number = pickNumber(settings);
  const result = percentOf(percent, number);
  if (!isInteger(result)) return null;
  if (!settings.allowNegativeAnswer && result < 0) return null;
  return {
    text: `${formatPercentAnswer(percent, settings.decimalPlaces)}% от ${number}`,
    value: result,
  };
}

function buildPercentOfChain(
  settings: PercentSettings,
  operationsCount: number,
): { parts: ExprPart[]; value: number } | null {
  for (let attempt = 0; attempt < 100; attempt++) {
    const first = tryPercentOfTerm(settings);
    if (!first) continue;

    const terms = [first];
    const connectors: Array<'+' | '-'> = [];
    let value = first.value;

    let valid = true;
    for (let i = 0; i < operationsCount; i++) {
      const term = tryPercentOfTerm(settings);
      if (!term) {
        valid = false;
        break;
      }
      const conn = randomConnector();
      connectors.push(conn);
      terms.push(term);
      value = conn === '+' ? value + term.value : value - term.value;
    }
    if (!valid) continue;
    if (!isInteger(value)) continue;
    if (!settings.allowNegativeAnswer && value < 0) continue;

    const parts: ExprPart[] = [textPart(terms[0].text)];
    for (let i = 0; i < operationsCount; i++) {
      parts.push(textPart(` ${connectors[i]} `));
      parts.push(textPart(terms[i + 1].text));
    }

    return { parts, value };
  }
  return null;
}

function genPercentOf(settings: PercentSettings, id: string): Problem | null {
  if (settings.operationsCount > 1) {
    const chain = buildPercentOfChain(settings, settings.operationsCount);
    if (!chain) return null;

    return makeProblem(
      id,
      [...chain.parts, textPart(' = ?')],
      formatNumberAnswer(chain.value, settings.decimalPlaces),
      { kind: 'integer', value: chain.value },
      'число',
    );
  }

  for (let i = 0; i < 100; i++) {
    const percent = pickPercent(settings);
    const number = pickNumber(settings);
    const result = percentOf(percent, number);
    if (!isInteger(result)) continue;
    if (!settings.allowNegativeAnswer && result < 0) continue;

    return makeProblem(
      id,
      [textPart(`${formatPercentAnswer(percent, settings.decimalPlaces)}% от ${number} = ?`)],
      formatNumberAnswer(result, settings.decimalPlaces),
      { kind: 'integer', value: result },
      'число',
    );
  }
  return null;
}

function genFindNumber(settings: PercentSettings, id: string): Problem | null {
  for (let i = 0; i < 100; i++) {
    const percent = pickPercent(settings);
    if (percent === 0) continue;
    const number = pickNumber(settings);
    const part = percentOf(percent, number);
    if (!isInteger(part) || part === 0) continue;
    if (!settings.allowNegativeAnswer && number < 0) continue;

    return makeProblem(
      id,
      [textPart(`${formatPercentAnswer(percent, settings.decimalPlaces)}% от числа = ${part}. Число = ?`)],
      formatNumberAnswer(number, settings.decimalPlaces),
      { kind: 'integer', value: number },
      'число',
    );
  }
  return null;
}

function genFindPercent(settings: PercentSettings, id: string): Problem | null {
  for (let i = 0; i < 100; i++) {
    const percent = pickPercent(settings);
    const whole = pickNumber(settings);
    if (whole === 0) continue;
    const part = percentOf(percent, whole);
    if (!isInteger(part) || part < 0) continue;
    if (!settings.allowNegativeAnswer && percent < 0) continue;

    return makeProblem(
      id,
      [textPart(`${part} от ${whole} = ?%`)],
      formatPercentAnswer(percent, settings.decimalPlaces),
      { kind: 'percent', value: percent, places: settings.decimalPlaces },
      'проценты',
    );
  }
  return null;
}

function genIncrease(settings: PercentSettings, id: string): Problem | null {
  for (let i = 0; i < 100; i++) {
    const base = pickNumber(settings);
    const percents: number[] = [];
    let value = base;

    for (let j = 0; j < settings.operationsCount; j++) {
      const percent = pickPercent(settings);
      percents.push(percent);
      value = increaseByPercent(value, percent);
    }

    if (!isInteger(value)) continue;
    if (!settings.allowNegativeAnswer && value < 0) continue;

    const formattedPercents = percents.map((p) =>
      formatPercentAnswer(p, settings.decimalPlaces),
    );
    const text =
      settings.operationsCount === 1
        ? `Увеличить ${base} на ${formattedPercents[0]}% = ?`
        : `Увеличить ${base} на ${formattedPercents.join('%, затем на ')}% = ?`;

    return makeProblem(
      id,
      [textPart(text)],
      formatNumberAnswer(value, settings.decimalPlaces),
      { kind: 'integer', value: value },
    );
  }
  return null;
}

function genDecrease(settings: PercentSettings, id: string): Problem | null {
  for (let i = 0; i < 100; i++) {
    const base = pickNumber(settings);
    const percents: number[] = [];
    let value = base;

    for (let j = 0; j < settings.operationsCount; j++) {
      const percent = pickPercent(settings);
      percents.push(percent);
      value = decreaseByPercent(value, percent);
    }

    if (!isInteger(value)) continue;
    if (!settings.allowNegativeAnswer && value < 0) continue;

    const formattedPercents = percents.map((p) =>
      formatPercentAnswer(p, settings.decimalPlaces),
    );
    const text =
      settings.operationsCount === 1
        ? `Уменьшить ${base} на ${formattedPercents[0]}% = ?`
        : `Уменьшить ${base} на ${formattedPercents.join('%, затем на ')}% = ?`;

    return makeProblem(
      id,
      [textPart(text)],
      formatNumberAnswer(value, settings.decimalPlaces),
      { kind: 'integer', value: value },
    );
  }
  return null;
}

function genCompare(settings: PercentSettings, id: string): Problem | null {
  if (settings.operationsCount > 1) {
    const left = buildPercentOfChain(settings, settings.operationsCount);
    const right = buildPercentOfChain(settings, settings.operationsCount);
    if (!left || !right) return null;

    const cmp = compareValues(left.value, right.value);

    return makeProblem(
      id,
      [...left.parts, textPart('  ?  '), ...right.parts],
      formatComparisonAnswer(cmp),
      { kind: 'compare', value: cmp },
      '<, > или =',
    );
  }

  const p1 = pickPercent(settings);
  const p2 = pickPercent(settings);
  const n1 = pickNumber(settings);
  const n2 = pickNumber(settings);
  const v1 = percentOf(p1, n1);
  const v2 = percentOf(p2, n2);
  if (!isInteger(v1) || !isInteger(v2)) return null;

  const cmp = compareValues(v1, v2);

  return makeProblem(
    id,
    [
      textPart(`${formatPercentAnswer(p1, settings.decimalPlaces)}% от ${n1}`),
      textPart('  ?  '),
      textPart(`${formatPercentAnswer(p2, settings.decimalPlaces)}% от ${n2}`),
    ],
    formatComparisonAnswer(cmp),
    { kind: 'compare', value: cmp },
    '<, > или =',
  );
}

function genFractionToPercent(settings: PercentSettings, id: string): Problem | null {
  const den = randomInt(2, 10);
  const num = randomInt(1, den - 1);
  const f = reduceFrac({ num, den });
  const percent = fracToPercent(f);
  const rounded = roundTo(percent, settings.decimalPlaces);
  if (!Number.isFinite(rounded)) return null;

  return makeProblem(
    id,
    [textPart(`${f.num}/${f.den} = ?%`)],
    formatPercentAnswer(rounded, settings.decimalPlaces),
    { kind: 'percent', value: rounded, places: settings.decimalPlaces },
    'проценты',
  );
}

function genPercentToFraction(settings: PercentSettings, id: string): Problem | null {
  const percent = pickPercent(settings);
  const f = reduceFrac(percentToFrac(percent));
  if (f.den > 100) return null;

  return makeProblem(
    id,
    [textPart(`${formatPercentAnswer(percent, settings.decimalPlaces)}% = ?`)],
    formatFracAnswer(f.num, f.den),
    { kind: 'frac', value: f },
    'числитель/знаменатель',
  );
}

function genPercentToDecimal(settings: PercentSettings, id: string): Problem | null {
  const percent = pickPercent(settings);
  const decimal = roundTo(percent / 100, settings.decimalPlaces + 1);

  return makeProblem(
    id,
    [textPart(`${formatPercentAnswer(percent, settings.decimalPlaces)}% = ?`)],
    formatNumberAnswer(decimal, settings.decimalPlaces + 1),
    { kind: 'decimal', value: decimal, places: settings.decimalPlaces + 1 },
    'десятичная дробь',
  );
}

function genDecimalToPercent(settings: PercentSettings, id: string): Problem | null {
  const percent = pickPercent(settings);
  const decimal = roundTo(percent / 100, settings.decimalPlaces + 1);

  return makeProblem(
    id,
    [textPart(`${formatNumberAnswer(decimal, settings.decimalPlaces + 1)} = ?%`)],
    formatPercentAnswer(percent, settings.decimalPlaces),
    { kind: 'percent', value: percent, places: settings.decimalPlaces },
    'проценты',
  );
}

const ALL_MODES: PercentMode[] = [
  'percent-of',
  'find-number',
  'find-percent',
  'increase',
  'decrease',
  'compare',
  'fraction-to-percent',
  'percent-to-fraction',
  'percent-to-decimal',
  'decimal-to-percent',
];

function generateByMode(settings: PercentSettings, mode: PercentMode, id: string): Problem | null {
  const opsSettings =
    percentModeSupportsOperationsCount(mode) || mode === 'percent-all'
      ? settings
      : { ...settings, operationsCount: 1 };

  switch (mode) {
    case 'percent-of':
      return genPercentOf(opsSettings, id);
    case 'find-number':
      return genFindNumber(opsSettings, id);
    case 'find-percent':
      return genFindPercent(opsSettings, id);
    case 'increase':
      return genIncrease(opsSettings, id);
    case 'decrease':
      return genDecrease(opsSettings, id);
    case 'compare':
      return genCompare(opsSettings, id);
    case 'fraction-to-percent':
      return genFractionToPercent(opsSettings, id);
    case 'percent-to-fraction':
      return genPercentToFraction(opsSettings, id);
    case 'percent-to-decimal':
      return genPercentToDecimal(opsSettings, id);
    case 'decimal-to-percent':
      return genDecimalToPercent(opsSettings, id);
    case 'percent-all': {
      const picked = ALL_MODES[randomInt(0, ALL_MODES.length - 1)];
      return generateByMode(settings, picked, id);
    }
    default:
      return null;
  }
}

function generateOne(settings: PercentSettings): Problem | null {
  const id = `pct-${++problemCounter}-${Date.now()}-${randomInt(0, 99999)}`;
  return generateByMode(settings, settings.mode, id);
}

export function generatePercentProblems(settings: PercentSettings): Problem[] {
  return fillUniqueProblems(settings.problemsCount, () => {
    const problem = generateOne(settings);
    if (!problem || !isAnswerAllowed(problem, settings)) return null;
    return problem;
  });
}
