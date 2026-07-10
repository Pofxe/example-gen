export type PowerMode =
  | 'compute'
  | 'find-exponent'
  | 'find-base'
  | 'compare'
  | 'multiply-powers'
  | 'divide-powers'
  | 'power-of-power'
  | 'power-all';

export interface PowerSettings {
  mode: PowerMode;
  minBase: number;
  maxBase: number;
  minExponent: number;
  maxExponent: number;
  problemsCount: number;
  allowNegativeBase: boolean;
  allowNegativeAnswer: boolean;
  maxResult: number;
}

export const DEFAULT_POWER_SETTINGS: PowerSettings = {
  mode: 'compute',
  minBase: 2,
  maxBase: 9,
  minExponent: 2,
  maxExponent: 4,
  problemsCount: 10,
  allowNegativeBase: false,
  allowNegativeAnswer: false,
  maxResult: 1000,
};

export interface PowerModeInfo {
  id: PowerMode;
  label: string;
  group: string;
}

export const POWER_MODES: PowerModeInfo[] = [
  { id: 'compute', label: 'Вычислить степень', group: 'Основные' },
  { id: 'find-exponent', label: 'Найти показатель', group: 'Основные' },
  { id: 'find-base', label: 'Найти основание', group: 'Основные' },
  { id: 'compare', label: 'Сравнение степеней', group: 'Основные' },
  { id: 'multiply-powers', label: 'Произведение степеней', group: 'Свойства' },
  { id: 'divide-powers', label: 'Частное степеней', group: 'Свойства' },
  { id: 'power-of-power', label: 'Степень степени', group: 'Свойства' },
  { id: 'power-all', label: 'Все типы вместе', group: 'Основные' },
];

export const POWER_MODE_GROUPS = Array.from(
  new Set(POWER_MODES.map((m) => m.group)),
);
