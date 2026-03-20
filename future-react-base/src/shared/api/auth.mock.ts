import type { AuthSession, User, UserStatus } from '../../entities/user/model';
import { mockUser } from '../mocks/data';

export type AuthErrorCode = 'auth_error' | 'service_unavailable' | 'network_simulation';

export class AuthApiError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = 'AuthApiError';
    this.code = code;
  }
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  city?: string;
  remember?: boolean;
}

interface AuthStorageSnapshot {
  token: string | null;
  user: User | null;
  timestamps: {
    lastLoginAt: number | null;
    lastLogoutAt: number | null;
    lastRestoredAt: number | null;
  };
}

const STORAGE_NAMESPACE = 'digital-pass';
const TOKEN_KEY = `${STORAGE_NAMESPACE}:token`;
const USER_KEY = `${STORAGE_NAMESPACE}:current-user`;
const SESSION_KEY = `${STORAGE_NAMESPACE}:session`;
const TIMESTAMPS_KEY = `${STORAGE_NAMESPACE}:timestamps`;
const SESSION_TTL = 1000 * 60 * 60 * 8;
const DEFAULT_DELAY = 450;
const mockUsers = new Map<string, User>([
  [mockUser.email.toLowerCase(), mockUser],
]);

const delay = (ms = DEFAULT_DELAY) => new Promise((resolve) => setTimeout(resolve, ms));

