export type PassStatus = 'active' | 'pending' | 'expired';

export interface DigitalPass {
  id: string;
  title: string;
  zone: string;
  status: PassStatus;
  validUntil: string;
  sessionsLeft: number;
}
