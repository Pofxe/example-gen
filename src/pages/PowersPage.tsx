import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProblemSlider } from '../components/ProblemSlider';
import { SettingNumberInput } from '../components/SettingNumberInput';
import { GenerateSettingsActions } from '../components/GenerateSettingsActions';
import { useRandomSettingsOnGenerate } from '../hooks/useRandomSettingsOnGenerate';
import { randomPowerSettings } from '../utils/randomSettings';
import {
  DEFAULT_POWER_SETTINGS,
  POWER_MODES,
  type PowerMode,
  type PowerSettings,
} from '../topics/powers/types';
import type { AnswerStatus, ProblemSession } from '../types';

const EMPTY_SESSION: ProblemSession = {
  problems: [],
  currentIndex: 0,
  correctCount: 0,
  userAnswers: {},
  answerStatuses: {},
};

export function PowersPage() {
  const [settings, setSettings] = useState<PowerSettings>(DEFAULT_POWER_SETTINGS);
  const [session, setSession] = useState<ProblemSession>(EMPTY_SESSION);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const {
    useRandomSettings,
    setUseRandomSettings,
    applyRandomSettings,
    resolveSettingsForGenerate,
  } = useRandomSettingsOnGenerate(settings, setSettings, randomPowerSettings);

  const updateSetting = <K extends keyof PowerSettings>(
    key: K,
    value: PowerSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setGenerateError(null);
    const activeSettings = resolveSettingsForGenerate();

    if (activeSettings.minBase > activeSettings.maxBase) {
      setGenerateError('Минимальное основание не может быть больше максимального');
      return;
    }
    if (activeSettings.minExponent > activeSettings.maxExponent) {
      setGenerateError('Минимальный показатель не может быть больше максимального');
      return;
    }

    const { generatePowerProblems } = await import('../topics/powers/generator');
    const problems = generatePowerProblems(activeSettings);

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
    const { checkPowerProblemAnswer } = await import('../topics/powers/checker');

    setSession((prev) => {
      const problem = prev.problems.find((p) => p.id === problemId);
      if (!problem || prev.answerStatuses[problemId]) return prev;

      const isCorrect = checkPowerProblemAnswer(problem, value);
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
        <h1>Степени</h1>
        <p className="page-header__subtitle">
          Возведение в степень и свойства степеней
        </p>
      </header>

      <section className="settings-panel">
        <h2 className="settings-panel__title">Настройки</h2>

        <label className="setting-field">
          <span className="setting-field__label">Тип задания</span>
          <select
            className="setting-select"
            value={settings.mode}
            onChange={(e) => updateSetting('mode', e.target.value as PowerMode)}
          >
            {POWER_MODES.map((m) => (
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
            label="Мин. основание"
            value={settings.minBase}
            onChange={(value) => updateSetting('minBase', value)}
            min={2}
            max={20}
          />

          <SettingNumberInput
            label="Макс. основание"
            value={settings.maxBase}
            onChange={(value) => updateSetting('maxBase', value)}
            min={2}
            max={20}
          />

          <SettingNumberInput
            label="Мин. показатель"
            value={settings.minExponent}
            onChange={(value) => updateSetting('minExponent', value)}
            min={1}
            max={10}
          />

          <SettingNumberInput
            label="Макс. показатель"
            value={settings.maxExponent}
            onChange={(value) => updateSetting('maxExponent', value)}
            min={1}
            max={10}
          />

          <SettingNumberInput
            label="Макс. результат"
            value={settings.maxResult}
            onChange={(value) => updateSetting('maxResult', value)}
            min={10}
            max={100000}
          />
        </div>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.allowNegativeBase}
            onChange={(e) => updateSetting('allowNegativeBase', e.target.checked)}
          />
          <span>Разрешить отрицательное основание</span>
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
          Для сравнения вводите <code>&lt;</code>, <code>&gt;</code> или <code>=</code>.
          В остальных заданиях — целое число (показатель, основание или значение степени).
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
          topic: { id: 'powers', title: 'Степени' },
          settings: { ...settings },
        }}
      />
    </div>
  );
}
