import { PassSummary } from '../../features/pass/PassSummary';
import { QrSessionPanel } from '../../features/qr-session/QrSessionPanel';

export function PassPage() {
  return (
    <div className="dashboard-grid">
      <PassSummary />
      <QrSessionPanel />
    </div>
  );
}
