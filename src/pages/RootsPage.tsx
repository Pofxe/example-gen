import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProblemSlider } from '../components/ProblemSlider';
import {
  DEFAULT_ROOT_SETTINGS,
  ROOT_MODES,
  type RootKindFilter,
  type RootMode,
  type RootSettings,
} from '../topics/roots/types';
import type { AnswerStatus, ProblemSession } from '../types';

const EMPTY_SESSION: ProblemSession = {
  problems: [],
  currentIndex: 0,
  correctCount: 0,
  userAnswers: {},
  answerStatuses: {},
};

export function RootsPage() {
  const [settings, setSettings] = useState<RootSettings>(DEFAULT_ROOT_SETTINGS);
  const [session, setSession] = useState<ProblemSession>(EMPTY_SESSION);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const updateSetting = <K extends keyof RootSettings>(
    key: K,
    value: RootSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setGenerateError(null);

    if (settings.minValue > settings.maxValue) {
      setGenerateError('Минимальное значение не может быть больше максимального');
      return;
    }

    const { generateRootProblems } = await import('../topics/roots/generator');
    const problems = generateRootProblems(settings);

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
    const { checkRootProblemAnswer } = await import('../topics/roots/checker');

    setSession((prev) => {
      const problem = prev.problems.find((p) => p.id === problemId);
      if (!problem || prev.answerStatuses[problemId]) return prev;

      const isCorrect = checkRootProblemAnswer(problem, value);
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
        <h1>Корни</h1>
        <p className="page-header__subtitle">
          Квадратные и кубические корни
        </p>
      </header>

      <section className="settings-panel">
        <h2 className="settings-panel__title">Настройки</h2>

        <label className="setting-field">
          <span className="setting-field__label">Тип задания</span>
          <select
            className="setting-select"
            value={settings.mode}
            onChange={(e) => updateSetting('mode', e.target.value as RootMode)}
          >
            {ROOT_MODES.map((m) => (
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
            <span className="setting-field__label">Мин. значение корня</span>
            <input
              type="number"
              min={1}
              max={30}
              value={settings.minValue}
              onChange={(e) =>
                updateSetting('minValue', Math.max(1, Math.min(30, Number(e.target.value))))
              }
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Макс. значение корня</span>
            <input
              type="number"
              min={1}
              max={30}
              value={settings.maxValue}
              onChange={(e) =>
                updateSetting('maxValue', Math.max(1, Math.min(30, Number(e.target.value))))
              }
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Вид корней</span>
            <select
              className="setting-select"
              value={settings.rootKind}
              onChange={(e) => updateSetting('rootKind', e.target.value as RootKindFilter)}
            >
              <option value="both">Квадратные и кубические</option>
              <option value="sqrt">Только квадратные</option>
              <option value="cbrt">Только кубические</option>
            </select>
          </label>
        </div>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.allowNegativeAnswer}
            onChange={(e) => updateSetting('allowNegativeAnswer', e.target.checked)}
          />
          <span>Отрицательный ответ</span>
        </label>

        <p className="settings-panel__hint">
          Примеры только с целыми корнями. Для сравнения вводите <code>&lt;</code>, <code>&gt;</code> или <code>=</code>.
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
