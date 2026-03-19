import { Button } from '../ui/Button';

export function CTA() {
  return (
    <section className="container cta-section">
      <div className="glass-panel cta-card">
        <div>
          <span className="eyebrow">Ready to continue</span>
          <h2>Now you can plug in your own product idea</h2>
          <p>
            Add branding, pages, backend integration, forms, auth, or dashboard widgets on top of this
            foundation.
          </p>
        </div>
        <div className="cta-actions">
          <Button>Use as base</Button>
          <Button variant="secondary">Edit content</Button>
        </div>
      </div>
    </section>
  );
}
