import { useState } from 'react';
import type { LoadedWorksheet } from '../types/worksheet';
import { WorksheetExpression } from './WorksheetExpression';

interface WorksheetViewProps {
  worksheet: LoadedWorksheet;
}

export function WorksheetView({ worksheet }: WorksheetViewProps) {
  const hasAnswers = worksheet.problems.some((p) => p.answer);
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <article className="worksheet">
      <header className="worksheet__header">
        <h2 className="worksheet__title">{worksheet.title}</h2>
        <div className="worksheet__meta">
          {worksheet.dateLabel && (
            <span className="worksheet__meta-item">{worksheet.dateLabel}</span>
          )}
          <span className="worksheet__meta-item">
            {worksheet.problemsCount}{' '}
            {pluralTasks(worksheet.problemsCount)}
          </span>
          <span className="worksheet__meta-item worksheet__meta-item--format">
            {worksheet.source === 'markdown' ? 'Лист для ученика' : 'JSON'}
          </span>
        </div>
        {hasAnswers && (
          <label className="worksheet__answers-toggle">
            <input
              type="checkbox"
              checked={showAnswers}
              onChange={(e) => setShowAnswers(e.target.checked)}
            />
            <span>Показать ключ ответов</span>
          </label>
        )}
      </header>

      <ol className="worksheet__list">
        {worksheet.problems.map((problem) => (
          <li key={problem.number} className="worksheet__item">
            <div className="worksheet__item-number">{problem.number}</div>
            <div className="worksheet__item-body">
              <div className="worksheet__expression">
                <WorksheetExpression text={problem.expression} />
              </div>
              {showAnswers && problem.answer ? (
                <div className="worksheet__answer-key">
                  <span className="worksheet__answer-label">Ответ:</span>
                  <span className="worksheet__answer-value">{problem.answer}</span>
                  {problem.answerHint && (
                    <span className="worksheet__answer-hint">({problem.answerHint})</span>
                  )}
                </div>
              ) : (
                <div className="worksheet__answer-line">
                  <span className="worksheet__answer-label">Ответ:</span>
                  <span className="worksheet__answer-blank" aria-hidden="true" />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

function pluralTasks(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'заданий';
  if (mod10 === 1) return 'задание';
  if (mod10 >= 2 && mod10 <= 4) return 'задания';
  return 'заданий';
}
