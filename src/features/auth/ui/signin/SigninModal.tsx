import { Button, Input, useModalStore, useSignupIntentStore } from '@/shared';

import { useSignin } from '../../model/useSignin';

interface SigninModalProps {
  // 채팅 페이지 안(이미 회원가입 채팅 플로우에 접근 가능한 곳)에서 이 모달을 열 때는
  // 회원가입 버튼이 그 자리에서 바로 플로우를 시작하도록 직접 주입한다.
  // 넘기지 않으면(예: 헤더) 이미 항상 마운트되어 있는 채팅 페이지가 신호를 받아
  // 그곳에서 자동으로 회원가입을 시작한다.
  onSignupClick?: () => void;
}

export default function SigninModal({ onSignupClick }: SigninModalProps) {
  const close = useModalStore((state) => state.close);
  const requestSignup = useSignupIntentStore((state) => state.requestSignup);
  const {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    error,
    handleSignin,
  } = useSignin(close);

  const handleSignupClick = () => {
    close();
    if (onSignupClick) {
      onSignupClick();
    } else {
      requestSignup();
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
      <div className="flex flex-col gap-2">
        <Button
          className="w-full"
          onClick={handleSignin}
          disabled={isSubmitting || !email || !password}
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleSignupClick}
          disabled={isSubmitting}
        >
          회원가입
        </Button>
      </div>
    </div>
  );
}
