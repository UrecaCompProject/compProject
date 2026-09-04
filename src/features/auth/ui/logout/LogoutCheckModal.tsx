import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import postLogout from '@/features/auth/api/postLogout';
import { Button, useModalStore } from '@/shared';

export default function LogoutCheckModal() {
  const close = useModalStore((state) => state.close);
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleLogout = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await postLogout();
      // 로그아웃 후 캐시된 사용자 데이터가 남아있으면 새로고침 전까지
      // 마이페이지 등에서 이전 사용자 정보가 표시되므로 전체 캐시를 초기화한다.
      queryClient.clear();
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그아웃에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex flex-col gap-2 text-body text-fg-tertiary text-center">
      리포트 작성 없이 로그아웃 시 채팅이 사라집니다.
      <br />
      로그아웃을 진행하시겠습니까?
      {error && <p className="text-caption text-semantic-error">{error}</p>}
      <Button onClick={handleLogout} disabled={isSubmitting} className="mt-2">
        {isSubmitting ? '로그아웃 중...' : '로그아웃'}
      </Button>
    </div>
  );
}
