// useAuthStore는 entities/user으로 이관됨
// 하위 호환을 위해 entities/user에서 re-export
export { useAuthStore, useIsLoggedIn } from '@/entities/user';
