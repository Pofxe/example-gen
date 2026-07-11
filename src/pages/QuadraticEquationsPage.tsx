import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProblemSlider } from '../components/ProblemSlider';
import {
  DEFAULT_QUADRATIC_EQUATION_SETTINGS,
  QUADRATIC_EQUATION_MODES,
  type QuadraticEquationMode,
  type QuadraticEquationSettings,
} from '../topics/quadratic-equations/types';
import type { AnswerStatus, ProblemSession } from '../types';

const EMPTY_SESSION: ProblemSession = {
  problems: [],
  currentIndex: 0,
  correctCount: 0,
  userAnswers: {},
  answerStatuses: {},
};

export function QuadraticEquationsPage() {
  const [settings, setSettings] = useState<QuadraticEquationSettings>(
    DEFAULT_QUADRATIC_EQUATION_SETTINGS,
  );
  const [session, setSession] = useState<ProblemSession>(EMPTY_SESSION);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const updateSetting = <K extends keyof QuadraticEquationSettings>(
    key: K,
    value: QuadraticEquationSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setGenerateError(null);

    if (settings.minCoeff > settings.maxCoeff) {
      setGenerateError('Мин. коэффициент не может быть больше максимального');
      return;
    }
    if (settings.minRoot > settings.maxRoot) {
      setGenerateError('Мин. корень не может быть больше максимального');
      return;
    }

    const { generateQuadraticEquationProblems } = await import(
      '../topics/quadratic-equations/generator'
    );
    const problems = generateQuadraticEquationProblems(settings);

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
    const { checkQuadraticEquationAnswer } = await import(
      '../topics/quadratic-equations/checker'
    );

    setSession((prev) => {
      const problem = prev.problems.find((p) => p.id === problemId);
      if (!problem || prev.answerStatuses[problemId]) return prev;

      const isCorrect = checkQuadraticEquationAnswer(problem, value);
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
        <h1>Квадратные уравнения</h1>
        <p className="page-header__subtitle">
          Уравнения вида ax² + bx + c = 0 и неполные квадратные
        </p>
      </header>

      <section className="settings-panel">
        <h2 className="settings-panel__title">Настройки</h2>

        <label className="setting-field">
          <span className="setting-field__label">Тип уравнения</span>
          <select
            className="setting-select"
            value={settings.mode}
            onChange={(e) => updateSetting('mode', e.target.value as QuadraticEquationMode)}
          >
            {QUADRATIC_EQUATION_MODES.map((m) => (
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
            <span className="setting-field__label">Мин. коэффициент при x²</span>
            <input
              type="number"
              min={1}
              max={10}
              value={settings.minCoeff}
              onChange={(e) =>
                updateSetting('minCoeff', Math.max(1, Math.min(10, Number(e.target.value))))
              }
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Макс. коэффициент при x²</span>
            <input
              type="number"
              min={1}
              max={10}
              value={settings.maxCoeff}
              onChange={(e) =>
                updateSetting('maxCoeff', Math.max(1, Math.min(10, Number(e.target.value))))
              }
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Мин. корень</span>
            <input
              type="number"
              min={-30}
              max={30}
              value={settings.minRoot}
              onChange={(e) =>
                updateSetting('minRoot', Math.max(-30, Math.min(30, Number(e.target.value))))
              }
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Макс. корень</span>
            <input
              type="number"
              min={-30}
              max={30}
              value={settings.maxRoot}
              onChange={(e) =>
                updateSetting('maxRoot', Math.max(-30, Math.min(30, Number(e.target.value))))
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
          <span>Разрешить отрицательный коэффициент при x²</span>
        </label>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.allowNegativeRoots}
            onChange={(e) => updateSetting('allowNegativeRoots', e.target.checked)}
          />
          <span>Разрешить отрицательные корни</span>
        </label>

        <p className="settings-panel__hint">
          Все уравнения имеют целые корни. Введите корни через запятую: <code>2, 5</code>.
          Если корень один — достаточно одного числа.
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
          topic: { id: 'quadratic-equations', title: 'Квадратные уравнения' },
          settings: { ...settings },
        }}
      />
    </div>
  );
}
