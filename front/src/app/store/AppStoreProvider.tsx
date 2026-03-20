import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { DigitalPass } from '../../entities/pass/model';
import type { QrSession } from '../../entities/qr/model';
import type { UserProfile } from '../../entities/user/model';
import { mockApi } from '../../shared/api/mockApi';

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  password: string;
  confirmPassword: string;
}

type AuthStatus = 'guest' | 'authenticated';

interface AppStoreContextValue {
  authStatus: AuthStatus;
  user: UserProfile | null;
  passes: DigitalPass[];
  qrSession: QrSession | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('guest');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [passes, setPasses] = useState<DigitalPass[]>([]);
  const [qrSession, setQrSession] = useState<QrSession | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      const [nextPasses, nextQr] = await Promise.all([mockApi.getPasses(), mockApi.getQrSession()]);
      setPasses(nextPasses);
      setQrSession(nextQr);
    };

    void bootstrap();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const nextUser = await mockApi.signIn(email, password);
    setUser(nextUser);
    setAuthStatus('authenticated');
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const nextUser = await mockApi.signUp(payload);
    setUser(nextUser);
    setAuthStatus('authenticated');
  }, []);

  const logout = useCallback(() => {
    setAuthStatus('guest');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ authStatus, user, passes, qrSession, login, register, logout }),
    [authStatus, user, passes, qrSession, login, register, logout],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const context = useContext(AppStoreContext);

  if (!context) {
    throw new Error('useAppStore must be used within AppStoreProvider');
  }

  return context;
}
