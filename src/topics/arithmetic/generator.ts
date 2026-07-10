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

const MAX_ATTEMPTS_PER_PROBLEM = 3000;
const BUILD_RETRIES = 80;

const OP_SYMBOLS: Record<ArithmeticOperation, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};

function pickOperation(allowed: ArithmeticOperation[]): ArithmeticOperation {
  return allowed[randomInt(0, allowed.length - 1)];
}

function pickRandomOperations(
  count: number,
  allowed: ArithmeticOperation[],
): ArithmeticOperation[] {
  return Array.from({ length: count }, () => pickOperation(allowed));
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

function buildFlatPart(operationsCount: number, settings: ArithmeticSettings): FlatPart {
  const { min, max } = getOperandRange(settings);
  const operations = pickRandomOperations(operationsCount, settings.allowedOperations);
  const numbers = Array.from({ length: operationsCount + 1 }, () =>
    randomInt(min, max),
  );
  return { numbers, operations };
}

function buildFlatProblem(settings: ArithmeticSettings): ArithmeticProblem | null {
  const { numbers, operations } = buildFlatPart(settings.operationsCount, settings);
  const answer = evaluateFlat(numbers, operations);
  if (answer === null || !Number.isInteger(answer)) return null;
  return { kind: 'flat', numbers, operations, answer };
}

function buildGroupedProblem(settings: ArithmeticSettings): ArithmeticProblem | null {
  const innerOps = settings.operationsCount - 1;
  const leftOpsCount = randomInt(0, innerOps);
  const rightOpsCount = innerOps - leftOpsCount;

  if (leftOpsCount === 0 && rightOpsCount === 0) return null;

  const op = pickOperation(settings.allowedOperations);
  const left = buildFlatPart(leftOpsCount, settings);
  const right = buildFlatPart(rightOpsCount, settings);

  const leftVal = evaluateFlat(left.numbers, left.operations);
  const rightVal = evaluateFlat(right.numbers, right.operations);
  if (leftVal === null || rightVal === null) return null;

  const answer = applyOp(leftVal, op, rightVal);
  if (answer === null || !Number.isInteger(answer)) return null;

  return { kind: 'grouped', left, op, right, answer };
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

function generateSingleProblem(
  settings: ArithmeticSettings,
  index: number,
): Problem | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_PROBLEM; attempt++) {
    for (let buildTry = 0; buildTry < BUILD_RETRIES; buildTry++) {
      const candidate = tryBuild(settings);
      if (!candidate) continue;
      if (!validateArithmeticProblem(candidate, settings).valid) continue;

      return toProblem(
        candidate,
        `arith-${index}-${Date.now()}-${attempt}-${buildTry}`,
      );
    }
  }
  return null;
}

export function generateArithmeticProblems(settings: ArithmeticSettings): Problem[] {
  const problems: Problem[] = [];

  for (let i = 0; i < settings.problemsCount; i++) {
    const problem = generateSingleProblem(settings, i);
    if (problem) problems.push(problem);
  }

  return problems;
}
