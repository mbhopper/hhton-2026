import { useAppStore } from '../../app/store/AppStoreProvider';
import { PassCard } from '../../widgets/pass-card/PassCard';

export function PassSummary() {
  const { passes } = useAppStore();

  return (
    <section className="content-grid">
      <div className="content-stack">
        <div className="page-intro app-panel">
          <div className="section-label">Private dashboard</div>
          <h1>Your active passes</h1>
          <p>
            This screen demonstrates how pages stay thin while widgets and features own the
            reusable UI and domain blocks.
          </p>
        </div>
        <div className="pass-grid">
          {passes.map((item) => (
            <PassCard key={item.id} pass={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
