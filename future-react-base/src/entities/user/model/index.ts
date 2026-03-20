export * from './types';

export interface AuthSession {
  token: string;
  userId: string;
  issuedAt: number;
  restoredAt: number;
  expiresAt: number;
  storage: 'localStorage' | 'sessionStorage';
}
