import type { PropsWithChildren } from 'react';
import { AppStoreProvider } from '../store/AppStoreProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return <AppStoreProvider>{children}</AppStoreProvider>;
}
