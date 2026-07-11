import { TOPICS } from '../topics/topics';
import { TopicCard } from '../components/TopicCard';
import { LoadAssignmentCard } from '../components/LoadAssignmentCard';

export function HomePage() {
  return (
    <div className="page home-page">
      <section className="home-page__load">
        <LoadAssignmentCard />
      </section>

      <div className="topics-grid">
        {TOPICS.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
}
