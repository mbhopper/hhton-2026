export type UserStatus = 'active' | 'pending' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  city: string;
  membershipLevel: 'Base' | 'Priority' | 'VIP';
  status: UserStatus;
}

export interface AuthSession {
  token: string;
  userId: string;
  issuedAt: number;
  restoredAt: number;
  expiresAt: number;
  storage: 'localStorage' | 'sessionStorage';
}

export type UserProfile = User;
