import { useAppStore } from '../../app/store/AppStoreProvider';
import { Button } from '../../shared/ui/button/Button';
import { QrViewer } from '../../widgets/qr-viewer/QrViewer';

export function QrSessionPanel() {
  const { qrSession } = useAppStore();

  return (
    <div className="content-stack">
      <QrViewer session={qrSession} />
      <section className="app-panel helper-card">
        <div className="section-label">Session tips</div>
        <ul className="helper-list">
          <li>Refresh the QR code before you approach the checkpoint.</li>
          <li>Keep your profile synced for delegated entries and upgrades.</li>
          <li>Use settings to manage notifications and device trust.</li>
        </ul>
        <Button variant="ghost">Rotate code</Button>
      </section>
    </div>
  );
}
