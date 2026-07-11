import { Link } from 'react-router-dom';

export function LoadAssignmentCard() {
  return (
    <Link to="/load" className="load-card__link">
      <article className="load-card">
        <span className="load-card__icon" aria-hidden="true">
          📂
        </span>
        <div className="load-card__text">
          <h2 className="load-card__title">Загрузить задание</h2>
          <p className="load-card__description">
            Открыть скачанный файл с примерами (.md или .json)
          </p>
        </div>
      </article>
    </Link>
  );
}
