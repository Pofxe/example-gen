import type { ExportedProblemsFile } from './exportProblems';
import type { LoadedWorksheet } from '../types/worksheet';

export class WorksheetParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorksheetParseError';
  }
}

function formatDateRu(isoOrText: string): string {
  const date = new Date(isoOrText);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  return isoOrText.trim();
}

export function parseJsonWorksheet(content: string): LoadedWorksheet {
  let data: ExportedProblemsFile;
  try {
    data = JSON.parse(content) as ExportedProblemsFile;
  } catch {
    throw new WorksheetParseError('Файл JSON повреждён или имеет неверный формат');
  }

  if (!data.topic?.title || !Array.isArray(data.problems) || data.problems.length === 0) {
    throw new WorksheetParseError('В JSON нет данных о заданиях');
  }

  return {
    title: data.topic.title,
    dateLabel: data.exportedAt ? formatDateRu(data.exportedAt) : undefined,
    problemsCount: data.problems.length,
    source: 'json',
    exportedAt: data.exportedAt,
    problems: data.problems.map((item) => ({
      number: item.number,
      expression: item.expression,
      answer: item.answer,
      answerHint: item.answerHint,
    })),
  };
}

export function parseMarkdownWorksheet(content: string): LoadedWorksheet {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1]?.trim();
  if (!title) {
    throw new WorksheetParseError('Не найден заголовок задания (# ...)');
  }

  const dateMatch = content.match(/\*\*Дата:\*\*\s*(.+?)(?:\s{2})?$/m);
  const countMatch = content.match(/\*\*Количество заданий:\*\*\s*(\d+)/);

  const problems: LoadedWorksheet['problems'] = [];
  const sections = content.split(/^##\s+Задание\s+(\d+)\s*$/m);

  for (let i = 1; i < sections.length; i += 2) {
    const number = Number(sections[i]);
    const body = sections[i + 1] ?? '';
    const expression = body
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith('**') && line !== '---');

    if (!expression) continue;

    problems.push({ number, expression });
  }

  if (problems.length === 0) {
    throw new WorksheetParseError('В файле не найдено ни одного задания');
  }

  return {
    title,
    dateLabel: dateMatch?.[1]?.trim(),
    problemsCount: countMatch ? Number(countMatch[1]) : problems.length,
    source: 'markdown',
    problems,
  };
}

export function parseWorksheetFile(content: string, filename: string): LoadedWorksheet {
  const lower = filename.toLowerCase();

  if (lower.endsWith('.json')) {
    return parseJsonWorksheet(content);
  }
  if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
    return parseMarkdownWorksheet(content);
  }

  const trimmed = content.trim();
  if (trimmed.startsWith('{')) {
    return parseJsonWorksheet(content);
  }
  if (trimmed.startsWith('#')) {
    return parseMarkdownWorksheet(content);
  }

  throw new WorksheetParseError('Поддерживаются файлы .json и .md');
}

export async function readWorksheetFile(file: File): Promise<LoadedWorksheet> {
  const content = await file.text();
  return parseWorksheetFile(content, file.name);
}
