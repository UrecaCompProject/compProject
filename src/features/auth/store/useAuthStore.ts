import { create } from 'zustand';

import { supabase } from '@/lib/supabaseClient';

import type { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export const useAuthStore = create<AuthState>(() => ({
  user: '기매진' as unknown as User,
  session: null,
  isLoading: false,
}));

supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.setState({
    session,
    user: session?.user ?? null,
    isLoading: false,
  });
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({
    session,
    user: session?.user ?? null,
    isLoading: false,
  });
});

export const useIsLoggedIn = () => useAuthStore((state) => !!state.user);
