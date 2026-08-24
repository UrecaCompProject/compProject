import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { CheckCircle2 } from 'lucide-react';

import AIChat from '@/features/ai-consult/components/AIChat';
import { Button, Input } from '@/features/shared';

type SignupStep = 'basic-info' | 'verify-code' | 'review' | 'completed';

interface BasicInfo {
  name: string;
  birth: string;
  phone: string;
}

type BasicInfoErrors = Partial<Record<keyof BasicInfo, string>>;

const VERIFY_DURATION_SECONDS = 3 * 60;
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function isValidBirth(birth: string) {
  if (!/^\d{6}$/.test(birth)) return false;
  const month = Number(birth.slice(2, 4));
  const day = Number(birth.slice(4, 6));
  if (month < 1 || month > 12) return false;
  return day >= 1 && day <= DAYS_IN_MONTH[month - 1];
}

function isValidPhone(phone: string) {
  const digits = phone.replace(/-/g, '');
  return /^\d{10,11}$/.test(digits);
}

function maskName(name: string) {
  return `${name[0]}***`;
}

function maskBirth(birth: string) {
  return `${birth.slice(0, 2)}****`;
}

function maskPhone(phone: string) {
  const digits = phone.replace(/-/g, '');
  return `${digits.slice(0, 3)}-${'*'.repeat(digits.length - 7)}-${digits.slice(-4)}`;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface SignupChatProps {
  /** 인증 시간 초과로 취소되거나 가입이 완료되어 흐름이 끝났을 때 호출됩니다. */
  onFinish?: () => void;
}

export default function SignupChat({ onFinish }: SignupChatProps) {
  const [step, setStep] = useState<SignupStep>('basic-info');
  const [info, setInfo] = useState<BasicInfo>({
    name: '',
    birth: '',
    phone: '',
  });
  const [errors, setErrors] = useState<BasicInfoErrors>({});
  const [code, setCode] = useState('');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const hasNotifiedFinishRef = useRef(false);

  const remainingSeconds = deadline
    ? Math.max(0, Math.ceil((deadline - now) / 1000))
    : VERIFY_DURATION_SECONDS;
  const isCancelled = step === 'verify-code' && remainingSeconds <= 0;
  const isFinished = isCancelled || step === 'completed';

  useEffect(() => {
    if (isFinished && !hasNotifiedFinishRef.current) {
      hasNotifiedFinishRef.current = true;
      onFinish?.();
    }
  }, [isFinished, onFinish]);

  // setTimeout은 백그라운드 탭에서 브라우저가 임의로 지연/일시정지시킬 수 있어
  // 절대 시각(deadline)과의 차이로 잔여 시간을 계산하고, 탭이 다시 보일 때 즉시 재계산해 보정한다.
  useEffect(() => {
    if (step !== 'verify-code' || remainingSeconds <= 0) return;
    const timer = setTimeout(() => setNow(Date.now()), 1000);
    return () => clearTimeout(timer);
  }, [step, remainingSeconds]);

  useEffect(() => {
    if (step !== 'verify-code') return;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') setNow(Date.now());
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [step]);

  const handleChange =
    (field: keyof BasicInfo) => (e: ChangeEvent<HTMLInputElement>) => {
      setInfo((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmitBasicInfo = () => {
    const nextErrors: BasicInfoErrors = {};
    if (info.name.trim().length < 2) {
      nextErrors.name = '이름을 정확히 입력해주세요.';
    }
    if (!isValidBirth(info.birth)) {
      nextErrors.birth = '생년월일 6자리를 정확히 입력해주세요.';
    }
    if (!isValidPhone(info.phone)) {
      nextErrors.phone = '전화번호를 정확히 입력해주세요.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setNow(Date.now());
    setDeadline(Date.now() + VERIFY_DURATION_SECONDS * 1000);
    setStep('verify-code');
  };

  const handleVerifyCode = () => {
    if (code.trim().length !== 6) return;
    // TODO: 실제 인증번호 확인 API 연동
    setStep('review');
  };

  const handleCompleteSignup = () => {
    if (!agreedToPrivacy) return;
    // TODO: 실제 회원가입 API 연동
    setStep('completed');
  };

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
