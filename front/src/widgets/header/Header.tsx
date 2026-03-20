import { routes } from '../../shared/config/routes';
import { Button } from '../../shared/ui/button/Button';
import { useAppStore } from '../../app/store/AppStoreProvider';

const navItems = [
  { href: routes.pass, label: 'Pass' },
  { href: routes.profile, label: 'Profile' },
  { href: routes.settings, label: 'Settings' },
];

export function Header() {
  const { user, logout } = useAppStore();

  return (
    <header className="app-header app-panel">
      <div>
        <a className="brand-mark" href={`#${routes.pass}`}>
          FP
        </a>
      </div>
      <nav className="header-nav" aria-label="Primary">
        {navItems.map((item) => (
          <a key={item.href} className="header-link" href={`#${item.href}`}>
            {item.label}
          </a>
        ))}
      </nav>
      <div className="header-user">
        <div>
          <p className="header-user__name">{user?.name ?? 'Guest'}</p>
          <p className="header-user__meta">{user?.membershipLevel ?? 'Base'} access</p>
        </div>
        <Button variant="secondary" onClick={logout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
