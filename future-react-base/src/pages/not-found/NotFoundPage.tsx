import { Link } from 'react-router-dom';
import { useAppStore } from '../../app/store/AppStoreProvider';
import { defaultAuthorizedRoute, defaultUnauthorizedRoute } from '../../shared/config/routes';

export function NotFoundPage() {
  const { authStatus } = useAppStore();

  return (
    <section className="not-found-card app-panel not-found-layout">
      <div className="section-label">404</div>
      <h1>Page not found</h1>
      <p>The requested route is outside the new app shell map.</p>
      <Link
        className="inline-link"
        to={authStatus === 'authenticated' ? defaultAuthorizedRoute : defaultUnauthorizedRoute}
      >
        Return to a valid route
      </Link>
    </section>
  );
}
