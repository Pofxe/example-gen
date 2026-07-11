import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProblemSlider } from '../components/ProblemSlider';
import {
  DEFAULT_LINEAR_EQUATION_SETTINGS,
  LINEAR_EQUATION_MODES,
  type LinearEquationMode,
  type LinearEquationSettings,
} from '../topics/linear-equations/types';
import type { AnswerStatus, ProblemSession } from '../types';

const EMPTY_SESSION: ProblemSession = {
  problems: [],
  currentIndex: 0,
  correctCount: 0,
  userAnswers: {},
  answerStatuses: {},
};

export function LinearEquationsPage() {
  const [settings, setSettings] = useState<LinearEquationSettings>(
    DEFAULT_LINEAR_EQUATION_SETTINGS,
  );
  const [session, setSession] = useState<ProblemSession>(EMPTY_SESSION);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const updateSetting = <K extends keyof LinearEquationSettings>(
    key: K,
    value: LinearEquationSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setGenerateError(null);

    if (settings.minCoeff > settings.maxCoeff) {
      setGenerateError('Мин. коэффициент не может быть больше максимального');
      return;
    }
    if (settings.minConstant > settings.maxConstant) {
      setGenerateError('Мин. число не может быть больше максимального');
      return;
    }

    const { generateLinearEquationProblems } = await import(
      '../topics/linear-equations/generator'
    );
    const problems = generateLinearEquationProblems(settings);

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
    const { checkLinearEquationAnswer } = await import('../topics/linear-equations/checker');

    setSession((prev) => {
      const problem = prev.problems.find((p) => p.id === problemId);
      if (!problem || prev.answerStatuses[problemId]) return prev;

      const isCorrect = checkLinearEquationAnswer(problem, value);
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
        <h1>Линейные уравнения</h1>
        <p className="page-header__subtitle">
          Уравнения вида ax + b = c и с x в обеих частях
        </p>
      </header>

      <section className="settings-panel">
        <h2 className="settings-panel__title">Настройки</h2>

        <label className="setting-field">
          <span className="setting-field__label">Тип уравнения</span>
          <select
            className="setting-select"
            value={settings.mode}
            onChange={(e) => updateSetting('mode', e.target.value as LinearEquationMode)}
          >
            {LINEAR_EQUATION_MODES.map((m) => (
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
            <span className="setting-field__label">Мин. коэффициент при x</span>
            <input
              type="number"
              min={1}
              max={20}
              value={settings.minCoeff}
              onChange={(e) =>
                updateSetting('minCoeff', Math.max(1, Math.min(20, Number(e.target.value))))
              }
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Макс. коэффициент при x</span>
            <input
              type="number"
              min={1}
              max={20}
              value={settings.maxCoeff}
              onChange={(e) =>
                updateSetting('maxCoeff', Math.max(1, Math.min(20, Number(e.target.value))))
              }
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Мин. свободный член</span>
            <input
              type="number"
              min={0}
              max={100}
              value={settings.minConstant}
              onChange={(e) =>
                updateSetting('minConstant', Math.max(0, Math.min(100, Number(e.target.value))))
              }
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Макс. свободный член</span>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.maxConstant}
              onChange={(e) =>
                updateSetting('maxConstant', Math.max(1, Math.min(100, Number(e.target.value))))
              }
            />
          </label>
        </div>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.allowNegativeCoeffs}
            onChange={(e) => updateSetting('allowNegativeCoeffs', e.target.checked)}
          />
          <span>Разрешить отрицательные коэффициенты</span>
        </label>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.allowNegativeAnswer}
            onChange={(e) => updateSetting('allowNegativeAnswer', e.target.checked)}
          />
          <span>Отрицательный ответ (x)</span>
        </label>

        <p className="settings-panel__hint">
          Все уравнения имеют целое решение. В ответе введите значение <code>x</code>.
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
        exportInfo={{
          topic: { id: 'linear-equations', title: 'Линейные уравнения' },
          settings: { ...settings },
        }}
      />
    </div>
  );
}
