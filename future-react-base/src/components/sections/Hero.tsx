import { Button } from '../ui/Button';
import { stats } from '../../data/content';

export function Hero() {
  return (
    <section id="hero" className="container hero-section">
      <div className="hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">React + TypeScript starter</span>
          <h1>
            A clean frontend base
            <br />
            for your future product.
          </h1>
          <p className="hero-description">
            This template gives you a polished landing structure, reusable components, and a flexible
            layout so you can focus on branding, content, and product logic later.
          </p>

          <div className="hero-actions">
            <Button>Open project</Button>
            <Button variant="secondary">Customize sections</Button>
          </div>

          <div className="hero-stats">
            {stats.map((item) => (
              <div key={item.label} className="stat-card glass-panel">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual glass-panel">
          <div className="visual-badge">Starter Preview</div>
          <div className="visual-window">
            <div className="visual-topbar">
              <span />
              <span />
              <span />
            </div>
            <div className="visual-content">
              <div className="mini-chart" />
              <div className="mini-card-grid">
                <div className="mini-card" />
                <div className="mini-card" />
                <div className="mini-card wide" />
              </div>
            </div>
          </div>
          <div className="visual-note">
            Use this area later for dashboard previews, product screenshots, promo graphics, or feature demos.
          </div>
        </div>
      </div>
    </section>
  );
}
