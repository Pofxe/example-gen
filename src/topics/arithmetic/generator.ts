import type { Problem } from '../../types';
import type { ArithmeticOperation, ArithmeticSettings } from './types';
import { getOperandRange } from './types';
import {
  evaluateFlat,
  formatFlat,
  isDivisible,
  randomInt,
} from './evaluator';
import type { ArithmeticProblem, FlatPart } from './validator';
import { validateArithmeticProblem } from './validator';
import { fillUniqueProblems } from '../../utils/problemSignature';

const MAX_ATTEMPTS_PER_PROBLEM = 3000;
const BUILD_RETRIES = 80;

const OP_SYMBOLS: Record<ArithmeticOperation, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};

/** Максимальный операнд для умножения (трёхзначные) и деления (двухзначные) */
const MULTIPLY_MAX_OPERAND = 999;
const DIVIDE_MAX_OPERAND = 99;

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

/** Равномерное распределение операций: каждая разрешённая встречается примерно одинаково */
function pickBalancedOperations(
  count: number,
  allowed: ArithmeticOperation[],
): ArithmeticOperation[] {
  if (count === 0 || allowed.length === 0) return [];

  const base = Math.floor(count / allowed.length);
  const remainder = count % allowed.length;
  const extraOps = new Set(shuffle([...allowed]).slice(0, remainder));

  const operations: ArithmeticOperation[] = [];
  for (const op of allowed) {
    const copies = base + (extraOps.has(op) ? 1 : 0);
    for (let i = 0; i < copies; i++) {
      operations.push(op);
    }
  }

  return shuffle(operations);
}

function getOperandMaxForIndex(
  index: number,
  operations: ArithmeticOperation[],
  settings: ArithmeticSettings,
): number {
  const { min, max } = getOperandRange(settings);
  let operandMax = max;

  const leftOp = index > 0 ? operations[index - 1] : null;
  const rightOp = index < operations.length ? operations[index] : null;

  if (leftOp === '*' || rightOp === '*') {
    operandMax = Math.min(operandMax, MULTIPLY_MAX_OPERAND);
  }
  if (leftOp === '/' || rightOp === '/') {
    operandMax = Math.min(operandMax, DIVIDE_MAX_OPERAND);
  }

  return Math.max(min, operandMax);
}

function generateOperandsForOperations(
  operations: ArithmeticOperation[],
  settings: ArithmeticSettings,
): number[] {
  return Array.from({ length: operations.length + 1 }, (_, index) => {
    const { min } = getOperandRange(settings);
    const max = getOperandMaxForIndex(index, operations, settings);

    if (index > 0 && operations[index - 1] === '/') {
      return randomInt(Math.max(1, min), max);
    }

    return randomInt(min, max);
  });
}

function buildFlatPartWithOperations(
  operations: ArithmeticOperation[],
  settings: ArithmeticSettings,
): FlatPart {
  const numbers = generateOperandsForOperations(operations, settings);
  return { numbers, operations };
}

function buildFlatPart(operationsCount: number, settings: ArithmeticSettings): FlatPart {
  const operations = pickBalancedOperations(operationsCount, settings.allowedOperations);
  return buildFlatPartWithOperations(operations, settings);
}

function applyOp(a: number, op: ArithmeticOperation, b: number): number | null {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return isDivisible(a, b) ? a / b : null;
    default:
      return null;
  }
}

function buildFlatProblem(settings: ArithmeticSettings): ArithmeticProblem | null {
  const { numbers, operations } = buildFlatPart(settings.operationsCount, settings);
  const answer = evaluateFlat(numbers, operations);
  if (answer === null || !Number.isInteger(answer)) return null;
  return { kind: 'flat', numbers, operations, answer };
}

function buildGroupedProblem(settings: ArithmeticSettings): ArithmeticProblem | null {
  const allOperations = pickBalancedOperations(
    settings.operationsCount,
    settings.allowedOperations,
  );
  if (allOperations.length === 0) return null;

  const outerIndex = randomInt(0, allOperations.length - 1);
  const outerOp = allOperations[outerIndex];
  const innerOperations = allOperations.filter((_, index) => index !== outerIndex);

  const leftOpsCount = randomInt(0, innerOperations.length);
  const leftOperations = innerOperations.slice(0, leftOpsCount);
  const rightOperations = innerOperations.slice(leftOpsCount);

  const left = buildFlatPartWithOperations(leftOperations, settings);
  const right = buildFlatPartWithOperations(rightOperations, settings);

  const leftVal = evaluateFlat(left.numbers, left.operations);
  const rightVal = evaluateFlat(right.numbers, right.operations);
  if (leftVal === null || rightVal === null) return null;

  const answer = applyOp(leftVal, outerOp, rightVal);
  if (answer === null || !Number.isInteger(answer)) return null;

  return { kind: 'grouped', left, op: outerOp, right, answer };
}

function formatGrouped(problem: Extract<ArithmeticProblem, { kind: 'grouped' }>): string {
  const leftStr =
    problem.left.operations.length > 0
      ? `(${formatFlat(problem.left.numbers, problem.left.operations)})`
      : formatFlat(problem.left.numbers, problem.left.operations);

  const rightStr =
    problem.right.operations.length > 0
      ? `(${formatFlat(problem.right.numbers, problem.right.operations)})`
      : formatFlat(problem.right.numbers, problem.right.operations);

  return `${leftStr} ${OP_SYMBOLS[problem.op]} ${rightStr}`;
}

function tryBuild(settings: ArithmeticSettings): ArithmeticProblem | null {
  if (settings.useParentheses && settings.operationsCount >= 2) {
    return buildGroupedProblem(settings);
  }
  return buildFlatProblem(settings);
}

function toProblem(problem: ArithmeticProblem, id: string): Problem {
  const expression =
    problem.kind === 'flat'
      ? `${formatFlat(problem.numbers, problem.operations)} = ?`
      : `${formatGrouped(problem)} = ?`;

  const answerStr = String(problem.answer);

  return {
    id,
    parts: [{ kind: 'text', text: expression }],
    answer: answerStr,
    answerDisplay: answerStr,
    check: { kind: 'integer', value: problem.answer },
  };
}

let problemCounter = 0;

function generateOneArithmetic(settings: ArithmeticSettings): Problem | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_PROBLEM; attempt++) {
    for (let buildTry = 0; buildTry < BUILD_RETRIES; buildTry++) {
      const candidate = tryBuild(settings);
      if (!candidate) continue;
      if (!validateArithmeticProblem(candidate, settings).valid) continue;

      return toProblem(
        candidate,
        `arith-${++problemCounter}-${Date.now()}-${attempt}-${buildTry}`,
      );
    }
  }
  return null;
}

export function generateArithmeticProblems(settings: ArithmeticSettings): Problem[] {
  return fillUniqueProblems(settings.problemsCount, () => generateOneArithmetic(settings));
}
