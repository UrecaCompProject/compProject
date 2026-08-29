import { create } from 'zustand';

import { supabase } from '@/shared/lib/supabaseClient';

import { getUserProfile } from '../api/getUserProfile';

import type { UserProfile } from '../api/getUserProfile';
import type { Session, User } from '@supabase/supabase-js';

const PROFILE_STORAGE_KEY = 'ephyra_user_profile';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
}));

// 로그인/회원가입/새로고침 시 세션 복원까지 전부 이 콜백을 거치므로,
// public.users 프로필 동기화도 여기 한 곳에서 처리한다.
async function syncProfile(userId: string | undefined) {
  if (!userId) {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    useAuthStore.setState({ profile: null });
    return;
  }

  try {
    const profile = await getUserProfile(userId);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    useAuthStore.setState({ profile });
  } catch {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    useAuthStore.setState({ profile: null });
  }
}

supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.setState({
    session,
    user: session?.user ?? null,
    isLoading: false,
  });
  syncProfile(session?.user?.id);
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({
    session,
    user: session?.user ?? null,
    isLoading: false,
  });
  syncProfile(session?.user?.id);
});

export const useIsLoggedIn = () => useAuthStore((state) => !!state.user);
export const useUserProfile = () => useAuthStore((state) => state.profile);
