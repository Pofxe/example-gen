export type AnswerStatus = 'idle' | 'correct' | 'incorrect';

/** Части выражения для отображения (дроби — через горизонтальную черту) */
export type ExprPart =
  | { kind: 'text'; text: string }
  | { kind: 'frac'; num: number; den: number; whole?: number }
  | { kind: 'decimal'; value: string };

export interface Problem {
  id: string;
  parts: ExprPart[];
  answer: string;
  answerDisplay: string;
  inputPlaceholder?: string;
  /** Данные для проверки (дроби, сравнение и т.д.) */
  check?: ProblemCheck;
}

export type ProblemCheck =
  | { kind: 'integer'; value: number }
  | { kind: 'frac'; value: { num: number; den: number } }
  | { kind: 'compare'; value: -1 | 0 | 1 }
  | { kind: 'decimal'; value: number; places: number }
  | { kind: 'percent'; value: number; places: number }
  | { kind: 'common-denom'; a: { num: number; den: number }; b: { num: number; den: number } };

export interface TopicInfo {
  id: string;
  title: string;
  description: string;
  icon: string;
  available: boolean;
  path: string;
}

export interface ProblemSession {
  problems: Problem[];
  currentIndex: number;
  correctCount: number;
  userAnswers: Record<string, string>;
  answerStatuses: Record<string, AnswerStatus>;
}
