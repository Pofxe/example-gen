export type PercentMode =
  | 'percent-of'
  | 'find-number'
  | 'find-percent'
  | 'increase'
  | 'decrease'
  | 'compare'
  | 'percent-all'
  | 'fraction-to-percent'
  | 'percent-to-fraction'
  | 'percent-to-decimal'
  | 'decimal-to-percent';

export interface PercentSettings {
  mode: PercentMode;
  operationsCount: number;
  minPercent: number;
  maxPercent: number;
  minNumber: number;
  maxNumber: number;
  problemsCount: number;
  decimalPlaces: number;
  allowNegative: boolean;
  allowNegativeAnswer: boolean;
  allowDecimalPercent: boolean;
}

export const DEFAULT_PERCENT_SETTINGS: PercentSettings = {
  mode: 'percent-of',
  operationsCount: 1,
  minPercent: 5,
  maxPercent: 50,
  minNumber: 10,
  maxNumber: 200,
  problemsCount: 10,
  decimalPlaces: 1,
  allowNegative: false,
  allowNegativeAnswer: false,
  allowDecimalPercent: false,
};

const PERCENT_OPS_MODES: PercentMode[] = [
  'percent-of',
  'increase',
  'decrease',
  'compare',
  'percent-all',
];

export function percentModeSupportsOperationsCount(mode: PercentMode): boolean {
  return PERCENT_OPS_MODES.includes(mode);
}

export interface PercentModeInfo {
  id: PercentMode;
  label: string;
  group: string;
}

export const PERCENT_MODES: PercentModeInfo[] = [
  { id: 'percent-of', label: 'Процент от числа', group: 'Основные' },
  { id: 'find-number', label: 'Число по проценту', group: 'Основные' },
  { id: 'find-percent', label: 'Сколько процентов', group: 'Основные' },
  { id: 'increase', label: 'Увеличение на процент', group: 'Основные' },
  { id: 'decrease', label: 'Уменьшение на процент', group: 'Основные' },
  { id: 'compare', label: 'Сравнение выражений', group: 'Основные' },
  { id: 'percent-all', label: 'Все типы вместе', group: 'Основные' },
  { id: 'fraction-to-percent', label: 'Дробь → проценты', group: 'Преобразования' },
  { id: 'percent-to-fraction', label: 'Проценты → дробь', group: 'Преобразования' },
  { id: 'percent-to-decimal', label: 'Проценты → десятичная', group: 'Преобразования' },
  { id: 'decimal-to-percent', label: 'Десятичная → проценты', group: 'Преобразования' },
];

export const PERCENT_MODE_GROUPS = Array.from(
  new Set(PERCENT_MODES.map((m) => m.group)),
);
