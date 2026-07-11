export type LinearEquationMode =
  | 'standard'
  | 'no-constant-left'
  | 'unit-coeff'
  | 'both-sides'
  | 'equations-all';

export interface LinearEquationSettings {
  mode: LinearEquationMode;
  minCoeff: number;
  maxCoeff: number;
  minConstant: number;
  maxConstant: number;
  problemsCount: number;
  allowNegativeCoeffs: boolean;
  allowNegativeAnswer: boolean;
}

export const DEFAULT_LINEAR_EQUATION_SETTINGS: LinearEquationSettings = {
  mode: 'standard',
  minCoeff: 2,
  maxCoeff: 9,
  minConstant: 1,
  maxConstant: 30,
  problemsCount: 10,
  allowNegativeCoeffs: false,
  allowNegativeAnswer: false,
};

export interface LinearEquationModeInfo {
  id: LinearEquationMode;
  label: string;
  group: string;
}

export const LINEAR_EQUATION_MODES: LinearEquationModeInfo[] = [
  { id: 'standard', label: 'ax + b = c', group: 'Основные' },
  { id: 'no-constant-left', label: 'ax = c', group: 'Основные' },
  { id: 'unit-coeff', label: 'x + b = c', group: 'Основные' },
  { id: 'both-sides', label: 'ax + b = cx + d', group: 'Основные' },
  { id: 'equations-all', label: 'Все типы вместе', group: 'Основные' },
];

export const LINEAR_EQUATION_MODE_GROUPS = Array.from(
  new Set(LINEAR_EQUATION_MODES.map((m) => m.group)),
);

export interface LinearEquationData {
  x: number;
  expression: string;
}
