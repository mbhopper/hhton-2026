import type { DigitalPass } from '../../entities/pass/model';
import type { QrSession } from '../../entities/qr/model';
import type { UserProfile } from '../../entities/user/model';
import { mockPasses, mockQrSession, mockUser } from '../mocks/data';

const delay = async (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  async signIn(email: string): Promise<UserProfile> {
    await delay();
    return {
      ...mockUser,
      email,
      name: email.split('@')[0].replace(/^./, (letter) => letter.toUpperCase()),
    };
  },
  async signUp(name: string, email: string): Promise<UserProfile> {
    await delay();
    return {
      ...mockUser,
      name,
      email,
    };
  },
  async getPasses(): Promise<DigitalPass[]> {
    await delay();
    return mockPasses;
  },
  async getQrSession(): Promise<QrSession> {
    await delay();
    return mockQrSession;
  },
};
