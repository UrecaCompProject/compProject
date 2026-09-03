import { CheckCircle2 } from 'lucide-react';

import { useIsLoggedIn } from '@/entities/user';
import { AIChat, Button, Input } from '@/shared';

import { formatTime, maskBirth, maskName, maskPhone } from '../../lib/signup';
import { useSignupFlow } from '../../model/useSignupFlow';

interface SignupChatProps {
  /** 인증 시간 초과로 취소되거나 가입이 완료되어 흐름이 끝났을 때 호출됩니다. */
  onFinish?: () => void;
}

// 필드 에러 메시지 — 빨간 원 안에 흰색 느낌표 아이콘 + 에러 텍스트
function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 flex items-center gap-1 text-caption text-[12px] text-semantic-error">
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-semantic-error text-[9px] font-bold leading-3.5 text-white">
        !
      </span>
      {children}
    </p>
  );
}

// 회원가입 폼 공용 필드 — 라벨(선택) + Input + FieldError를 한 묶음으로 렌더링
interface SignupFieldProps extends Omit<
  React.ComponentProps<typeof Input>,
  'variant'
> {
  label?: React.ReactNode;
  labelClassName?: string;
  error?: string | null;
}

function SignupField({
  label,
  labelClassName = 'block text-[14px] font-semibold mb-1',
  error,
  className = '',
  id,
  ...inputProps
}: SignupFieldProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}
      <Input
        id={id}
        variant={error ? 'error' : 'default'}
        className={`rounded-lg ${className}`}
        {...inputProps}
      />
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
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
    handleBackToCredentials,
  } = useSignupFlow(onFinish);

  // 회원가입 진행 중 로그인 완료 시 안내문구·입력폼 자동 숨김
  const isLoggedIn = useIsLoggedIn();
  const hideSignupUI =
    isLoggedIn || step === 'completed' || step === 'already-member';

  return (
    <div className="flex flex-col gap-4">
      {!hideSignupUI && (
        <AIChat sentence="회원 가입을 위해 몇 가지만 확인할게요. 편하게 답해주세요 :)" />
      )}

      {step === 'basic-info' && !isLoggedIn && (
        <AIChat
          fullWidth
          sentence={
            <div className="flex flex-col gap-2.5 w-full">
              <div className="text-[16px] font-medium text-fg-tertiary pt-2">
                기본 정보
              </div>
              <SignupField
                label="이름"
                id="signup-name"
                value={info.name}
                onChange={handleChange('name')}
                placeholder="홍길동"
                error={errors.name}
              />
              <SignupField
                label="생년월일"
                id="signup-birth"
                value={info.birth}
                onChange={handleChange('birth')}
                placeholder="생년월일 6자리 (YYMMDD)"
                inputMode="numeric"
                maxLength={6}
                error={errors.birth}
              />
              <SignupField
                label="전화번호"
                id="signup-phone"
                value={info.phone}
                onChange={handleChange('phone')}
                maxLength={11}
                placeholder="010-0000-0000"
                type="tel"
                error={errors.phone}
              />
              <Button
                onClick={handleSubmitBasicInfo}
                disabled={isSendingOtp}
                className="w-full mb-1.5 mt-2"
              >
                {isSendingOtp ? '인증번호 발송 중...' : '다음'}
              </Button>
            </div>
          }
        />
      )}

      {step !== 'basic-info' &&
        step !== 'completed' &&
        step !== 'already-member' &&
        !isLoggedIn && (
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

      {step === 'verify-code' && !isCancelled && !isLoggedIn && (
        <>
          <AIChat sentence="인증번호를 보내드렸어요. 3분 이내에 입력해주세요." />
          <AIChat
            fullWidth
            sentence={
              <div className="flex flex-col gap-2 w-full">
                <SignupField
                  label={
                    <div className="flex items-center justify-between text-[14px] font-semibold mb-1 h-[22.5px]">
                      <span>인증번호</span>
                      <span className="text-semantic-error">
                        {formatTime(remainingSeconds)}
                      </span>
                    </div>
                  }
                  labelClassName="mb-1 text-caption text-fg-tertiary"
                  id="signup-otp"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="인증번호"
                  inputMode="numeric"
                  error={verifyError}
                />
                <Button
                  onClick={handleVerifyCode}
                  disabled={code.trim().length === 0 || isVerifyingCode}
                  className="mb-1.5 mt-2 w-full"
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

      {step === 'credentials' && !isLoggedIn && (
        <>
          <AIChat sentence="로그인에 사용할 이메일과 비밀번호를 입력해주세요." />
          <AIChat
            fullWidth
            sentence={
              <div className="flex flex-col gap-2.5 w-full">
                <div className="text-[16px] font-medium text-fg-tertiary pt-2">
                  계정 정보
                </div>
                <div className="flex flex-col gap-2.5 w-full">
                  <SignupField
                    label="이메일"
                    id="signup-email"
                    type="email"
                    value={credentials.email}
                    onChange={handleCredentialsChange('email')}
                    placeholder="이메일"
                    error={credentialsErrors.email}
                  />
                  <SignupField
                    label="비밀 번호"
                    id="signup-password"
                    type="password"
                    value={credentials.password}
                    onChange={handleCredentialsChange('password')}
                    placeholder="비밀번호 (8자 이상)"
                    error={credentialsErrors.password}
                  />
                  <SignupField
                    label="비밀 번호 확인"
                    id="signup-password-confirm"
                    type="password"
                    value={credentials.passwordConfirm}
                    onChange={handleCredentialsChange('passwordConfirm')}
                    placeholder="비밀번호 확인"
                    error={credentialsErrors.passwordConfirm}
                  />
                  <Button
                    onClick={handleSubmitCredentials}
                    className="mt-2 mb-2 w-full"
                  >
                    다음
                  </Button>
                </div>
              </div>
            }
          />
        </>
      )}

      {step === 'review' && !isLoggedIn && (
        <>
          <AIChat sentence="입력하신 내용을 확인해주세요." />
          <AIChat
            fullWidth
            sentence={
              <div className="flex flex-col gap-3 w-full">
                <div className="text-[16px] font-medium text-fg-tertiary pt-2">
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
                {completeError && <FieldError>{completeError}</FieldError>}
                <div className="flex gap-2 mt-1.5 mb-2">
                  <Button
                    variant="secondary"
                    onClick={handleBackToCredentials}
                    disabled={isCompletingSignup}
                    className="flex-1"
                  >
                    이전
                  </Button>
                  <Button
                    onClick={handleCompleteSignup}
                    disabled={!agreedToPrivacy || isCompletingSignup}
                    className="flex-1"
                  >
                    {isCompletingSignup ? '처리 중...' : '가입 완료하기'}
                  </Button>
                </div>
              </div>
            }
          />
        </>
      )}

      {step === 'completed' && (
        <AIChat
          variant="success"
          sentence="회원가입이 완료되었어요! 🎉
          자동 로그인이 진행되었고, 이전 채팅과 이어서 대화할 수 있습니다."
        />
      )}

      {step === 'already-member' && (
        <AIChat
          variant="success"
          sentence="이미 가입되어 있는 번호예요! 자동으로 로그인했습니다."
        />
      )}
    </div>
  );
}
