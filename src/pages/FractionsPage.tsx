import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProblemSlider } from '../components/ProblemSlider';
import {
  DEFAULT_FRACTION_SETTINGS,
  FRACTION_MODES,
  type FractionMode,
  type FractionSettings,
} from '../topics/fractions/types';
import type { AnswerStatus, ProblemSession } from '../types';

const EMPTY_SESSION: ProblemSession = {
  problems: [],
  currentIndex: 0,
  correctCount: 0,
  userAnswers: {},
  answerStatuses: {},
};

export function FractionsPage() {
  const [settings, setSettings] = useState<FractionSettings>(DEFAULT_FRACTION_SETTINGS);
  const [session, setSession] = useState<ProblemSession>(EMPTY_SESSION);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const updateSetting = <K extends keyof FractionSettings>(
    key: K,
    value: FractionSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setGenerateError(null);

    const { generateFractionProblems } = await import('../topics/fractions/generator');
    const problems = generateFractionProblems(settings);

    if (problems.length === 0) {
      setGenerateError(
        'Не удалось сгенерировать примеры. Попробуйте изменить настройки.',
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

  const handleAnswer = useCallback(async (problemId: string, value: string) => {
    const { checkFractionProblemAnswer } = await import('../topics/fractions/checker');

    setSession((prev) => {
      const problem = prev.problems.find((p) => p.id === problemId);
      if (!problem || prev.answerStatuses[problemId]) return prev;

      const isCorrect = checkFractionProblemAnswer(problem, value);
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
        <h1>Дроби</h1>
        <p className="page-header__subtitle">
          Обыкновенные и десятичные дроби, смешанные числа
        </p>
      </header>

      <section className="settings-panel">
        <h2 className="settings-panel__title">Настройки</h2>

        <label className="setting-field">
          <span className="setting-field__label">Тип задания</span>
          <select
            className="setting-select"
            value={settings.mode}
            onChange={(e) => updateSetting('mode', e.target.value as FractionMode)}
          >
            {FRACTION_MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.group} — {m.label}
              </option>
            ))}
          </select>
        </label>

        <div className="settings-grid">
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
            <span className="setting-field__label">Макс. знаменатель</span>
            <input
              type="number"
              min={2}
              max={50}
              value={settings.maxDenominator}
              onChange={(e) =>
                updateSetting('maxDenominator', Math.max(2, Math.min(50, Number(e.target.value))))
              }
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Макс. числитель</span>
            <input
              type="number"
              min={1}
              max={50}
              value={settings.maxNumerator}
              onChange={(e) =>
                updateSetting('maxNumerator', Math.max(1, Math.min(50, Number(e.target.value))))
              }
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Макс. целая часть</span>
            <input
              type="number"
              min={1}
              max={20}
              value={settings.maxWhole}
              onChange={(e) =>
                updateSetting('maxWhole', Math.max(1, Math.min(20, Number(e.target.value))))
              }
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Знаков после запятой</span>
            <input
              type="number"
              min={1}
              max={4}
              value={settings.decimalPlaces}
              onChange={(e) =>
                updateSetting('decimalPlaces', Math.max(1, Math.min(4, Number(e.target.value))))
              }
            />
          </label>
        </div>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.allowNegative}
            onChange={(e) => updateSetting('allowNegative', e.target.checked)}
          />
          <span>Разрешить отрицательные числа</span>
        </label>

        <p className="settings-panel__hint">
          Формат ответа: <code>3/4</code> или <code>2 3/4</code> (целое, пробел, числитель/знаменатель).
          Для сравнения: <code>&lt;</code>, <code>&gt;</code> или <code>=</code>.
        </p>

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
