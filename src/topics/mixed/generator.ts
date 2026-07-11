import type { Problem } from '../../types';
import { generateArithmeticProblems } from '../arithmetic/generator';
import { generateFractionProblems } from '../fractions/generator';
import { generatePercentProblems } from '../percentages/generator';
import { generatePowerProblems } from '../powers/generator';
import { generateRootProblems } from '../roots/generator';
import { generateIdentityProblems } from '../identities/generator';
import { generateLinearEquationProblems } from '../linear-equations/generator';
import { generateQuadraticEquationProblems } from '../quadratic-equations/generator';
import { getTopicSettingsForMixed } from './presets';
import type { MixedSettings, MixableTopicId } from './types';
import { getMixableTopicTitle } from './types';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function buildTopicSlots(
  selectedTopics: MixableTopicId[],
  count: number,
  distribution: MixedSettings['distribution'],
): MixableTopicId[] {
  if (distribution === 'random') {
    return Array.from({ length: count }, () => selectedTopics[randomInt(0, selectedTopics.length - 1)]);
  }

  const base = Math.floor(count / selectedTopics.length);
  const remainder = count % selectedTopics.length;
  const slots: MixableTopicId[] = [];

  selectedTopics.forEach((topicId, index) => {
    const topicCount = base + (index < remainder ? 1 : 0);
    for (let i = 0; i < topicCount; i++) {
      slots.push(topicId);
    }
  });

  return slots;
}

function countByTopic(slots: MixableTopicId[]): Map<MixableTopicId, number> {
  const counts = new Map<MixableTopicId, number>();
  for (const topicId of slots) {
    counts.set(topicId, (counts.get(topicId) ?? 0) + 1);
  }
  return counts;
}

function generateForTopic(
  topicId: MixableTopicId,
  count: number,
  settings: MixedSettings,
): Problem[] {
  switch (topicId) {
    case 'arithmetic':
      return generateArithmeticProblems(
        getTopicSettingsForMixed('arithmetic', settings.difficulty, count),
      );
    case 'fractions':
      return generateFractionProblems(
        getTopicSettingsForMixed('fractions', settings.difficulty, count),
      );
    case 'percentages':
      return generatePercentProblems(
        getTopicSettingsForMixed('percentages', settings.difficulty, count),
      );
    case 'powers':
      return generatePowerProblems(
        getTopicSettingsForMixed('powers', settings.difficulty, count),
      );
    case 'roots':
      return generateRootProblems(
        getTopicSettingsForMixed('roots', settings.difficulty, count),
      );
    case 'identities':
      return generateIdentityProblems(
        getTopicSettingsForMixed('identities', settings.difficulty, count),
      );
    case 'linear-equations':
      return generateLinearEquationProblems(
        getTopicSettingsForMixed('linear-equations', settings.difficulty, count),
      );
    case 'quadratic-equations':
      return generateQuadraticEquationProblems(
        getTopicSettingsForMixed('quadratic-equations', settings.difficulty, count),
      );
  }
}

function tagProblem(
  problem: Problem,
  topicId: MixableTopicId,
  index: number,
  showTopicLabel: boolean,
): Problem {
  return {
    ...problem,
    id: `mixed-${index}-${problem.id}`,
    sourceTopicId: topicId,
    sourceTopicTitle: showTopicLabel ? getMixableTopicTitle(topicId) : undefined,
  };
}

export function generateMixedProblems(settings: MixedSettings): Problem[] {
  const selectedTopics = [...new Set(settings.selectedTopics)];
  if (selectedTopics.length === 0) return [];

  let slots = buildTopicSlots(selectedTopics, settings.problemsCount, settings.distribution);
  if (settings.shuffleOrder) {
    slots = shuffle(slots);
  }

  const counts = countByTopic(slots);
  const pools = new Map<MixableTopicId, Problem[]>();

  for (const [topicId, count] of counts) {
    pools.set(topicId, generateForTopic(topicId, count, settings));
  }

  const problems: Problem[] = [];

  slots.forEach((topicId, index) => {
    const pool = pools.get(topicId);
    const problem = pool?.shift();
    if (!problem) return;
    problems.push(tagProblem(problem, topicId, index, settings.showTopicLabel));
  });

  return problems;
}
