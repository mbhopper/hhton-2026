import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../app/store/AppStoreProvider';
import { routes } from '../../shared/config/routes';
import { Button } from '../../shared/ui/button/Button';

const navItems = [
  { to: routes.pass, label: 'Pass' },
  { to: routes.profile, label: 'Profile' },
  { to: routes.settings, label: 'Settings' },
];

export function Header() {
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);

  return (
    <header className="app-header app-panel">
      <NavLink className="brand-mark" to={routes.pass} aria-label="Go to pass dashboard">
        FP
      </NavLink>
      <nav className="header-nav" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) => `header-link${isActive ? ' header-link--active' : ''}`}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="header-user">
        <div>
          <p className="header-user__name">{user?.name ?? 'Guest'}</p>
          <p className="header-user__meta">{user?.membershipLevel ?? 'Base'} access</p>
        </div>
        <Button variant="secondary" onClick={() => void logout()}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
