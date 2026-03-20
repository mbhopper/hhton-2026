import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../../pages/auth/login/LoginPage';
import { RegisterPage } from '../../pages/auth/register/RegisterPage';
import { NotFoundPage } from '../../pages/not-found/NotFoundPage';
import { PassPage } from '../../pages/pass/PassPage';
import { ProfilePage } from '../../pages/profile/ProfilePage';
import { SettingsPage } from '../../pages/settings/SettingsPage';
import { defaultAuthorizedRoute, defaultUnauthorizedRoute, routes } from '../../shared/config/routes';
import { Header } from '../../widgets/header/Header';
import { useAppStore } from '../store/AppStoreProvider';

function AuthLayout() {
  return (
    <main className="auth-layout">
      <section className="auth-side app-panel">
        <div className="section-label">Future React Base</div>
        <h2>App shell starter</h2>
        <p>
          React Router now drives public and private flows with dedicated guards,
          redirects and a responsive app layout.
        </p>
      </section>
      <Outlet />
    </main>
  );
}

function PrivateLayout() {
  return (
    <div className="private-layout">
      <div className="app-background app-background--left" aria-hidden="true" />
      <div className="app-background app-background--right" aria-hidden="true" />
      <div className="app-container private-layout__shell">
        <Header />
        <main className="page-shell">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AuthRestoringFallback() {
  return (
    <main className="auth-layout">
      <section className="auth-card app-panel">
        <div className="section-label">Session</div>
        <h1>Restoring access…</h1>
        <p>We are checking the stored digital pass session and loading local mock data.</p>
      </section>
    </main>
  );
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const authStatus = useAppStore((state) => state.authStatus);

  if (authStatus === 'restoring') {
    return <AuthRestoringFallback />;
  }

  if (authStatus === 'authenticated') {
    return <Navigate to={defaultAuthorizedRoute} replace />;
  }

  return <>{children}</>;
}

function ProtectedRoute() {
  const authStatus = useAppStore((state) => state.authStatus);

  if (authStatus === 'restoring') {
    return <AuthRestoringFallback />;
  }

  if (authStatus !== 'authenticated') {
    return <Navigate to={defaultUnauthorizedRoute} replace />;
  }

  return <PrivateLayout />;
}

function AppRoutes() {
  const authStatus = useAppStore((state) => state.authStatus);

  if (authStatus === 'restoring') {
    return <AuthRestoringFallback />;
  }

  return (
    <Routes>
      <Route
        path={routes.root}
        element={
          <Navigate
            to={authStatus === 'authenticated' ? defaultAuthorizedRoute : defaultUnauthorizedRoute}
            replace
          />
        }
      />
      <Route element={<AuthLayout />}>
        <Route
          path={routes.login}
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path={routes.register}
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
      </Route>
      <Route path={routes.app} element={<ProtectedRoute />}>
        <Route index element={<Navigate to={routes.pass} replace />} />
        <Route path={routes.passNested} element={<PassPage />} />
        <Route path={routes.profileNested} element={<ProfilePage />} />
        <Route path={routes.settingsNested} element={<SettingsPage />} />
      </Route>
      <Route path={routes.notFound} element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to={routes.notFound} replace />} />
    </Routes>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
