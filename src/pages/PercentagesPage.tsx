import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProblemSlider } from '../components/ProblemSlider';
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

  const updateSetting = <K extends keyof PercentSettings>(
    key: K,
    value: PercentSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setGenerateError(null);

    if (settings.minPercent > settings.maxPercent) {
      setGenerateError('Минимальный процент не может быть больше максимального');
      return;
    }
    if (settings.minNumber > settings.maxNumber) {
      setGenerateError('Минимум числа не может быть больше максимума');
      return;
    }

    const { generatePercentProblems } = await import('../topics/percentages/generator');
    const problems = generatePercentProblems(settings);

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
            <span className="setting-field__label">Мин. процент (%)</span>
            <input
              type="number"
              min={1}
              max={200}
              value={settings.minPercent}
              onChange={(e) =>
                updateSetting('minPercent', Math.max(1, Math.min(200, Number(e.target.value))))
              }
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Макс. процент (%)</span>
            <input
              type="number"
              min={1}
              max={200}
              value={settings.maxPercent}
              onChange={(e) =>
                updateSetting('maxPercent', Math.max(1, Math.min(200, Number(e.target.value))))
              }
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Мин. число</span>
            <input
              type="number"
              value={settings.minNumber}
              onChange={(e) => updateSetting('minNumber', Number(e.target.value))}
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Макс. число</span>
            <input
              type="number"
              value={settings.maxNumber}
              onChange={(e) =>
                updateSetting('maxNumber', Number(e.target.value))
              }
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Знаков после запятой</span>
            <input
              type="number"
              min={0}
              max={3}
              value={settings.decimalPlaces}
              onChange={(e) =>
                updateSetting('decimalPlaces', Math.max(0, Math.min(3, Number(e.target.value))))
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
          topic: { id: 'percentages', title: 'Проценты' },
          settings: { ...settings },
        }}
      />
    </div>
  );
}
