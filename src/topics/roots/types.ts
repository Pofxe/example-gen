export type RootMode =
  | 'sqrt'
  | 'cbrt'
  | 'find-radicand'
  | 'compare'
  | 'root-of-power'
  | 'power-of-root'
  | 'nested'
  | 'roots-all';

export type RootKindFilter = 'sqrt' | 'cbrt' | 'both';

export interface RootSettings {
  mode: RootMode;
  minValue: number;
  maxValue: number;
  problemsCount: number;
  rootKind: RootKindFilter;
  allowNegativeAnswer: boolean;
}

export const DEFAULT_ROOT_SETTINGS: RootSettings = {
  mode: 'sqrt',
  minValue: 2,
  maxValue: 12,
  problemsCount: 10,
  rootKind: 'both',
  allowNegativeAnswer: false,
};

export interface RootModeInfo {
  id: RootMode;
  label: string;
  group: string;
}

export const ROOT_MODES: RootModeInfo[] = [
  { id: 'sqrt', label: 'Квадратный корень', group: 'Основные' },
  { id: 'cbrt', label: 'Кубический корень', group: 'Основные' },
  { id: 'find-radicand', label: 'Найти подкоренное выражение', group: 'Основные' },
  { id: 'compare', label: 'Сравнение корней', group: 'Основные' },
  { id: 'root-of-power', label: 'Корень из степени', group: 'Свойства' },
  { id: 'power-of-root', label: 'Степень корня', group: 'Свойства' },
  { id: 'nested', label: 'Корень из корня', group: 'Свойства' },
  { id: 'roots-all', label: 'Все типы вместе', group: 'Основные' },
];

export const ROOT_MODE_GROUPS = Array.from(
  new Set(ROOT_MODES.map((m) => m.group)),
);
