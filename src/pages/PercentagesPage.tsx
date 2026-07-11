import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProblemSlider } from '../components/ProblemSlider';
import { SettingNumberInput } from '../components/SettingNumberInput';
import { GenerateSettingsActions } from '../components/GenerateSettingsActions';
import { useRandomSettingsOnGenerate } from '../hooks/useRandomSettingsOnGenerate';
import { randomPercentSettings } from '../utils/randomSettings';
import {
  DEFAULT_PERCENT_SETTINGS,
  PERCENT_MODES,
  percentModeSupportsOperationsCount,
  type PercentMode,
  type PercentSettings,
} from '../topics/percentages/types';
import type { AnswerStatus, ProblemSession } from '../types';

const EMPTY_SESSION: ProblemSession = {
  problems: [],
  currentIndex: 0,
  correctCount: 0,
  userAnswers: {},
  answerStatuses: {},
};

export function PercentagesPage() {
  const [settings, setSettings] = useState<PercentSettings>(DEFAULT_PERCENT_SETTINGS);
  const [session, setSession] = useState<ProblemSession>(EMPTY_SESSION);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const {
    useRandomSettings,
    setUseRandomSettings,
    applyRandomSettings,
    resolveSettingsForGenerate,
  } = useRandomSettingsOnGenerate(settings, setSettings, randomPercentSettings);

  const updateSetting = <K extends keyof PercentSettings>(
    key: K,
    value: PercentSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setGenerateError(null);
    const activeSettings = resolveSettingsForGenerate();

    if (activeSettings.minPercent > activeSettings.maxPercent) {
      setGenerateError('Минимальный процент не может быть больше максимального');
      return;
    }
    if (activeSettings.minNumber > activeSettings.maxNumber) {
      setGenerateError('Минимум числа не может быть больше максимума');
      return;
    }

    const { generatePercentProblems } = await import('../topics/percentages/generator');
    const problems = generatePercentProblems(activeSettings);

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
    const { checkPercentProblemAnswer } = await import('../topics/percentages/checker');

    setSession((prev) => {
      const problem = prev.problems.find((p) => p.id === problemId);
      if (!problem || prev.answerStatuses[problemId]) return prev;

      const isCorrect = checkPercentProblemAnswer(problem, value);
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
        <h1>Проценты</h1>
        <p className="page-header__subtitle">
          Нахождение процентов, чисел и преобразования
        </p>
      </header>

      <section className="settings-panel">
        <h2 className="settings-panel__title">Настройки</h2>

        <label className="setting-field">
          <span className="setting-field__label">Тип задания</span>
          <select
            className="setting-select"
            value={settings.mode}
            onChange={(e) => updateSetting('mode', e.target.value as PercentMode)}
          >
            {PERCENT_MODES.map((m) => (
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
              {!percentModeSupportsOperationsCount(settings.mode) && (
                <span className="setting-hint"> (недоступно для этого типа)</span>
              )}
            </span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={settings.operationsCount}
              disabled={!percentModeSupportsOperationsCount(settings.mode)}
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
            label="Мин. процент (%)"
            value={settings.minPercent}
            onChange={(value) => updateSetting('minPercent', value)}
            min={1}
            max={200}
          />

          <SettingNumberInput
            label="Макс. процент (%)"
            value={settings.maxPercent}
            onChange={(value) => updateSetting('maxPercent', value)}
            min={1}
            max={200}
          />

          <SettingNumberInput
            label="Мин. число"
            value={settings.minNumber}
            onChange={(value) => updateSetting('minNumber', value)}
          />

          <SettingNumberInput
            label="Макс. число"
            value={settings.maxNumber}
            onChange={(value) => updateSetting('maxNumber', value)}
          />

          <SettingNumberInput
            label="Знаков после запятой"
            value={settings.decimalPlaces}
            onChange={(value) => updateSetting('decimalPlaces', value)}
            min={0}
            max={3}
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

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.allowDecimalPercent}
            onChange={(e) => updateSetting('allowDecimalPercent', e.target.checked)}
          />
          <span>Дробные проценты (например, 12,5%)</span>
        </label>

        <p className="settings-panel__hint">
          Для ответа в процентах вводите число без знака % (например, <code>25</code>).
          Для дроби — <code>1/4</code>.
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
          topic: { id: 'percentages', title: 'Проценты' },
          settings: { ...settings },
        }}
      />
    </div>
  );
}
