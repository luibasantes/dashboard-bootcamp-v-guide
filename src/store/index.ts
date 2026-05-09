import type { Store } from '#/types/store';
import { create } from 'zustand';

const CURRENT_USER_KEY = 'current-user-v1';

type StoreFields = Pick<Store, 'statusFilter' | 'theme' | 'email'>;

const initialState: StoreFields = {
  statusFilter: null,
  theme: 'light',
  email: undefined,
};

const readEmailFromStorage = (): string | undefined => {
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as { email?: string };
    return parsed.email;
  } catch {
    return undefined;
  }
};

export const useAppStore = create<Store>((set) => {
  return {
    email: readEmailFromStorage() ?? initialState.email,
    statusFilter:
      (localStorage.getItem('statusFilter') as Store['statusFilter']) ||
      initialState.statusFilter,
    theme:
      (localStorage.getItem('theme') as Store['theme']) || initialState.theme,

    setStatusFilter: (newStatusFilter) => {
      set({ statusFilter: newStatusFilter });
      if (newStatusFilter) {
        localStorage.setItem('statusFilter', newStatusFilter);
      } else {
        localStorage.removeItem('statusFilter');
      }
    },

    setTheme: (newTheme) => {
      set({ theme: newTheme });
      localStorage.setItem('theme', newTheme);
    },

    setEmail: (email) => {
      set({ email });
    },
  };
});
