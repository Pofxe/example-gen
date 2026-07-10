import type { ArithmeticOperation } from './types';

export type ExprNode =
  | { kind: 'num'; value: number }
  | { kind: 'bin'; op: ArithmeticOperation; left: ExprNode; right: ExprNode; grouped?: boolean };

export function randomInt(min: number, max: number): number {
  if (min > max) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isDivisible(a: number, b: number): boolean {
  return b !== 0 && Number.isInteger(a / b);
}

export function applyOperation(a: number, op: ArithmeticOperation, b: number): number | null {
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      if (!isDivisible(a, b)) return null;
      return a / b;
    default:
      return null;
  }
}

/** Вычисление узла дерева (для выражений со скобками) */
export function evaluateNode(node: ExprNode): number | null {
  if (node.kind === 'num') return node.value;

  const left = evaluateNode(node.left);
  const right = evaluateNode(node.right);
  if (left === null || right === null) return null;

  return applyOperation(left, node.op, right);
}

/** Вычисление плоского выражения: × и ÷ раньше + и − */
export function evaluateFlat(
  numbers: number[],
  operations: ArithmeticOperation[],
): number | null {
  if (numbers.length === 0) return null;
  if (numbers.length !== operations.length + 1) return null;

  const values = [...numbers];
  const ops = [...operations];

  for (let i = ops.length - 1; i >= 0; i--) {
    if (ops[i] === '*' || ops[i] === '/') {
      const result = applyOperation(values[i], ops[i], values[i + 1]);
      if (result === null) return null;
      values.splice(i, 2, result);
      ops.splice(i, 1);
    }
  }

  let result = values[0];
  for (let i = 0; i < ops.length; i++) {
    const next = applyOperation(result, ops[i], values[i + 1]);
    if (next === null) return null;
    result = next;
  }

  return result;
}

/** Промежуточные результаты плоского выражения по правилам приоритета */
export function collectFlatIntermediateResults(
  numbers: number[],
  operations: ArithmeticOperation[],
): number[] | null {
  if (numbers.length === 0) return null;
  if (numbers.length !== operations.length + 1) return null;

  const steps: number[] = [...numbers];
  const values = [...numbers];
  const ops = [...operations];

  for (let i = ops.length - 1; i >= 0; i--) {
    if (ops[i] === '*' || ops[i] === '/') {
      const result = applyOperation(values[i], ops[i], values[i + 1]);
      if (result === null) return null;
      values.splice(i, 2, result);
      ops.splice(i, 1);
      steps.push(result);
    }
  }

  let result = values[0];
  for (let i = 0; i < ops.length; i++) {
    const next = applyOperation(result, ops[i], values[i + 1]);
    if (next === null) return null;
    result = next;
    steps.push(result);
  }

  return steps;
}

/** Промежуточные результаты дерева (для скобочных выражений) */
export function collectIntermediateResults(node: ExprNode): number[] | null {
  if (node.kind === 'num') return [node.value];

  const leftResults = collectIntermediateResults(node.left);
  if (leftResults === null) return null;

  const rightResults = collectIntermediateResults(node.right);
  if (rightResults === null) return null;

  const leftVal = leftResults[leftResults.length - 1];
  const rightVal = rightResults[rightResults.length - 1];
  const combined = applyOperation(leftVal, node.op, rightVal);
  if (combined === null) return null;

  return [...leftResults.slice(0, -1), ...rightResults, combined];
}

export function formatNumber(n: number): string {
  return n < 0 ? `(${n})` : String(n);
}

const OP_SYMBOLS: Record<ArithmeticOperation, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};

export function formatFlat(
  numbers: number[],
  operations: ArithmeticOperation[],
): string {
  let expression = formatNumber(numbers[0]);
  for (let i = 0; i < operations.length; i++) {
    expression += ` ${OP_SYMBOLS[operations[i]]} ${formatNumber(numbers[i + 1])}`;
  }
  return expression;
}

function formatNodeInner(node: ExprNode): string {
  if (node.kind === 'num') return formatNumber(node.value);

  const left = formatNodeInner(node.left);
  const right = formatNodeInner(node.right);
  const expr = `${left} ${OP_SYMBOLS[node.op]} ${right}`;

  return node.grouped ? `(${expr})` : expr;
}

export function formatExpression(node: ExprNode): string {
  return formatNodeInner(node);
}

export function countOperations(node: ExprNode): number {
  if (node.kind === 'num') return 0;
  return 1 + countOperations(node.left) + countOperations(node.right);
}

export function collectNumbers(node: ExprNode): number[] {
  if (node.kind === 'num') return [node.value];
  return [...collectNumbers(node.left), ...collectNumbers(node.right)];
}

export function collectOperations(node: ExprNode): ArithmeticOperation[] {
  if (node.kind === 'num') return [];
  return [node.op, ...collectOperations(node.left), ...collectOperations(node.right)];
}

export function parseUserAnswer(input: string): number | null {
  const normalized = input.trim().replace(/\s/g, '').replace(',', '.');
  if (!/^-?\d+$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isSafeInteger(value) ? value : null;
}

export function checkAnswer(userInput: string, correctAnswer: number): boolean {
  const parsed = parseUserAnswer(userInput);
  return parsed !== null && parsed === correctAnswer;
}
