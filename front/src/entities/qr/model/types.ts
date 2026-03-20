export const QR_SESSION_STATUSES = {
  ACTIVE: 'active',
  PENDING: 'pending',
  EXPIRED: 'expired',
} as const;

export type QrSessionStatus = (typeof QR_SESSION_STATUSES)[keyof typeof QR_SESSION_STATUSES];

export interface QrSession {
  id: string;
  code: string;
  expiresAt: string;
  location: string;
  status: QrSessionStatus;
}
