export const USER_STATUSES = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
} as const;

export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];

export interface User {
  id: string;
  name: string;
  email: string;
  city: string;
  membershipLevel: 'Base' | 'Priority' | 'VIP';
  status: UserStatus;
}

export type UserProfile = User;
