import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Header } from '../../widgets/header/Header';
import { LoginPage } from '../../pages/auth/login/LoginPage';
import { RegisterPage } from '../../pages/auth/register/RegisterPage';
import { NotFoundPage } from '../../pages/not-found/NotFoundPage';
import { PassPage } from '../../pages/pass/PassPage';
import { ProfilePage } from '../../pages/profile/ProfilePage';
import { SettingsPage } from '../../pages/settings/SettingsPage';
import { useAppStore } from '../store/AppStoreProvider';
import { defaultPrivateRoute, routes } from '../../shared/config/routes';

const readHashRoute = () => {
  const value = window.location.hash.replace(/^#/, '');
  return value || defaultPrivateRoute;
};

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-layout">
      <section className="auth-side app-panel">
        <div className="section-label">Future React Base</div>
        <h2>App shell starter</h2>
        <p>
          Hash-based routing keeps the starter dependency-light while still separating public and
          private layouts.
        </p>
      </section>
      {children}
    </main>
  );
}

function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="private-layout">
      <div className="app-background app-background--left" aria-hidden="true" />
      <div className="app-background app-background--right" aria-hidden="true" />
      <div className="app-container">
        <Header />
        <main className="page-shell">{children}</main>
      </div>
    </div>
  );
}

export function AppRouter() {
  const [route, setRoute] = useState(readHashRoute);
  const { authStatus } = useAppStore();

  useEffect(() => {
    const handleHashChange = () => setRoute(readHashRoute());

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const screen = useMemo(() => {
    const isAuthenticated = authStatus === 'authenticated';
    const privatePages: Record<string, ReactNode> = {
      [routes.pass]: <PassPage />,
      [routes.profile]: <ProfilePage />,
      [routes.settings]: <SettingsPage />,
    };

    if (!isAuthenticated) {
      if (route === routes.register) {
        return <AuthLayout><RegisterPage /></AuthLayout>;
      }

      return <AuthLayout><LoginPage /></AuthLayout>;
    }

    if (route === routes.login || route === routes.register || route === '/') {
      window.location.hash = `#${defaultPrivateRoute}`;
      return null;
    }

    const privatePage = privatePages[route];

    if (privatePage) {
      return <PrivateLayout>{privatePage}</PrivateLayout>;
    }

    return (
      <PrivateLayout>
        <NotFoundPage />
      </PrivateLayout>
    );
  }, [authStatus, route]);

  return screen;
}
