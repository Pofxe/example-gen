import type { ArithmeticSettings } from './types';
import { getOperandRange } from './types';
import type { ArithmeticOperation } from './types';
import {
  applyOperation,
  collectFlatIntermediateResults,
  evaluateFlat,
} from './evaluator';

export interface FlatPart {
  numbers: number[];
  operations: ArithmeticOperation[];
}

export type ArithmeticProblem =
  | { kind: 'flat'; numbers: number[]; operations: ArithmeticOperation[]; answer: number }
  | { kind: 'grouped'; left: FlatPart; op: ArithmeticOperation; right: FlatPart; answer: number };

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

function validateOperands(
  numbers: number[],
  settings: ArithmeticSettings,
): ValidationResult {
  const { min, max } = getOperandRange(settings);

  for (const n of numbers) {
    if (!Number.isInteger(n)) {
      return { valid: false, reason: 'Числа должны быть целыми' };
    }
    if (n < min || n > max) {
      return { valid: false, reason: `Число ${n} вне диапазона [${min}; ${max}]` };
    }
    if (!settings.allowNegatives && n < 0) {
      return { valid: false, reason: 'Отрицательное число в операндах' };
    }
  }

  return { valid: true };
}

function validateIntermediates(
  steps: number[] | null,
  settings: ArithmeticSettings,
): ValidationResult {
  if (steps === null) {
    return { valid: false, reason: 'Деление на ноль или нецелый результат' };
  }

  if (!settings.allowNegatives) {
    for (const step of steps) {
      if (step < 0) {
        return { valid: false, reason: 'Промежуточный результат отрицательный' };
      }
    }
  }

  return { valid: true };
}

function validateFlatPart(
  part: FlatPart,
  settings: ArithmeticSettings,
): ValidationResult {
  for (const op of part.operations) {
    if (!settings.allowedOperations.includes(op)) {
      return { valid: false, reason: `Операция «${op}» не разрешена` };
    }
  }

  const operandsCheck = validateOperands(part.numbers, settings);
  if (!operandsCheck.valid) return operandsCheck;

  const intermediates = collectFlatIntermediateResults(part.numbers, part.operations);
  const interCheck = validateIntermediates(intermediates, settings);
  if (!interCheck.valid) return interCheck;

  const computed = evaluateFlat(part.numbers, part.operations);
  if (computed === null || !Number.isInteger(computed)) {
    return { valid: false, reason: 'Выражение нерешаемо' };
  }

  return { valid: true };
}

function countFlatOps(part: FlatPart): number {
  return part.operations.length;
}

export function validateArithmeticProblem(
  problem: ArithmeticProblem,
  settings: ArithmeticSettings,
): ValidationResult {
  if (settings.minValue > settings.maxValue) {
    return { valid: false, reason: 'Некорректный диапазон значений' };
  }

  if (problem.kind === 'flat') {
    const { numbers, operations, answer } = problem;

    if (operations.length !== settings.operationsCount) {
      return { valid: false, reason: 'Неверное количество действий' };
    }

    const partCheck = validateFlatPart({ numbers, operations }, settings);
    if (!partCheck.valid) return partCheck;

    const computed = evaluateFlat(numbers, operations);
    if (computed !== answer) {
      return { valid: false, reason: 'Ответ не совпадает с вычислением' };
    }

    return { valid: true };
  }

  if (problem.kind === 'grouped') {
    const { left, op, right, answer } = problem;
    const totalOps = countFlatOps(left) + countFlatOps(right) + 1;

    if (totalOps !== settings.operationsCount) {
      return { valid: false, reason: 'Неверное количество действий' };
    }

    if (!settings.allowedOperations.includes(op)) {
      return { valid: false, reason: `Операция «${op}» не разрешена` };
    }

    if (countFlatOps(left) === 0 && countFlatOps(right) === 0) {
      return { valid: false, reason: 'Пустые скобки' };
    }

    const leftCheck = validateFlatPart(left, settings);
    if (!leftCheck.valid) return leftCheck;

    const rightCheck = validateFlatPart(right, settings);
    if (!rightCheck.valid) return rightCheck;

    const leftVal = evaluateFlat(left.numbers, left.operations);
    const rightVal = evaluateFlat(right.numbers, right.operations);
    if (leftVal === null || rightVal === null) {
      return { valid: false, reason: 'Выражение нерешаемо' };
    }

    const combined = applyOperation(leftVal, op, rightVal);
    if (combined === null || !Number.isInteger(combined)) {
      return { valid: false, reason: 'Выражение нерешаемо' };
    }

    if (!settings.allowNegatives && combined < 0) {
      return { valid: false, reason: 'Промежуточный результат отрицательный' };
    }

    if (combined !== answer) {
      return { valid: false, reason: 'Ответ не совпадает с вычислением' };
    }

    if (!settings.useParentheses) {
      return { valid: false, reason: 'Скобки не разрешены' };
    }

    return { valid: true };
  }

  return { valid: false, reason: 'Неизвестный тип задачи' };
}