function isStorageAvailable(storage: Storage | null) {
  if (!storage) {
    return false;
  }

  try {
    const probeKey = `${STORAGE_NAMESPACE}:probe`;
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

function getStorages() {
  if (typeof window === 'undefined') {
    return { localStorage: null, sessionStorage: null };
  }

  return {
    localStorage: isStorageAvailable(window.localStorage) ? window.localStorage : null,
    sessionStorage: isStorageAvailable(window.sessionStorage) ? window.sessionStorage : null,
  };
}

function pickStorage(preferPersistent = true) {
  const { localStorage, sessionStorage } = getStorages();

  if (preferPersistent) {
    return localStorage ?? sessionStorage;
  }

  return sessionStorage ?? localStorage;
}

function clearNamespace() {
  const storages = getStorages();

  [storages.localStorage, storages.sessionStorage].forEach((storage) => {
    storage?.removeItem(TOKEN_KEY);
    storage?.removeItem(USER_KEY);
    storage?.removeItem(SESSION_KEY);
    storage?.removeItem(TIMESTAMPS_KEY);
  });
}

function readJson<TValue>(storage: Storage | null, key: string): TValue | null {
  if (!storage) {
    return null;
  }

  const rawValue = storage.getItem(key);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as TValue;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

function persistSession(user: User, remember = true): AuthSession {
  const storage = pickStorage(remember);

  if (!storage) {
    throw new AuthApiError('service_unavailable', 'Storage is unavailable for auth persistence.');
  }

  const now = Date.now();
  const session: AuthSession = {
    token: `dp_${user.id}_${Math.random().toString(36).slice(2, 10)}`,
    userId: user.id,
    issuedAt: now,
    restoredAt: now,
    expiresAt: now + SESSION_TTL,
    storage: storage === getStorages().localStorage ? 'localStorage' : 'sessionStorage',
  };
  const timestamps = {
    lastLoginAt: now,
    lastLogoutAt: null,
    lastRestoredAt: now,
  };

  clearNamespace();
  storage.setItem(TOKEN_KEY, session.token);
  storage.setItem(USER_KEY, JSON.stringify(user));
  storage.setItem(SESSION_KEY, JSON.stringify(session));
  storage.setItem(TIMESTAMPS_KEY, JSON.stringify(timestamps));

  return session;
}

function readSnapshot(): AuthStorageSnapshot {
  const storages = getStorages();
  const storage = storages.localStorage ?? storages.sessionStorage;
  const session = readJson<AuthSession>(storages.localStorage, SESSION_KEY) ?? readJson<AuthSession>(storages.sessionStorage, SESSION_KEY);
  const user = readJson<User>(storages.localStorage, USER_KEY) ?? readJson<User>(storages.sessionStorage, USER_KEY);
  const timestamps =
    readJson<AuthStorageSnapshot['timestamps']>(storages.localStorage, TIMESTAMPS_KEY) ??
    readJson<AuthStorageSnapshot['timestamps']>(storages.sessionStorage, TIMESTAMPS_KEY) ?? {
      lastLoginAt: null,
      lastLogoutAt: null,
      lastRestoredAt: null,
    };

  return {
    token: session?.token ?? storage?.getItem(TOKEN_KEY) ?? null,
    user,
    timestamps,
  };
}

function normalizeUserStatus(status?: UserStatus): UserStatus {
  return status ?? 'active';
}

function buildUser(name: string, email: string, city = mockUser.city): User {
  const existingUser = mockUsers.get(email.toLowerCase());

  if (existingUser) {
    return existingUser;
  }

  const nextUser: User = {
    ...mockUser,
    id: `user-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    city,
    status: 'pending',
  };

  mockUsers.set(email.toLowerCase(), nextUser);
  return nextUser;
}

function maybeThrowSimulationError(identifier: string) {
  const normalized = identifier.toLowerCase();

  if (normalized.includes('service-down')) {
    throw new AuthApiError('service_unavailable', 'Mock auth backend is temporarily unavailable.');
  }

  if (normalized.includes('network-flaky')) {
    throw new AuthApiError('network_simulation', 'Simulated network instability interrupted the request.');
  }
}

export function getStoredAuthSession(): AuthSession | null {
  const storages = getStorages();
  return readJson<AuthSession>(storages.localStorage, SESSION_KEY) ?? readJson<AuthSession>(storages.sessionStorage, SESSION_KEY);
}

export const authMockApi = {
  async login(email: string, password: string, remember = true): Promise<AuthSession> {
    await delay();
    maybeThrowSimulationError(email);

    const user = mockUsers.get(email.toLowerCase());

    if (!user || password !== 'future-pass') {
      throw new AuthApiError('auth_error', 'Invalid email or password.');
    }

    const normalizedUser: User = {
      ...user,
      status: normalizeUserStatus(user.status),
      name: user.name || email.split('@')[0],
    };

    mockUsers.set(email.toLowerCase(), normalizedUser);
    return persistSession(normalizedUser, remember);
  },

  async register(payload: RegisterPayload): Promise<AuthSession> {
    await delay(550);
    maybeThrowSimulationError(payload.email);

    if (mockUsers.has(payload.email.toLowerCase())) {
      throw new AuthApiError('auth_error', 'A user with this email already exists.');
    }

    if (payload.password.length < 8) {
      throw new AuthApiError('auth_error', 'Password must contain at least 8 characters.');
    }

    const user = buildUser(payload.name, payload.email, payload.city);
    const activeUser: User = { ...user, status: 'active' };
    mockUsers.set(payload.email.toLowerCase(), activeUser);

    return persistSession(activeUser, payload.remember ?? true);
  },

  async getCurrentUser(): Promise<User> {
    await delay(300);

    const storages = getStorages();
    const session = readJson<AuthSession>(storages.localStorage, SESSION_KEY) ?? readJson<AuthSession>(storages.sessionStorage, SESSION_KEY);
    const user = readJson<User>(storages.localStorage, USER_KEY) ?? readJson<User>(storages.sessionStorage, USER_KEY);

    if (!session?.token || !user) {
      throw new AuthApiError('auth_error', 'No active session was found.');
    }

    if (Date.now() > session.expiresAt) {
      clearNamespace();
      throw new AuthApiError('auth_error', 'Session has expired.');
    }

    const nextRestoredAt = Date.now();
    const nextSession: AuthSession = { ...session, restoredAt: nextRestoredAt };
    const timestamps = {
      ...(readSnapshot().timestamps ?? {
        lastLoginAt: session.issuedAt,
        lastLogoutAt: null,
        lastRestoredAt: null,
      }),
      lastRestoredAt: nextRestoredAt,
    };
    const storage = session.storage === 'sessionStorage' ? storages.sessionStorage : storages.localStorage;

    storage?.setItem(SESSION_KEY, JSON.stringify(nextSession));
    storage?.setItem(TIMESTAMPS_KEY, JSON.stringify(timestamps));

    return { ...user, status: normalizeUserStatus(user.status) };
  },

  async logout(): Promise<void> {
    await delay(200);

    const storages = getStorages();
    const timestampPayload = {
      ...(readSnapshot().timestamps ?? {
        lastLoginAt: null,
        lastLogoutAt: null,
        lastRestoredAt: null,
      }),
      lastLogoutAt: Date.now(),
    };

    [storages.localStorage, storages.sessionStorage].forEach((storage) => {
      if (!storage) {
        return;
      }

      storage.setItem(TIMESTAMPS_KEY, JSON.stringify(timestampPayload));
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(USER_KEY);
      storage.removeItem(SESSION_KEY);
    });
  },
};
