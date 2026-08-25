import { useState } from 'react';

import { postLogout } from '@/features/auth';
import { Button, useModalStore } from '@/features/shared';

export default function LogoutCheckModal() {
  const close = useModalStore((state) => state.close);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleLogout = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await postLogout();
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그아웃에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="flex flex-col gap-2 text-body text-fg-tertiary">
      레포트 작성 없이 로그아웃 시 채팅이 사라집니다
      <br />
      로그아웃을 진행하시겠습니까?
      {error && <p className="text-caption text-semantic-error">{error}</p>}
      <Button onClick={handleLogout} disabled={isSubmitting}>
        {isSubmitting ? '로그아웃 중...' : '로그아웃'}
      </Button>
    </div>
  );
}
