const GITHUB_URL = 'https://github.com/Pofxe';
const CREATED_YEAR = 2026;

export function AppFooter() {
  return (
    <footer className="app-footer">
      <p className="app-footer__text">
        © {CREATED_YEAR} · Автор:{' '}
        <a
          className="app-footer__link"
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Pofxe
        </a>
      </p>
    </footer>
  );
}
