export function Showcase() {
  return (
    <section id="workflow" className="container section-spacing">
      <div className="showcase-grid">
        <article className="showcase-large glass-panel">
          <span className="eyebrow">Visual system</span>
          <h2>Built around a premium dark interface</h2>
          <p>
            The default style uses gradients, soft borders, glowing accents, rounded cards, and a minimal
            layout rhythm. It looks modern right away and remains easy to restyle.
          </p>
          <div className="showcase-tags">
            <span>Dark UI</span>
            <span>Glassmorphism</span>
            <span>Responsive</span>
            <span>Reusable</span>
          </div>
        </article>

        <article className="showcase-side glass-panel">
          <div className="showcase-side-top">
            <span className="status-dot" />
            <p>Editable content blocks</p>
          </div>
          <h3>Swap demo text without touching layout logic</h3>
          <p>
            Most visible placeholders live in a separate content file, so the first customization step is
            fast and predictable.
          </p>
        </article>
      </div>
    </section>
  );
}
