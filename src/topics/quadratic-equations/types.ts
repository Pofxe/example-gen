export type QuadraticEquationMode =
  | 'standard'
  | 'monic'
  | 'no-linear'
  | 'no-constant'
  | 'pure-square'
  | 'equations-all';

export interface QuadraticEquationSettings {
  mode: QuadraticEquationMode;
  minCoeff: number;
  maxCoeff: number;
  minRoot: number;
  maxRoot: number;
  problemsCount: number;
  allowNegativeCoeffs: boolean;
  allowNegativeRoots: boolean;
}

export const DEFAULT_QUADRATIC_EQUATION_SETTINGS: QuadraticEquationSettings = {
  mode: 'standard',
  minCoeff: 1,
  maxCoeff: 5,
  minRoot: -10,
  maxRoot: 10,
  problemsCount: 10,
  allowNegativeCoeffs: false,
  allowNegativeRoots: true,
};

export interface QuadraticEquationModeInfo {
  id: QuadraticEquationMode;
  label: string;
  group: string;
}

export const QUADRATIC_EQUATION_MODES: QuadraticEquationModeInfo[] = [
  { id: 'standard', label: 'ax² + bx + c = 0', group: 'Основные' },
  { id: 'monic', label: 'x² + bx + c = 0', group: 'Основные' },
  { id: 'no-linear', label: 'x² + c = 0', group: 'Неполные' },
  { id: 'no-constant', label: 'ax² + bx = 0', group: 'Неполные' },
  { id: 'pure-square', label: 'ax² = c', group: 'Неполные' },
  { id: 'equations-all', label: 'Все типы вместе', group: 'Основные' },
];

export const QUADRATIC_EQUATION_MODE_GROUPS = Array.from(
  new Set(QUADRATIC_EQUATION_MODES.map((m) => m.group)),
);

export interface QuadraticCoeffs {
  a: number;
  b: number;
  c: number;
  roots: [number, number];
}
