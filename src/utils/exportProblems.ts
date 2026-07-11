import type { AnswerStatus, ExprPart, Problem, ProblemSession } from '../types';

export const EXPORT_FORMAT_VERSION = 1;

export interface ExportTopicInfo {
  id: string;
  title: string;
}

export interface ExportedProblemItem {
  number: number;
  expression: string;
  answer: string;
  answerHint?: string;
}

export interface ExportedSessionAnswer {
  number: number;
  userAnswer?: string;
  status?: Exclude<AnswerStatus, 'idle'>;
}

export interface ExportedProblemsFile {
  formatVersion: typeof EXPORT_FORMAT_VERSION;
  encoding: 'UTF-8';
  exportedAt: string;
  topic: ExportTopicInfo;
  settings: Record<string, unknown>;
  problems: ExportedProblemItem[];
  session?: {
    correctCount: number;
    answers: ExportedSessionAnswer[];
  };
}

function formatFraction(num: number, den: number, whole?: number): string {
  if (whole !== undefined && whole !== 0) {
    const sign = whole < 0 || num < 0 ? '−' : '';
    return `${sign}${Math.abs(whole)} ${Math.abs(num)}/${den}`;
  }
  return `${num}/${den}`;
}

function formatPower(base?: number, exponent?: number, unknown?: 'base' | 'exponent'): string {
  const baseText = unknown === 'base' ? '?' : base !== undefined ? String(base) : '?';
  const expText = unknown === 'exponent' ? '?' : exponent !== undefined ? String(exponent) : '?';
  return `${baseText}^${expText}`;
}

function formatRoot(
  index: 2 | 3,
  radicand?: number,
  unknown?: 'radicand',
  inner?: { index: 2 | 3; radicand: number },
  power?: { base: number; exponent: number },
): string {
  const symbol = index === 2 ? '√' : '∛';

  if (power) {
    return `${symbol}(${formatPower(power.base, power.exponent)})`;
  }
  if (inner) {
    return `${symbol}${symbol}${inner.radicand}`;
  }
  if (unknown === 'radicand') {
    return `${symbol}?`;
  }
  return `${symbol}${radicand ?? '?'}`;
}

/** Текстовое представление выражения для экспорта (UTF-8) */
export function partsToPlainText(parts: ExprPart[]): string {
  return parts
    .map((part) => {
      switch (part.kind) {
        case 'text':
          return part.text;
        case 'decimal':
          return part.value;
        case 'frac':
          return formatFraction(part.num, part.den, part.whole);
        case 'power':
          return formatPower(part.base, part.exponent, part.unknown);
        case 'group-power':
          return `(${formatPower(part.base, part.innerExponent)})${part.unknown === 'exponent' ? '^?' : `^${part.outerExponent}`}`;
        case 'root':
          return formatRoot(part.index, part.radicand, part.unknown, part.inner, part.power);
        case 'group-root-power':
          return `(${formatRoot(part.index, part.radicand)})^${part.exponent}`;
        default:
          return '';
      }
    })
    .join('');
}

export function buildExportedProblemsFile(
  topic: ExportTopicInfo,
  settings: Record<string, unknown>,
  session: ProblemSession,
): ExportedProblemsFile {
  const problems: ExportedProblemItem[] = session.problems.map((problem, index) =>
    problemToExportItem(problem, index + 1),
  );

  const answered: ExportedSessionAnswer[] = session.problems.flatMap((problem, index) => {
    const status = session.answerStatuses[problem.id];
    if (!status || status === 'idle') return [];
    return [{
      number: index + 1,
      userAnswer: session.userAnswers[problem.id],
      status,
    }];
  });

  const file: ExportedProblemsFile = {
    formatVersion: EXPORT_FORMAT_VERSION,
    encoding: 'UTF-8',
    exportedAt: new Date().toISOString(),
    topic,
    settings,
    problems,
  };

  if (answered.length > 0) {
    file.session = {
      correctCount: session.correctCount,
      answers: answered,
    };
  }

  return file;
}

function problemToExportItem(problem: Problem, number: number): ExportedProblemItem {
  const item: ExportedProblemItem = {
    number,
    expression: partsToPlainText(problem.parts),
    answer: problem.answerDisplay,
  };

  if (problem.inputPlaceholder) {
    item.answerHint = problem.inputPlaceholder;
  }

  return item;
}

function formatExportDate(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
}

function formatExportDateRu(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function downloadUtf8File(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export function exportProblemsAsJson(
  topic: ExportTopicInfo,
  settings: Record<string, unknown>,
  session: ProblemSession,
): void {
  if (session.problems.length === 0) return;

  const payload = buildExportedProblemsFile(topic, settings, session);
  const json = JSON.stringify(payload, null, 2);
  downloadUtf8File(json, `${topic.id}-${formatExportDate()}.json`, 'application/json');
}

export function buildStudentWorksheetMarkdown(
  topic: ExportTopicInfo,
  session: ProblemSession,
): string {
  const exportedAt = new Date().toISOString();
  const lines: string[] = [
    `# ${topic.title}`,
    '',
    `**Дата:** ${formatExportDateRu(exportedAt)}  `,
    `**Количество заданий:** ${session.problems.length}`,
    '',
    '---',
    '',
  ];

  session.problems.forEach((problem, index) => {
    const expression = partsToPlainText(problem.parts);
    lines.push(`## Задание ${index + 1}`);
    lines.push('');
    if (problem.sourceTopicTitle) {
      lines.push(`*Тема: ${problem.sourceTopicTitle}*`);
      lines.push('');
    }
    lines.push(expression);
    lines.push('');
    lines.push('**Ответ:** _________________________________');
    lines.push('');
  });

  return lines.join('\n');
}

export function exportProblemsForStudent(
  topic: ExportTopicInfo,
  session: ProblemSession,
): void {
  if (session.problems.length === 0) return;

  const markdown = buildStudentWorksheetMarkdown(topic, session);
  downloadUtf8File(
    markdown,
    `${topic.id}-student-${formatExportDate()}.md`,
    'text/markdown',
  );
}
