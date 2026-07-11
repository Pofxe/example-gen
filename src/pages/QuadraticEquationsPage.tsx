import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProblemSlider } from '../components/ProblemSlider';
import { SettingNumberInput } from '../components/SettingNumberInput';
import { GenerateSettingsActions } from '../components/GenerateSettingsActions';
import { useRandomSettingsOnGenerate } from '../hooks/useRandomSettingsOnGenerate';
import { randomQuadraticEquationSettings } from '../utils/randomSettings';
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
  const {
    useRandomSettings,
    setUseRandomSettings,
    applyRandomSettings,
    resolveSettingsForGenerate,
  } = useRandomSettingsOnGenerate(settings, setSettings, randomQuadraticEquationSettings);

  const updateSetting = <K extends keyof QuadraticEquationSettings>(
    key: K,
    value: QuadraticEquationSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setGenerateError(null);
    const activeSettings = resolveSettingsForGenerate();

    if (activeSettings.minCoeff > activeSettings.maxCoeff) {
      setGenerateError('Мин. коэффициент не может быть больше максимального');
      return;
    }
    if (activeSettings.minRoot > activeSettings.maxRoot) {
      setGenerateError('Мин. корень не может быть больше максимального');
      return;
    }

    const { generateQuadraticEquationProblems } = await import(
      '../topics/quadratic-equations/generator'
    );
    const problems = generateQuadraticEquationProblems(activeSettings);

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
          <SettingNumberInput
            label="Количество примеров"
            value={settings.problemsCount}
            onChange={(value) => updateSetting('problemsCount', value)}
            min={1}
            max={30}
          />

          <SettingNumberInput
            label="Мин. коэффициент при x²"
            value={settings.minCoeff}
            onChange={(value) => updateSetting('minCoeff', value)}
            min={1}
            max={10}
          />

          <SettingNumberInput
            label="Макс. коэффициент при x²"
            value={settings.maxCoeff}
            onChange={(value) => updateSetting('maxCoeff', value)}
            min={1}
            max={10}
          />

          <SettingNumberInput
            label="Мин. корень"
            value={settings.minRoot}
            onChange={(value) => updateSetting('minRoot', value)}
            min={-30}
            max={30}
          />

          <SettingNumberInput
            label="Макс. корень"
            value={settings.maxRoot}
            onChange={(value) => updateSetting('maxRoot', value)}
            min={-30}
            max={30}
          />
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

        <GenerateSettingsActions
          useRandomSettings={useRandomSettings}
          onUseRandomSettingsChange={setUseRandomSettings}
          onApplyRandomSettings={applyRandomSettings}
          onGenerate={handleGenerate}
        />

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
