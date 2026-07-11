import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProblemSlider } from '../components/ProblemSlider';
import { SettingNumberInput } from '../components/SettingNumberInput';
import { GenerateSettingsActions } from '../components/GenerateSettingsActions';
import { useRandomSettingsOnGenerate } from '../hooks/useRandomSettingsOnGenerate';
import { randomFractionSettings } from '../utils/randomSettings';
import {
  DEFAULT_FRACTION_SETTINGS,
  FRACTION_MODES,
  fractionModeSupportsOperationsCount,
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
  const {
    useRandomSettings,
    setUseRandomSettings,
    applyRandomSettings,
    resolveSettingsForGenerate,
  } = useRandomSettingsOnGenerate(settings, setSettings, randomFractionSettings);

  const updateSetting = <K extends keyof FractionSettings>(
    key: K,
    value: FractionSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setGenerateError(null);
    const activeSettings = resolveSettingsForGenerate();

    const { generateFractionProblems } = await import('../topics/fractions/generator');
    const problems = generateFractionProblems(activeSettings);

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
            <span className="setting-field__label">
              Количество действий: <strong>{settings.operationsCount}</strong>
              {!fractionModeSupportsOperationsCount(settings.mode) && (
                <span className="setting-hint"> (недоступно для этого типа)</span>
              )}
            </span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={settings.operationsCount}
              disabled={!fractionModeSupportsOperationsCount(settings.mode)}
              onChange={(e) => updateSetting('operationsCount', Number(e.target.value))}
            />
          </label>

          <SettingNumberInput
            label="Количество примеров"
            value={settings.problemsCount}
            onChange={(value) => updateSetting('problemsCount', value)}
            min={1}
            max={30}
          />

          <SettingNumberInput
            label="Макс. знаменатель"
            value={settings.maxDenominator}
            onChange={(value) => updateSetting('maxDenominator', value)}
            min={2}
            max={50}
          />

          <SettingNumberInput
            label="Макс. числитель"
            value={settings.maxNumerator}
            onChange={(value) => updateSetting('maxNumerator', value)}
            min={1}
            max={50}
          />

          <SettingNumberInput
            label="Макс. целая часть"
            value={settings.maxWhole}
            onChange={(value) => updateSetting('maxWhole', value)}
            min={1}
            max={20}
          />

          <SettingNumberInput
            label="Знаков после запятой"
            value={settings.decimalPlaces}
            onChange={(value) => updateSetting('decimalPlaces', value)}
            min={1}
            max={4}
          />
        </div>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.allowNegative}
            onChange={(e) => updateSetting('allowNegative', e.target.checked)}
          />
          <span>Разрешить отрицательные числа</span>
        </label>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.allowNegativeAnswer}
            onChange={(e) => updateSetting('allowNegativeAnswer', e.target.checked)}
          />
          <span>Отрицательный ответ</span>
        </label>

        <p className="settings-panel__hint">
          Формат ответа: <code>3/4</code> или <code>2 3/4</code> (целое, пробел, числитель/знаменатель).
          Для сравнения: <code>&lt;</code>, <code>&gt;</code> или <code>=</code>.
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
          topic: { id: 'fractions', title: 'Дроби' },
          settings: { ...settings },
        }}
      />
    </div>
  );
}
