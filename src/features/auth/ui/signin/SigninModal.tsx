import { Button, Input, useModalStore } from '@/shared';

import { useSignin } from '../../model/useSignin';

export default function SigninModal() {
  const close = useModalStore((state) => state.close);
  const {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    error,
    handleSignin,
  } = useSignin(close);

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
