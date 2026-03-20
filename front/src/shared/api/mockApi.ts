import type { DigitalPass } from '../../entities/pass/model';
import type { QrSession } from '../../entities/qr/model';
import type { UserProfile } from '../../entities/user/model';
import type { RegisterPayload } from '../../app/store/AppStoreProvider';
import { mockPasses, mockQrSession, mockUser } from '../mocks/data';

const delay = async (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  async signIn(email: string, _password: string): Promise<UserProfile> {
    await delay();
    return {
      ...mockUser,
      email,
      name: email.split('@')[0].replace(/^./, (letter) => letter.toUpperCase()),
    };
  },
  async signUp(payload: RegisterPayload): Promise<UserProfile> {
    await delay();
    const name = [payload.lastName, payload.firstName, payload.middleName].filter(Boolean).join(' ');

    return {
      ...mockUser,
      name,
      email: payload.email,
    };
  },
  async getPasses(): Promise<DigitalPass[]> {
    await delay(150);
    return mockPasses;
  },
  async getQrSession(): Promise<QrSession> {
    await delay(150);
    return mockQrSession;
  },
};
