export type IdentityMode =
  | 'square-sum-direct'
  | 'square-sum-expand'
  | 'square-sum-factor'
  | 'square-sum-from-expanded'
  | 'square-diff-direct'
  | 'square-diff-expand'
  | 'square-diff-factor'
  | 'square-diff-from-expanded'
  | 'diff-squares-direct'
  | 'diff-squares-factor'
  | 'diff-squares-from-expanded'
  | 'cube-sum-direct'
  | 'cube-sum-expand'
  | 'cube-sum-factor'
  | 'cube-sum-from-expanded'
  | 'cube-diff-direct'
  | 'cube-diff-expand'
  | 'cube-diff-factor'
  | 'cube-diff-from-expanded'
  | 'sum-cubes-direct'
  | 'sum-cubes-factor'
  | 'sum-cubes-from-expanded'
  | 'diff-cubes-direct'
  | 'diff-cubes-factor'
  | 'diff-cubes-from-expanded'
  | 'formulas-all';

export interface IdentitySettings {
  mode: IdentityMode;
  minValue: number;
  maxValue: number;
  problemsCount: number;
  allowNegativeAnswer: boolean;
}

export const DEFAULT_IDENTITY_SETTINGS: IdentitySettings = {
  mode: 'square-sum-direct',
  minValue: 2,
  maxValue: 12,
  problemsCount: 10,
  allowNegativeAnswer: false,
};

export interface IdentityModeInfo {
  id: IdentityMode;
  label: string;
  group: string;
}

export const IDENTITY_MODES: IdentityModeInfo[] = [
  { id: 'square-sum-direct', label: 'Квадрат суммы → значение', group: 'Квадрат суммы' },
  { id: 'square-sum-expand', label: 'Квадрат суммы → разложение', group: 'Квадрат суммы' },
  { id: 'square-sum-factor', label: 'Разложение → квадрат суммы', group: 'Квадрат суммы' },
  { id: 'square-sum-from-expanded', label: 'Разложение → значение', group: 'Квадрат суммы' },
  { id: 'square-diff-direct', label: 'Квадрат разности → значение', group: 'Квадрат разности' },
  { id: 'square-diff-expand', label: 'Квадрат разности → разложение', group: 'Квадрат разности' },
  { id: 'square-diff-factor', label: 'Разложение → квадрат разности', group: 'Квадрат разности' },
  { id: 'square-diff-from-expanded', label: 'Разложение → значение', group: 'Квадрат разности' },
  { id: 'diff-squares-direct', label: 'Разность квадратов → значение', group: 'Разность квадратов' },
  { id: 'diff-squares-factor', label: 'Разность квадратов → свёрнутый вид', group: 'Разность квадратов' },
  { id: 'diff-squares-from-expanded', label: 'Свёрнутый вид → значение', group: 'Разность квадратов' },
  { id: 'cube-sum-direct', label: 'Куб суммы → значение', group: 'Куб суммы' },
  { id: 'cube-sum-expand', label: 'Куб суммы → разложение', group: 'Куб суммы' },
  { id: 'cube-sum-factor', label: 'Разложение → куб суммы', group: 'Куб суммы' },
  { id: 'cube-sum-from-expanded', label: 'Разложение → значение', group: 'Куб суммы' },
  { id: 'cube-diff-direct', label: 'Куб разности → значение', group: 'Куб разности' },
  { id: 'cube-diff-expand', label: 'Куб разности → разложение', group: 'Куб разности' },
  { id: 'cube-diff-factor', label: 'Разложение → куб разности', group: 'Куб разности' },
  { id: 'cube-diff-from-expanded', label: 'Разложение → значение', group: 'Куб разности' },
  { id: 'sum-cubes-direct', label: 'Сумма кубов → значение', group: 'Сумма кубов' },
  { id: 'sum-cubes-factor', label: 'Сумма кубов → свёрнутый вид', group: 'Сумма кубов' },
  { id: 'sum-cubes-from-expanded', label: 'Свёрнутый вид → значение', group: 'Сумма кубов' },
  { id: 'diff-cubes-direct', label: 'Разность кубов → значение', group: 'Разность кубов' },
  { id: 'diff-cubes-factor', label: 'Разность кубов → свёрнутый вид', group: 'Разность кубов' },
  { id: 'diff-cubes-from-expanded', label: 'Свёрнутый вид → значение', group: 'Разность кубов' },
  { id: 'formulas-all', label: 'Все типы вместе', group: 'Общее' },
];

export const IDENTITY_MODE_GROUPS = Array.from(
  new Set(IDENTITY_MODES.map((m) => m.group)),
);
