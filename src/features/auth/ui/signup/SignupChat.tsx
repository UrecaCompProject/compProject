import { CheckCircle2 } from 'lucide-react';

import AIChat from '@/features/ai-consult/ui/AIChat';
import { Button, Input } from '@/shared';

import { formatTime, maskBirth, maskName, maskPhone } from '../../lib/signup';
import { useSignupFlow } from '../../model/useSignupFlow';

interface SignupChatProps {
  /** 인증 시간 초과로 취소되거나 가입이 완료되어 흐름이 끝났을 때 호출됩니다. */
  onFinish?: () => void;
}

export default function SignupChat({ onFinish }: SignupChatProps) {
  const {
    step,
    info,
    errors,
    isSendingOtp,
    code,
    isVerifyingCode,
    verifyError,
    credentials,
    credentialsErrors,
    agreedToPrivacy,
    isCompletingSignup,
    completeError,
    remainingSeconds,
    isCancelled,
    setCode,
    setAgreedToPrivacy,
    handleChange,
    handleSubmitBasicInfo,
    handleVerifyCode,
    handleCredentialsChange,
    handleSubmitCredentials,
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
              <Button
                onClick={handleSubmitBasicInfo}
                disabled={isSendingOtp}
                className="mt-2 w-full"
              >
                {isSendingOtp ? '인증번호 발송 중...' : '다음 >'}
              </Button>
            </div>
          }
        />
      )}

      {step !== 'basic-info' &&
        step !== 'completed' &&
        step !== 'already-member' && (
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
                  placeholder="인증번호"
                  inputMode="numeric"
                  variant={verifyError ? 'error' : 'default'}
                />
                {verifyError && (
                  <p className="text-caption text-semantic-error">
                    {verifyError}
                  </p>
                )}
                <Button
                  onClick={handleVerifyCode}
                  disabled={code.trim().length === 0 || isVerifyingCode}
                  className="mt-2 w-full"
                >
                  {isVerifyingCode ? '확인 중...' : '확인'}
                </Button>
              </div>
            }
          />
        </>
      )}

      {isCancelled && (
        <AIChat variant="error" sentence="회원가입이 취소되었습니다." />
      )}

      {step === 'credentials' && (
        <>
          <AIChat sentence="로그인에 사용할 이메일과 비밀번호를 입력해주세요." />
          <AIChat
            sentence={
              <div className="flex flex-col gap-2 w-full">
                <div>
                  <Input
                    type="email"
                    value={credentials.email}
                    onChange={handleCredentialsChange('email')}
                    placeholder="이메일"
                    variant={credentialsErrors.email ? 'error' : 'default'}
                  />
                  {credentialsErrors.email && (
                    <p className="text-caption text-semantic-error mt-1">
                      {credentialsErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    type="password"
                    value={credentials.password}
                    onChange={handleCredentialsChange('password')}
                    placeholder="비밀번호 (8자 이상)"
                    variant={credentialsErrors.password ? 'error' : 'default'}
                  />
                  {credentialsErrors.password && (
                    <p className="text-caption text-semantic-error mt-1">
                      {credentialsErrors.password}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    type="password"
                    value={credentials.passwordConfirm}
                    onChange={handleCredentialsChange('passwordConfirm')}
                    placeholder="비밀번호 확인"
                    variant={
                      credentialsErrors.passwordConfirm ? 'error' : 'default'
                    }
                  />
                  {credentialsErrors.passwordConfirm && (
                    <p className="text-caption text-semantic-error mt-1">
                      {credentialsErrors.passwordConfirm}
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleSubmitCredentials}
                  className="mt-2 w-full"
                >
                  다음 &gt;
                </Button>
              </div>
            }
          />
        </>
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
                  <div className="flex items-center justify-between text-body">
                    <span className="text-fg-tertiary">이메일</span>
                    <span className="font-medium">{credentials.email}</span>
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
                {completeError && (
                  <p className="text-caption text-semantic-error">
                    {completeError}
                  </p>
                )}
                <Button
                  onClick={handleCompleteSignup}
                  disabled={!agreedToPrivacy || isCompletingSignup}
                  className="w-full"
                >
                  {isCompletingSignup ? '처리 중...' : '가입 완료하기'}
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

      {step === 'already-member' && (
        <AIChat
          variant="success"
          sentence="이미 가입되어 있는 번호예요! 자동으로 로그인했어요 🎉"
        />
      )}
    </div>
  );
}
