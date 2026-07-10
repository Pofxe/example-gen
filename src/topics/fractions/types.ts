export type FractionMode =
  | 'compare'
  | 'ordinary-add'
  | 'ordinary-sub'
  | 'ordinary-mul'
  | 'ordinary-div'
  | 'ordinary-all'
  | 'mixed'
  | 'reduce'
  | 'common-denom'
  | 'mixed-to-improper'
  | 'improper-to-mixed'
  | 'ordinary-to-decimal'
  | 'decimal-to-ordinary'
  | 'decimal-add'
  | 'decimal-sub'
  | 'decimal-mul'
  | 'decimal-div'
  | 'decimal-all'
  | 'mixed-types';

export interface FractionSettings {
  mode: FractionMode;
  operationsCount: number;
  maxDenominator: number;
  maxNumerator: number;
  maxWhole: number;
  decimalPlaces: number;
  problemsCount: number;
  allowNegative: boolean;
  allowNegativeAnswer: boolean;
}

export const DEFAULT_FRACTION_SETTINGS: FractionSettings = {
  mode: 'compare',
  operationsCount: 1,
  maxDenominator: 12,
  maxNumerator: 12,
  maxWhole: 5,
  decimalPlaces: 2,
  problemsCount: 10,
  allowNegative: false,
  allowNegativeAnswer: false,
};

const FRACTION_OPS_MODES: FractionMode[] = [
  'ordinary-add',
  'ordinary-sub',
  'ordinary-mul',
  'ordinary-div',
  'ordinary-all',
  'mixed',
  'decimal-add',
  'decimal-sub',
  'decimal-mul',
  'decimal-div',
  'decimal-all',
  'mixed-types',
];

export function fractionModeSupportsOperationsCount(mode: FractionMode): boolean {
  return FRACTION_OPS_MODES.includes(mode);
}

export interface FractionModeInfo {
  id: FractionMode;
  label: string;
  group: string;
}

export const FRACTION_MODES: FractionModeInfo[] = [
  { id: 'compare', label: 'Сравнение дробей', group: 'Обыкновенные' },
  { id: 'ordinary-add', label: 'Сложение', group: 'Обыкновенные — по отдельности' },
  { id: 'ordinary-sub', label: 'Вычитание', group: 'Обыкновенные — по отдельности' },
  { id: 'ordinary-mul', label: 'Умножение', group: 'Обыкновенные — по отдельности' },
  { id: 'ordinary-div', label: 'Деление', group: 'Обыкновенные — по отдельности' },
  { id: 'ordinary-all', label: 'Все действия вместе', group: 'Обыкновенные' },
  { id: 'mixed', label: 'Смешанные числа', group: 'Обыкновенные' },
  { id: 'reduce', label: 'Сокращение дробей', group: 'Обыкновенные' },
  { id: 'common-denom', label: 'Общий знаменатель', group: 'Обыкновенные' },
  { id: 'mixed-to-improper', label: 'Смешанное → неправильная', group: 'Преобразования' },
  { id: 'improper-to-mixed', label: 'Неправильная → смешанное', group: 'Преобразования' },
  { id: 'ordinary-to-decimal', label: 'Обыкновенная → десятичная', group: 'Преобразования' },
  { id: 'decimal-to-ordinary', label: 'Десятичная → обыкновенная', group: 'Преобразования' },
  { id: 'decimal-add', label: 'Сложение', group: 'Десятичные — по отдельности' },
  { id: 'decimal-sub', label: 'Вычитание', group: 'Десятичные — по отдельности' },
  { id: 'decimal-mul', label: 'Умножение', group: 'Десятичные — по отдельности' },
  { id: 'decimal-div', label: 'Деление', group: 'Десятичные — по отдельности' },
  { id: 'decimal-all', label: 'Все действия вместе', group: 'Десятичные' },
  { id: 'mixed-types', label: 'Обыкновенные и десятичные', group: 'Смешанные типы' },
];

export const FRACTION_MODE_GROUPS = Array.from(
  new Set(FRACTION_MODES.map((m) => m.group)),
);
