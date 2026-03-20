export const PASS_STATUSES = {
  ACTIVE: 'active',
  PENDING: 'pending',
  EXPIRED: 'expired',
} as const;

export type PassStatus = (typeof PASS_STATUSES)[keyof typeof PASS_STATUSES];

export interface DigitalPass {
  id: string;
  title: string;
  zone: string;
  status: PassStatus;
  validUntil: string;
  sessionsLeft: number;
}
