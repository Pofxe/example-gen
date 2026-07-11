import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProblemSlider } from '../components/ProblemSlider';
import { SettingNumberInput } from '../components/SettingNumberInput';
import { GenerateSettingsActions } from '../components/GenerateSettingsActions';
import { useRandomSettingsOnGenerate } from '../hooks/useRandomSettingsOnGenerate';
import { randomLinearEquationSettings } from '../utils/randomSettings';
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
  const {
    useRandomSettings,
    setUseRandomSettings,
    applyRandomSettings,
    resolveSettingsForGenerate,
  } = useRandomSettingsOnGenerate(settings, setSettings, randomLinearEquationSettings);

  const updateSetting = <K extends keyof LinearEquationSettings>(
    key: K,
    value: LinearEquationSettings[K],
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
    if (activeSettings.minConstant > activeSettings.maxConstant) {
      setGenerateError('Мин. число не может быть больше максимального');
      return;
    }

    const { generateLinearEquationProblems } = await import(
      '../topics/linear-equations/generator'
    );
    const problems = generateLinearEquationProblems(activeSettings);

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
          <SettingNumberInput
            label="Количество примеров"
            value={settings.problemsCount}
            onChange={(value) => updateSetting('problemsCount', value)}
            min={1}
            max={30}
          />

          <SettingNumberInput
            label="Мин. коэффициент при x"
            value={settings.minCoeff}
            onChange={(value) => updateSetting('minCoeff', value)}
            min={1}
            max={20}
          />

          <SettingNumberInput
            label="Макс. коэффициент при x"
            value={settings.maxCoeff}
            onChange={(value) => updateSetting('maxCoeff', value)}
            min={1}
            max={20}
          />

          <SettingNumberInput
            label="Мин. свободный член"
            value={settings.minConstant}
            onChange={(value) => updateSetting('minConstant', value)}
            min={0}
            max={100}
          />

          <SettingNumberInput
            label="Макс. свободный член"
            value={settings.maxConstant}
            onChange={(value) => updateSetting('maxConstant', value)}
            min={1}
            max={100}
          />
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
          topic: { id: 'linear-equations', title: 'Линейные уравнения' },
          settings: { ...settings },
        }}
      />
    </div>
  );
}
