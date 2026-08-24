import { CheckCircle2 } from 'lucide-react';

import AIChat from '@/features/ai-consult/components/AIChat';
import { Button, Input } from '@/features/shared';

import { useSignupFlow } from '../../hooks/useSignupFlow';
import { formatTime, maskBirth, maskName, maskPhone } from '../../utils/signup';

interface SignupChatProps {
  /** 인증 시간 초과로 취소되거나 가입이 완료되어 흐름이 끝났을 때 호출됩니다. */
  onFinish?: () => void;
}

export default function SignupChat({ onFinish }: SignupChatProps) {
  const {
    step,
    info,
    errors,
    code,
    agreedToPrivacy,
    remainingSeconds,
    isCancelled,
    setCode,
    setAgreedToPrivacy,
    handleChange,
    handleSubmitBasicInfo,
    handleVerifyCode,
    handleCompleteSignup,
  } = useSignupFlow(onFinish);

  return (
    <div className="flex flex-col gap-4">
      <AIChat sentence="회원 가입을 위해 몇 가지만 확인할게요. 편하게 답해주세요 :)" />

      {step === 'basic-info' && (
        <AIChat
          sentence={
            <div className="flex flex-col gap-2 w-full">
              <div className="text-caption text-fg-tertiary">기본 정보</div>
              <div>
                <Input
                  value={info.name}
                  onChange={handleChange('name')}
                  placeholder="이름"
                  variant={errors.name ? 'error' : 'default'}
                />
                {errors.name && (
                  <p className="text-caption text-semantic-error mt-1">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <Input
                  value={info.birth}
                  onChange={handleChange('birth')}
                  placeholder="생년월일 6자리 (YYMMDD)"
                  inputMode="numeric"
                  maxLength={6}
                  variant={errors.birth ? 'error' : 'default'}
                />
                {errors.birth && (
                  <p className="text-caption text-semantic-error mt-1">
                    {errors.birth}
                  </p>
                )}
              </div>
              <div>
                <Input
                  value={info.phone}
                  onChange={handleChange('phone')}
                  placeholder="전화번호"
                  type="tel"
                  variant={errors.phone ? 'error' : 'default'}
                />
                {errors.phone && (
                  <p className="text-caption text-semantic-error mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>
              <Button onClick={handleSubmitBasicInfo} className="mt-2 w-full">
                다음 &gt;
              </Button>
            </div>
          }
        />
      )}

      {step !== 'basic-info' && step !== 'completed' && (
        <AIChat
          variant="success"
          sentence={
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 font-medium">
                <CheckCircle2 size={16} />
                <span>입력 완료</span>
              </div>
              <div className="text-fg-secondary">
                {maskName(info.name)} · {maskBirth(info.birth)} ·{' '}
                {maskPhone(info.phone)}
              </div>
            </div>
          }
        />
      )}

      {step === 'verify-code' && !isCancelled && (
        <>
          <AIChat sentence="인증번호를 보내드렸어요. 3분 이내에 입력해주세요." />
          <AIChat
            sentence={
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center justify-between text-caption text-fg-tertiary">
                  <span>인증번호</span>
                  <span className="text-semantic-error">
                    {formatTime(remainingSeconds)}
                  </span>
                </div>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="인증번호 6자리"
                  inputMode="numeric"
                  maxLength={6}
                />
                <Button
                  onClick={handleVerifyCode}
                  disabled={code.trim().length !== 6}
                  className="mt-2 w-full"
                >
                  확인
                </Button>
              </div>
            }
          />
        </>
      )}

      {isCancelled && (
        <AIChat variant="error" sentence="회원가입이 취소되었습니다." />
      )}

      {step === 'review' && (
        <>
          <AIChat sentence="입력하신 내용을 확인해주세요." />
          <AIChat
            sentence={
              <div className="flex flex-col gap-3 w-full">
                <div className="text-caption text-fg-tertiary">
                  입력 내용 확인
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-body">
                    <span className="text-fg-tertiary">이름</span>
                    <span className="font-medium">{maskName(info.name)}</span>
                  </div>
                  <div className="flex items-center justify-between text-body">
                    <span className="text-fg-tertiary">휴대폰</span>
                    <span className="font-medium">{maskPhone(info.phone)}</span>
                  </div>
                </div>
                <label className="flex items-start gap-2 text-caption text-fg-secondary border-t border-border pt-3">
                  <input
                    type="checkbox"
                    checked={agreedToPrivacy}
                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                    className="mt-0.5 accent-brand-promo-primary"
                  />
                  <span>
                    <span className="font-medium text-fg-primary">
                      [필수] 개인정보 수집 및 이용 동의
                    </span>
                    <br />
                    수집 항목: 이름, 생년월일, 휴대폰 번호 · 이용 목적: 회원가입
                    및 본인 확인 · 보유 기간: 회원 탈퇴 시까지
                  </span>
                </label>
                <Button
                  onClick={handleCompleteSignup}
                  disabled={!agreedToPrivacy}
                  className="w-full"
                >
                  가입 완료하기
                </Button>
              </div>
            }
          />
        </>
      )}

      {step === 'completed' && (
        <AIChat
          variant="success"
          sentence="회원가입이 완료되었어요! 🎉
          자동 로그인이 진행되었고, 이전 채팅과 이어서 대화할 수 있습니다"
        />
      )}
    </div>
  );
}
