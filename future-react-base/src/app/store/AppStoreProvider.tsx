import { useEffect, type PropsWithChildren } from 'react';
import { create } from 'zustand';
import type { DigitalPass } from '../../entities/pass/model';
import type { QrSession } from '../../entities/qr/model';
import type { AuthSession, UserProfile } from '../../entities/user/model';
import { authMockApi, AuthApiError, getStoredAuthSession, type RegisterPayload } from '../../shared/api/auth.mock';
import { mockApi } from '../../shared/api/mockApi';

export type AuthStatus = 'guest' | 'restoring' | 'authenticated';

interface AppStoreState {
  authStatus: AuthStatus;
  authSession: AuthSession | null;
  authError: AuthApiError | null;
  user: UserProfile | null;
  passes: DigitalPass[];
  qrSession: QrSession | null;
  bootstrapCompleted: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
}

let bootstrapPromise: Promise<void> | null = null;

export const useAppStore = create<AppStoreState>((set) => ({
  authStatus: 'restoring',
  authSession: null,
  authError: null,
  user: null,
  passes: [],
  qrSession: null,
  bootstrapCompleted: false,
  async login(email, password, remember = true) {
    set({ authError: null });

    try {
      const authSession = await authMockApi.login(email, password, remember);
      const user = await authMockApi.getCurrentUser();
      set({ authSession, authStatus: 'authenticated', user, authError: null });
    } catch (error) {
      const authError = error instanceof AuthApiError ? error : new AuthApiError('service_unavailable', 'Unexpected auth failure.');
      set({ authError, authStatus: 'guest', authSession: null, user: null });
      throw authError;
    }
  },
  async register(name, email, password) {
    set({ authError: null });

    const payload: RegisterPayload = { name, email, password, remember: true };

    try {
      const authSession = await authMockApi.register(payload);
      const user = await authMockApi.getCurrentUser();
      set({ authSession, authStatus: 'authenticated', user, authError: null });
    } catch (error) {
      const authError = error instanceof AuthApiError ? error : new AuthApiError('service_unavailable', 'Unexpected registration failure.');
      set({ authError, authStatus: 'guest', authSession: null, user: null });
      throw authError;
    }
  },
  async logout() {
    await authMockApi.logout();
    set({ authStatus: 'guest', authSession: null, authError: null, user: null });
  },
  async bootstrap() {
    if (bootstrapPromise) {
      return bootstrapPromise;
    }

    bootstrapPromise = (async () => {
      set({ authStatus: 'restoring' });

      const [passesResult, qrResult] = await Promise.all([mockApi.getPasses(), mockApi.getQrSession()]);
      set({ passes: passesResult, qrSession: qrResult });

      try {
        const user = await authMockApi.getCurrentUser();
        const authSession = getStoredAuthSession();
        set({ authStatus: 'authenticated', user, authSession, authError: null, bootstrapCompleted: true });
      } catch (error) {
        if (error instanceof AuthApiError && error.code === 'auth_error') {
          set({ authStatus: 'guest', authSession: null, user: null, authError: null, bootstrapCompleted: true });
          return;
        }

        const authError = error instanceof AuthApiError ? error : new AuthApiError('service_unavailable', 'Failed to restore auth session.');
        set({ authStatus: 'guest', authSession: null, user: null, authError, bootstrapCompleted: true });
      }
    })().finally(() => {
      bootstrapPromise = null;
    });

    return bootstrapPromise;
  },
}));

export function AppStoreProvider({ children }: PropsWithChildren) {
  const bootstrap = useAppStore((state) => state.bootstrap);
  const bootstrapCompleted = useAppStore((state) => state.bootstrapCompleted);

  useEffect(() => {
    if (!bootstrapCompleted) {
      void bootstrap();
    }
  }, [bootstrap, bootstrapCompleted]);

  return <>{children}</>;
}
