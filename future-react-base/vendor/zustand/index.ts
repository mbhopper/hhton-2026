import { useSyncExternalStore } from 'react';

export type StateCreator<TState> = (
  setState: (partial: Partial<TState> | ((state: TState) => Partial<TState>), replace?: boolean) => void,
  getState: () => TState,
) => TState;

export type StoreApi<TState> = {
  getState: () => TState;
  setState: (partial: Partial<TState> | ((state: TState) => Partial<TState>), replace?: boolean) => void;
  subscribe: (listener: () => void) => () => void;
};

export type UseBoundStore<TState> = {
  (): TState;
  <TSelected>(selector: (state: TState) => TSelected): TSelected;
  getState: () => TState;
  setState: StoreApi<TState>['setState'];
  subscribe: StoreApi<TState>['subscribe'];
};

function identity<TValue>(value: TValue) {
  return value;
}

export function create<TState>(createState: StateCreator<TState>): UseBoundStore<TState> {
  let state: TState;
  const listeners = new Set<() => void>();

  const getState = () => state;

  const setState: StoreApi<TState>['setState'] = (partial, replace = false) => {
    const nextState = typeof partial === 'function' ? partial(state) : partial;
    state = replace ? (nextState as TState) : { ...state, ...nextState };
    listeners.forEach((listener) => listener());
  };

  const subscribe: StoreApi<TState>['subscribe'] = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  state = createState(setState, getState);

  function useBoundStore<TSelected>(selector: (state: TState) => TSelected = identity as (state: TState) => TSelected) {
    return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
  }

  useBoundStore.getState = getState;
  useBoundStore.setState = setState;
  useBoundStore.subscribe = subscribe;

  return useBoundStore as UseBoundStore<TState>;
}
