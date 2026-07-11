import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProblemSlider } from '../components/ProblemSlider';
import { checkMixedProblemAnswer } from '../topics/mixed/checker';
import { generateMixedProblems } from '../topics/mixed/generator';
import {
  DEFAULT_MIXED_SETTINGS,
  MIXABLE_TOPICS,
  type MixableTopicId,
  type MixedSettings,
} from '../topics/mixed/types';
import type { AnswerStatus, ProblemSession } from '../types';

const EMPTY_SESSION: ProblemSession = {
  problems: [],
  currentIndex: 0,
  correctCount: 0,
  userAnswers: {},
  answerStatuses: {},
};

export function MixedPage() {
  const [settings, setSettings] = useState<MixedSettings>(DEFAULT_MIXED_SETTINGS);
  const [session, setSession] = useState<ProblemSession>(EMPTY_SESSION);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const updateSetting = <K extends keyof MixedSettings>(key: K, value: MixedSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTopic = (topicId: MixableTopicId) => {
    setSettings((prev) => {
      const has = prev.selectedTopics.includes(topicId);
      const next = has
        ? prev.selectedTopics.filter((id) => id !== topicId)
        : [...prev.selectedTopics, topicId];
      if (next.length === 0) return prev;
      return { ...prev, selectedTopics: next };
    });
  };

  const handleGenerate = () => {
    setGenerateError(null);

    if (settings.selectedTopics.length === 0) {
      setGenerateError('Выберите хотя бы одну тему');
      return;
    }

    if (settings.problemsCount < 1) {
      setGenerateError('Количество примеров должно быть не меньше 1');
      return;
    }

    const problems = generateMixedProblems(settings);

    if (problems.length === 0) {
      setGenerateError(
        'Не удалось сгенерировать примеры. Попробуйте изменить набор тем или сложность.',
      );
      return;
    }

    setGenerateError(null);

    setSession({
      problems,
      currentIndex: 0,
      correctCount: 0,
      userAnswers: {},
      answerStatuses: {},
    });
  };

  const handleAnswer = useCallback((problemId: string, value: string) => {
    setSession((prev) => {
      const problem = prev.problems.find((p) => p.id === problemId);
      if (!problem || prev.answerStatuses[problemId]) return prev;

      const isCorrect = checkMixedProblemAnswer(problem, value);
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

  const perTopicCount =
    settings.distribution === 'balanced' && settings.selectedTopics.length > 0
      ? Math.floor(settings.problemsCount / settings.selectedTopics.length)
      : null;

  return (
    <div className="page topic-page">
      <Link to="/" className="back-link">
        ← На главную
      </Link>

      <header className="page-header">
        <h1>Обобщённые примеры</h1>
        <p className="page-header__subtitle">
          Смешанный набор заданий из выбранных тем
        </p>
      </header>

      <section className="settings-panel">
        <h2 className="settings-panel__title">Настройки</h2>

        <div className="settings-grid">
          <label className="setting-field">
            <span className="setting-field__label">Количество примеров</span>
            <input
              type="number"
              min={1}
              max={50}
              value={settings.problemsCount}
              onChange={(e) =>
                updateSetting('problemsCount', Math.max(1, Math.min(50, Number(e.target.value))))
              }
            />
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Распределение по темам</span>
            <select
              className="setting-select"
              value={settings.distribution}
              onChange={(e) =>
                updateSetting('distribution', e.target.value as MixedSettings['distribution'])
              }
            >
              <option value="balanced">Равномерно по темам</option>
              <option value="random">Случайно</option>
            </select>
          </label>

          <label className="setting-field">
            <span className="setting-field__label">Сложность</span>
            <select
              className="setting-select"
              value={settings.difficulty}
              onChange={(e) =>
                updateSetting('difficulty', e.target.value as MixedSettings['difficulty'])
              }
            >
              <option value="easy">Лёгкая</option>
              <option value="standard">Стандартная</option>
            </select>
          </label>
        </div>

        {perTopicCount !== null && settings.selectedTopics.length > 1 && (
          <p className="setting-hint">
            При равномерном распределении — примерно {perTopicCount}–
            {perTopicCount + 1} заданий на каждую выбранную тему.
          </p>
        )}

        {settings.difficulty === 'easy' && (
          <p className="setting-hint">
            Лёгкая сложность: простые типы заданий и меньшие числа в каждой теме.
          </p>
        )}

        {settings.difficulty === 'standard' && (
          <p className="setting-hint">
            Стандартная сложность: разные типы заданий внутри каждой выбранной темы.
          </p>
        )}

        <fieldset className="setting-operations">
          <legend>Темы в наборе</legend>
          <div className="setting-operations__list">
            {MIXABLE_TOPICS.map((topic) => (
              <label key={topic.id} className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={settings.selectedTopics.includes(topic.id)}
                  onChange={() => toggleTopic(topic.id)}
                />
                <span>{topic.title}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.shuffleOrder}
            onChange={(e) => updateSetting('shuffleOrder', e.target.checked)}
          />
          <span>Перемешать порядок заданий</span>
        </label>

        <label className="setting-checkbox">
          <input
            type="checkbox"
            checked={settings.showTopicLabel}
            onChange={(e) => updateSetting('showTopicLabel', e.target.checked)}
          />
          <span>Показывать тему у каждого примера</span>
        </label>

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
          topic: { id: 'mixed', title: 'Обобщённые примеры' },
          settings: { ...settings },
        }}
      />
    </div>
  );
}
