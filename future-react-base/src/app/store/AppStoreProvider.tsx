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

type AuthStatus = 'guest' | 'authenticated';

interface AppStoreContextValue {
  authStatus: AuthStatus;
  user: UserProfile | null;
  passes: DigitalPass[];
  qrSession: QrSession | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('authenticated');
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

  useEffect(() => {
    if (authStatus === 'authenticated' && !user) {
      void mockApi.signIn('alex@futurepass.app').then(setUser);
    }
  }, [authStatus, user]);

  const login = useCallback(async (email: string) => {
    const nextUser = await mockApi.signIn(email);
    setUser(nextUser);
    setAuthStatus('authenticated');
  }, []);

  const register = useCallback(async (name: string, email: string) => {
    const nextUser = await mockApi.signUp(name, email);
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
