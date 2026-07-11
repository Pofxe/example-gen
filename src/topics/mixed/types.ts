export type MixableTopicId =
  | 'arithmetic'
  | 'fractions'
  | 'percentages'
  | 'powers'
  | 'roots'
  | 'identities'
  | 'linear-equations'
  | 'quadratic-equations';

export type MixedDistribution = 'balanced' | 'random';
export type MixedDifficulty = 'easy' | 'standard';

export interface MixableTopicInfo {
  id: MixableTopicId;
  title: string;
  description: string;
}

export const MIXABLE_TOPICS: MixableTopicInfo[] = [
  {
    id: 'arithmetic',
    title: 'Арифметика',
    description: 'Сложение, вычитание, умножение, деление',
  },
  {
    id: 'fractions',
    title: 'Дроби',
    description: 'Обыкновенные и десятичные дроби',
  },
  {
    id: 'percentages',
    title: 'Проценты',
    description: 'Проценты и преобразования',
  },
  {
    id: 'powers',
    title: 'Степени',
    description: 'Вычисление и свойства степеней',
  },
  {
    id: 'roots',
    title: 'Корни',
    description: 'Квадратные и кубические корни',
  },
  {
    id: 'identities',
    title: 'Формулы сокращённого умножения',
    description: 'Квадраты, кубы, разложение',
  },
  {
    id: 'linear-equations',
    title: 'Линейные уравнения',
    description: 'Уравнения с одной переменной',
  },
  {
    id: 'quadratic-equations',
    title: 'Квадратные уравнения',
    description: 'Уравнения вида ax² + bx + c = 0',
  },
];

export interface MixedSettings {
  selectedTopics: MixableTopicId[];
  problemsCount: number;
  distribution: MixedDistribution;
  difficulty: MixedDifficulty;
  shuffleOrder: boolean;
  showTopicLabel: boolean;
}

export const DEFAULT_MIXED_SETTINGS: MixedSettings = {
  selectedTopics: ['arithmetic', 'fractions', 'percentages'],
  problemsCount: 15,
  distribution: 'balanced',
  difficulty: 'standard',
  shuffleOrder: true,
  showTopicLabel: true,
};

export function getMixableTopicTitle(id: MixableTopicId): string {
  return MIXABLE_TOPICS.find((topic) => topic.id === id)?.title ?? id;
}
