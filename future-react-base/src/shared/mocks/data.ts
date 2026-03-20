import type { DigitalPass } from '../../entities/pass/model';
import { PASS_STATUSES } from '../../entities/pass/model';
import type { QrSession } from '../../entities/qr/model';
import { QR_SESSION_STATUSES } from '../../entities/qr/model';
import type { UserProfile } from '../../entities/user/model';
import { USER_STATUSES } from '../../entities/user/model';

export const mockUser: UserProfile = {
  id: 'user-01',
  name: 'Alex Future',
  email: 'alex@futurepass.app',
  city: 'San Francisco',
  membershipLevel: 'Priority',
  status: USER_STATUSES.ACTIVE,
};

export const mockPasses: DigitalPass[] = [
  {
    id: 'pass-2026',
    title: 'Future Pass 2026',
    zone: 'North Gate / Pavilion B',
    status: PASS_STATUSES.ACTIVE,
    validUntil: '2026-12-31',
    sessionsLeft: 14,
  },
  {
    id: 'after-dark',
    title: 'After Dark Add-on',
    zone: 'Night Stage',
    status: PASS_STATUSES.PENDING,
    validUntil: '2026-11-15',
    sessionsLeft: 2,
  },
];

export const mockQrSession: QrSession = {
  id: 'qr-session-1',
  code: 'FP-2026-ALX-77A1',
  expiresAt: '20:30 UTC',
  location: 'Checkpoint C',
  status: QR_SESSION_STATUSES.ACTIVE,
};
