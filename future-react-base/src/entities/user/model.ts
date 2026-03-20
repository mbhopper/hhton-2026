export interface UserProfile {
  id: string;
  name: string;
  email: string;
  city: string;
  membershipLevel: 'Base' | 'Priority' | 'VIP';
}
