import type { QrSession } from '../../entities/qr/model';

interface QrViewerProps {
  session: QrSession | null;
}

export function QrViewer({ session }: QrViewerProps) {
  return (
    <section className="qr-card app-panel">
      <div className="section-label">Live QR session</div>
      <div className="qr-box" aria-label="QR code placeholder">
        <div className="qr-box__grid" />
      </div>
      <div className="qr-meta">
        <div>
          <span>Code</span>
          <strong>{session?.code ?? 'Generating...'}</strong>
        </div>
        <div>
          <span>Expires</span>
          <strong>{session?.expiresAt ?? '--:--'}</strong>
        </div>
        <div>
          <span>Checkpoint</span>
          <strong>{session?.location ?? 'Preparing access point'}</strong>
        </div>
      </div>
    </section>
  );
}
