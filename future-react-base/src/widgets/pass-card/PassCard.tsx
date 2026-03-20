import type { DigitalPass } from '../../entities/pass/model';
import { cn } from '../../shared/lib/cn';

interface PassCardProps {
  pass: DigitalPass;
}

export function PassCard({ pass }: PassCardProps) {
  return (
    <article className="pass-card app-panel">
      <div className="pass-card__head">
        <span className={cn('status-pill', `status-pill--${pass.status}`)}>{pass.status}</span>
        <span>{pass.zone}</span>
      </div>
      <div>
        <h3>{pass.title}</h3>
        <p>Valid until {pass.validUntil}</p>
      </div>
      <dl className="metric-list">
        <div>
          <dt>Sessions left</dt>
          <dd>{pass.sessionsLeft}</dd>
        </div>
        <div>
          <dt>Pass ID</dt>
          <dd>{pass.id}</dd>
        </div>
      </dl>
    </article>
  );
}
