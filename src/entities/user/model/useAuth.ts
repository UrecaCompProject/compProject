import { useContext } from 'react';

import { AuthContext, type AuthContextValue } from './authContext';

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다');
  return ctx;
}

// 기존 useIsLoggedIn 호환 — 컴포넌트에서 isLoggedIn만 필요할 때 사용
export function useIsLoggedIn(): boolean {
  return useAuth().isLoggedIn;
}
