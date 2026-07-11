import { useEffect, useState, type KeyboardEvent } from 'react';
import { FractionExpression } from './FractionExpression';
import { JsonExportPasswordDialog } from './JsonExportPasswordDialog';
import type { AnswerStatus, ProblemSession } from '../types';
import { exportProblemsAsJson, exportProblemsForStudent, type ExportTopicInfo } from '../utils/exportProblems';

interface ProblemSliderProps {
  session: ProblemSession;
  onAnswer: (problemId: string, value: string) => void;
  onNavigate: (index: number) => void;
  exportInfo?: {
    topic: ExportTopicInfo;
    settings: Record<string, unknown>;
  };
}

function canNavigateTo(
  problems: ProblemSession['problems'],
  answerStatuses: Record<string, AnswerStatus>,
  targetIndex: number,
): boolean {
  for (let i = 0; i < targetIndex; i++) {
    const status = answerStatuses[problems[i].id] ?? 'idle';
    if (status === 'idle') return false;
  }
  return true;
}

export function ProblemSlider({ session, onAnswer, onNavigate, exportInfo }: ProblemSliderProps) {
  const { problems, currentIndex, correctCount, userAnswers, answerStatuses } = session;
  const problem = problems[currentIndex];
  const [inputValue, setInputValue] = useState('');
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);

  useEffect(() => {
    if (!problem) {
      setInputValue('');
      return;
    }
    const saved = userAnswers[problem.id];
    const status = answerStatuses[problem.id] ?? 'idle';
    setInputValue(status !== 'idle' && saved !== undefined ? saved : '');
  }, [problem?.id, userAnswers, answerStatuses]);

  if (!problem) {
    return (
      <section className="problem-slider problem-slider--empty">
        <p>Нажмите «Сгенерировать», чтобы получить примеры.</p>
      </section>
    );
  }

  const status = answerStatuses[problem.id] ?? 'idle';
  const isCurrentAnswered = status !== 'idle';
  const canGoForward =
    isCurrentAnswered &&
    currentIndex < problems.length - 1 &&
    canNavigateTo(problems, answerStatuses, currentIndex + 1);

  const handleCheck = () => {
    if (!inputValue.trim() || status !== 'idle') return;
    onAnswer(problem.id, inputValue.trim());
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleCheck();
  };

  const tryNavigate = (index: number) => {
    if (!canNavigateTo(problems, answerStatuses, index)) return;
    onNavigate(index);
  };

  const handleExportJson = () => {
    if (!exportInfo || problems.length === 0) return;
    setJsonDialogOpen(true);
  };

  const confirmExportJson = () => {
    if (!exportInfo || problems.length === 0) return;
    exportProblemsAsJson(exportInfo.topic, exportInfo.settings, session);
  };

  const handleExportStudent = () => {
    if (!exportInfo || problems.length === 0) return;
    exportProblemsForStudent(exportInfo.topic, session);
  };

  return (
    <section className="problem-slider">
      <JsonExportPasswordDialog
        open={jsonDialogOpen}
        onClose={() => setJsonDialogOpen(false)}
        onSuccess={confirmExportJson}
      />
      <div className="problem-slider__header">
        <span className="problem-slider__counter">
          Задание {currentIndex + 1} из {problems.length}
        </span>
        <div className="problem-slider__header-actions">
          {exportInfo && (
            <div className="problem-slider__export-group">
              <button
                type="button"
                className="btn btn--ghost btn--export"
                onClick={handleExportStudent}
                title="Лист заданий для ученика (Markdown, UTF-8, без ответов)"
              >
                Для ученика
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--export"
                onClick={handleExportJson}
                title="Полный экспорт с ответами и настройками (JSON, UTF-8)"
              >
                JSON
              </button>
            </div>
          )}
          <span className="problem-slider__score">
            Правильно: <strong>{correctCount}</strong>
          </span>
        </div>
      </div>

      <div className="problem-slider__body">
        <div className="problem-slider__expression">
          <FractionExpression parts={problem.parts ?? [{ kind: 'text', text: '?' }]} />
        </div>

        <div className="problem-slider__input-row">
          <input
            type="text"
            inputMode="text"
            className={`problem-slider__input problem-slider__input--${status}`}
            value={inputValue}
            onChange={(e) => {
              if (status === 'idle') setInputValue(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder={problem.inputPlaceholder ?? 'Ваш ответ'}
            disabled={status !== 'idle'}
            aria-label="Ответ"
          />
          {status === 'idle' && (
            <button type="button" className="btn btn--primary" onClick={handleCheck}>
              Проверить
            </button>
          )}
        </div>

        {status === 'correct' && (
          <p className="problem-slider__feedback problem-slider__feedback--correct">
            ✓ Верно!
          </p>
        )}
        {status === 'incorrect' && (
          <p className="problem-slider__feedback problem-slider__feedback--incorrect">
            ✗ Неверно. Правильный ответ: {problem.answerDisplay}
          </p>
        )}
      </div>

      <div className="problem-slider__nav">
        <button
          type="button"
          className="btn btn--ghost"
          disabled={currentIndex === 0}
          onClick={() => tryNavigate(currentIndex - 1)}
        >
          ← Назад
        </button>

        <div className="problem-slider__dots">
          {problems.map((p, i) => {
            const reachable = canNavigateTo(problems, answerStatuses, i);
            return (
              <button
                key={p.id}
                type="button"
                className={`problem-slider__dot ${
                  i === currentIndex ? 'problem-slider__dot--active' : ''
                } ${answerStatuses[p.id] === 'correct' ? 'problem-slider__dot--correct' : ''} ${
                  answerStatuses[p.id] === 'incorrect' ? 'problem-slider__dot--incorrect' : ''
                } ${!reachable ? 'problem-slider__dot--locked' : ''}`}
                disabled={!reachable}
                onClick={() => tryNavigate(i)}
                aria-label={`Задание ${i + 1}`}
              />
            );
          })}
        </div>

        <button
          type="button"
          className="btn btn--ghost"
          disabled={!canGoForward}
          onClick={() => tryNavigate(currentIndex + 1)}
          title={!isCurrentAnswered ? 'Сначала ответьте на текущий пример' : undefined}
        >
          Вперёд →
        </button>
      </div>
    </section>
  );
}
