import { useEffect, useState, type KeyboardEvent } from 'react';
import { FractionExpression } from './FractionExpression';
import type { AnswerStatus, ProblemSession } from '../types';

interface ProblemSliderProps {
  session: ProblemSession;
  onAnswer: (problemId: string, value: string) => void;
  onNavigate: (index: number) => void;
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

export function ProblemSlider({ session, onAnswer, onNavigate }: ProblemSliderProps) {
  const { problems, currentIndex, correctCount, userAnswers, answerStatuses } = session;
  const problem = problems[currentIndex];
  const [inputValue, setInputValue] = useState('');

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

  return (
    <section className="problem-slider">
      <div className="problem-slider__header">
        <span className="problem-slider__counter">
          Задание {currentIndex + 1} из {problems.length}
        </span>
        <span className="problem-slider__score">
          Правильно: <strong>{correctCount}</strong>
        </span>
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
