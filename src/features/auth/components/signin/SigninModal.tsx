import { useState } from 'react';

// eslint-disable-next-line import-x/no-cycle
import { postSignin } from '@/features/auth';
import { Button, Input, useModalStore } from '@/features/shared';

export default function SigninModal() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const close = useModalStore((state) => state.close);

  const handleSignin = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await postSignin(email, password);
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 text-body text-fg-tertiary">
      <Input
        type="email"
        placeholder="이메일을 입력하세요"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="비밀번호를 입력하세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-caption text-semantic-error">{error}</p>}
      <Button
        onClick={handleSignin}
        disabled={isSubmitting || !email || !password}
      >
        {isSubmitting ? '로그인 중...' : '로그인'}
      </Button>
    </div>
  );
}
