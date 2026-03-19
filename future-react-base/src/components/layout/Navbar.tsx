import { navItems } from '../../data/content';
import { Button } from '../ui/Button';

export function Navbar() {
  return (
    <header className="container header-wrap">
      <nav className="navbar glass-panel">
        <a className="brand" href="#hero" aria-label="Go to home section">
          <span className="brand-mark">F</span>
          <span>FutureBase</span>
        </a>

        <div className="nav-links">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}>
              {item}
            </a>
          ))}
        </div>

        <Button variant="secondary">Start building</Button>
      </nav>
    </header>
  );
}
