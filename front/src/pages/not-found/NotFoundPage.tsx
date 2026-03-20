import { routes } from '../../shared/config/routes';

export function NotFoundPage() {
  return (
    <section className="not-found-card app-panel">
      <div className="section-label">404</div>
      <h1>Page not found</h1>
      <p>The requested route is outside the new app shell map.</p>
      <a className="inline-link" href={`#${routes.pass}`}>
        Return to dashboard
      </a>
    </section>
  );
}
