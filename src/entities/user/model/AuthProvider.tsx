import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from '@/shared/lib/supabaseClient';

import { AuthContext, type AuthContextValue } from './authContext';

// Supabase 세션을 Provider 생명주기에 맞춰 관리
// 마운트 시 getSession으로 초기 세션을 로드하고 onAuthStateChange로 변경을 구독
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [session, setSession] = useState<AuthContextValue['session']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, session, isLoading, isLoggedIn: !!user }),
    [user, session, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
