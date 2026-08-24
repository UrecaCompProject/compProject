import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { isValidBirth, isValidPhone } from '../utils/signup';

import { useCountdown } from './useCountdown';

const VERIFY_DURATION_SECONDS = 3 * 60;

export type SignupStep = 'basic-info' | 'verify-code' | 'review' | 'completed';

export interface BasicInfo {
  name: string;
  birth: string;
  phone: string;
}

export type BasicInfoErrors = Partial<Record<keyof BasicInfo, string>>;

// SignupChat의 스텝 전환·인증 타이머·form 상태를 한데 묶어서 내려준다.
// 각 SignupChat 인스턴스(=시도)마다 독립적인 로컬 상태를 가진다 — 채팅 로그에
// 여러 시도가 동시에 남아있을 수 있어 전역 상태로 두면 서로 간섭한다.
export function useSignupFlow(onFinish?: () => void) {
  const [step, setStep] = useState<SignupStep>('basic-info');
  const [info, setInfo] = useState<BasicInfo>({
    name: '',
    birth: '',
    phone: '',
  });
  const [errors, setErrors] = useState<BasicInfoErrors>({});
  const [code, setCode] = useState('');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const hasNotifiedFinishRef = useRef(false);

  const {
    remainingSeconds,
    isExpired,
    start: startVerifyCountdown,
  } = useCountdown(VERIFY_DURATION_SECONDS);
  const isCancelled = step === 'verify-code' && isExpired;
  const isFinished = isCancelled || step === 'completed';

  useEffect(() => {
    if (isFinished && !hasNotifiedFinishRef.current) {
      hasNotifiedFinishRef.current = true;
      onFinish?.();
    }
  }, [isFinished, onFinish]);

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

    startVerifyCountdown();
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

  return {
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
  };
}
