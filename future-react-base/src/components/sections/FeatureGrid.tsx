import { features } from '../../data/content';

export function FeatureGrid() {
  return (
    <section id="features" className="container section-spacing">
      <div className="section-heading">
        <span className="eyebrow">Core advantages</span>
        <h2>Structured from day one</h2>
        <p>
          The project is intentionally simple but not raw: it already has composition, visual hierarchy,
          and enough modularity to serve as a real foundation.
        </p>
      </div>

      <div className="feature-grid">
        {features.map((feature, index) => (
          <article key={feature.title} className="feature-card glass-panel">
            <span className="feature-number">0{index + 1}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
