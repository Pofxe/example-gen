export interface LoadedWorksheetProblem {
  number: number;
  expression: string;
  answer?: string;
  answerHint?: string;
}

export interface LoadedWorksheet {
  title: string;
  dateLabel?: string;
  problemsCount: number;
  source: 'json' | 'markdown';
  exportedAt?: string;
  problems: LoadedWorksheetProblem[];
}
