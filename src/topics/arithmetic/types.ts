export type ArithmeticOperation = '+' | '-' | '*' | '/';

export interface ArithmeticSettings {
  operationsCount: number;
  allowNegatives: boolean;
  minValue: number;
  maxValue: number;
  allowedOperations: ArithmeticOperation[];
  problemsCount: number;
  useParentheses: boolean;
}

export const DEFAULT_ARITHMETIC_SETTINGS: ArithmeticSettings = {
  operationsCount: 2,
  allowNegatives: false,
  minValue: 1,
  maxValue: 20,
  allowedOperations: ['+', '-', '*'],
  problemsCount: 10,
  useParentheses: false,
};

export function getOperandRange(settings: ArithmeticSettings): { min: number; max: number } {
  const lo = Math.min(settings.minValue, settings.maxValue);
  const hi = Math.max(settings.minValue, settings.maxValue);

  if (!settings.allowNegatives) {
    return { min: Math.max(1, lo), max: hi };
  }

  return { min: lo, max: hi };
}
