import { TOPICS } from '../topics/topics';
import { TopicCard } from '../components/TopicCard';

export function HomePage() {
  return (
    <div className="page home-page">
      <header className="page-header">
        <h1>Генератор заданий</h1>
        <p className="page-header__subtitle">
          Примеры и уравнения по школьным темам
        </p>
      </header>

      <div className="topics-grid">
        {TOPICS.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
}
