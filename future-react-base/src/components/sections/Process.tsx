import { processSteps } from '../../data/content';

export function Process() {
  return (
    <section id="about" className="container section-spacing">
      <div className="section-heading narrow">
        <span className="eyebrow">Next steps</span>
        <h2>How to turn this into your real product</h2>
      </div>

      <div className="process-list">
        {processSteps.map((step, index) => (
          <article key={step.title} className="process-card glass-panel">
            <div className="process-index">{index + 1}</div>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
