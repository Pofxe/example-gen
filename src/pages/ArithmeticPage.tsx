import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProblemSlider } from '../components/ProblemSlider';
import { generateArithmeticProblems } from '../topics/arithmetic/generator';
import { checkAnswer } from '../topics/arithmetic/evaluator';
import {
  DEFAULT_ARITHMETIC_SETTINGS,
  type ArithmeticOperation,
  type ArithmeticSettings,
} from '../topics/arithmetic/types';
import type { AnswerStatus, ProblemSession } from '../types';

const OPERATION_LABELS: Record<ArithmeticOperation, string> = {
  '+': 'Сложение (+)',
  '-': 'Вычитание (−)',
  '*': 'Умножение (×)',
  '/': 'Деление (÷)',
};

const EMPTY_SESSION: ProblemSession = {
  problems: [],
  currentIndex: 0,
  correctCount: 0,
  userAnswers: {},
  answerStatuses: {},
};

export function ArithmeticPage() {
  const [settings, setSettings] = useState<ArithmeticSettings>(DEFAULT_ARITHMETIC_SETTINGS);
  const [session, setSession] = useState<ProblemSession>(EMPTY_SESSION);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const updateSetting = <K extends keyof ArithmeticSettings>(
    key: K,
    value: ArithmeticSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleAllowNegativesChange = (checked: boolean) => {
    setSettings((prev) => {
      const max = Math.max(prev.minValue, prev.maxValue);
      return {
        ...prev,
        allowNegatives: checked,
        minValue: checked ? -max : Math.max(1, prev.minValue),
      };
    });
  };

  const toggleOperation = (op: ArithmeticOperation) => {
    setSettings((prev) => {
      const has = prev.allowedOperations.includes(op);
      const next = has
        ? prev.allowedOperations.filter((o) => o !== op)
        : [...prev.allowedOperations, op];
      if (next.length === 0) return prev;
      return { ...prev, allowedOperations: next };
    });
  };

  const handleGenerate = () => {
    setGenerateError(null);

    if (settings.minValue > settings.maxValue) {
      setGenerateError('Минимум не может быть больше максимума');
      return;
    }
    if (settings.allowedOperations.length === 0) {
      setGenerateError('Выберите хотя бы одну операцию');
      return;
    }

    const problems = generateArithmeticProblems(settings);
    if (problems.length === 0) {
      setGenerateError(
        'Не удалось сгенерировать примеры с текущими настройками. Попробуйте изменить параметры.',
      );
      return;
    }

    setSession({
      problems,
      currentIndex: 0,
      correctCount: 0,
      userAnswers: {},
      answerStatuses: {},
    });
  };

  const handleAnswer = useCallback((problemId: string, value: string) => {
    setSession((prev) => {
      const problem = prev.problems.find((p) => p.id === problemId);
      if (!problem || prev.answerStatuses[problemId]) return prev;

      const isCorrect =
        problem.check?.kind === 'integer'
          ? checkAnswer(value, problem.check.value)
          : checkAnswer(value, Number(problem.answer));
      const status: AnswerStatus = isCorrect ? 'correct' : 'incorrect';

      return {
        ...prev,
        correctCount: prev.correctCount + (isCorrect ? 1 : 0),
        userAnswers: { ...prev.userAnswers, [problemId]: value },
        answerStatuses: { ...prev.answerStatuses, [problemId]: status },
      };
    });
  }, []);

  const handleNavigate = useCallback((index: number) => {
    setSession((prev) => ({ ...prev, currentIndex: index }));
  }, []);

  return (
    <div className="page topic-page">
      <Link to="/" className="back-link">
        ← На главную
      </Link>

      <header className="page-header">
        <h1>➕ Арифметика</h1>
        <p className="page-header__subtitle">
          Сложение, вычитание, умножение и деление
        </p>
      </header>

      <section className="settings-panel">
        <h2 className="settings-panel__title">Настройки</h2>

        <div className="settings-grid">
          <label className="setting-field">
            <span className="setting-field__label">
              Количество действий: <strong>{settings.operationsCount}</strong>
            </span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={settings.operationsCount}
              onChange={(e) => updateSetting('operationsCount', Number(e.target.value))}
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Количество примеров</span>
            <input
              type="number"
              min={1}
              max={30}
              value={settings.problemsCount}
              onChange={(e) =>
                updateSetting('problemsCount', Math.max(1, Math.min(30, Number(e.target.value))))
              }
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Минимальное значение</span>
            <input
              type="number"
              value={settings.minValue}
              disabled={!settings.allowNegatives}
              onChange={(e) => updateSetting('minValue', Number(e.target.value))}
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Максимальное значение</span>
            <input
              type="number"
              value={settings.maxValue}
              onChange={(e) => updateSetting('maxValue', Number(e.target.value))}
            />
          </label>
        </div>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.allowNegatives}
            onChange={(e) => handleAllowNegativesChange(e.target.checked)}
          />
          <span>Разрешить отрицательные числа</span>
        </label>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.useParentheses}
            disabled={settings.operationsCount < 2}
            onChange={(e) => updateSetting('useParentheses', e.target.checked)}
          />
          <span>
            Использовать скобки
            {settings.operationsCount < 2 && (
              <span className="setting-hint"> (нужно ≥ 2 действий)</span>
            )}
          </span>
        </label>

        <fieldset className="setting-operations">
          <legend>Операции</legend>
          <div className="setting-operations__list">
            {(Object.keys(OPERATION_LABELS) as ArithmeticOperation[]).map((op) => (
              <label key={op} className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={settings.allowedOperations.includes(op)}
                  onChange={() => toggleOperation(op)}
                />
                <span>{OPERATION_LABELS[op]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button type="button" className="btn btn--primary btn--generate" onClick={handleGenerate}>
          Сгенерировать
        </button>

        {generateError && <p className="settings-panel__error">{generateError}</p>}
      </section>

      <ProblemSlider
        session={session}
        onAnswer={handleAnswer}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
