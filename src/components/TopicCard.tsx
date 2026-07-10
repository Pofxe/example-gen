import { Link } from 'react-router-dom';
import type { TopicInfo } from '../types';

interface TopicCardProps {
  topic: TopicInfo;
}

export function TopicCard({ topic }: TopicCardProps) {
  const content = (
    <article className={`topic-card ${topic.available ? '' : 'topic-card--disabled'}`}>
      <span className="topic-card__icon" aria-hidden="true">
        {topic.icon}
      </span>
      <h2 className="topic-card__title">{topic.title}</h2>
      <p className="topic-card__description">{topic.description}</p>
      {!topic.available && <span className="topic-card__badge">Скоро</span>}
    </article>
  );

  if (topic.available) {
    return (
      <Link to={topic.path} className="topic-card__link">
        {content}
      </Link>
    );
  }

  return <div className="topic-card__wrapper">{content}</div>;
}
