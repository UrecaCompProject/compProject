import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { postSignup, sendSignupOtp, verifySignupOtp } from '../api/postSignup';
import { isValidBirth, isValidEmail, isValidPassword } from '../utils/signup';

import { useCountdown } from './useCountdown';

const VERIFY_DURATION_SECONDS = 3 * 60;

export type SignupStep =
  | 'basic-info'
  | 'verify-code'
  | 'credentials'
  | 'review'
  | 'completed'
  | 'already-member';

export interface BasicInfo {
  name: string;
  birth: string;
  phone: string;
}

export type BasicInfoErrors = Partial<Record<keyof BasicInfo, string>>;

export interface Credentials {
  email: string;
  password: string;
  passwordConfirm: string;
}

export type CredentialsErrors = Partial<Record<keyof Credentials, string>>;

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
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [code, setCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [credentials, setCredentials] = useState<Credentials>({
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [credentialsErrors, setCredentialsErrors] = useState<CredentialsErrors>(
    {},
  );

  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [isCompletingSignup, setIsCompletingSignup] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const hasNotifiedFinishRef = useRef(false);

  const {
    remainingSeconds,
    isExpired,
    start: startVerifyCountdown,
  } = useCountdown(VERIFY_DURATION_SECONDS);
  const isCancelled = step === 'verify-code' && isExpired;
  const isFinished =
    isCancelled || step === 'completed' || step === 'already-member';

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

  const handleSubmitBasicInfo = async () => {
    const nextErrors: BasicInfoErrors = {};
    if (info.name.trim().length < 2) {
      nextErrors.name = '이름을 정확히 입력해주세요.';
    }
    if (!isValidBirth(info.birth)) {
      nextErrors.birth = '생년월일 6자리를 정확히 입력해주세요.';
    }
    if (info.phone.trim().length === 0) {
      nextErrors.phone = '전화번호를 입력해주세요.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSendingOtp(true);
    try {
      await sendSignupOtp(info.phone);
      startVerifyCountdown();
      setStep('verify-code');
    } catch (error) {
      setErrors({
        phone:
          error instanceof Error
            ? error.message
            : '인증번호 발송에 실패했습니다.',
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.trim().length === 0) return;

    setIsVerifyingCode(true);
    setVerifyError(null);
    try {
      const { isExistingMember } = await verifySignupOtp(info.phone, code);
      setStep(isExistingMember ? 'already-member' : 'credentials');
    } catch (error) {
      setVerifyError(
        error instanceof Error
          ? error.message
          : '인증번호가 올바르지 않습니다.',
      );
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleCredentialsChange =
    (field: keyof Credentials) => (e: ChangeEvent<HTMLInputElement>) => {
      setCredentials((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmitCredentials = () => {
    const nextErrors: CredentialsErrors = {};
    if (!isValidEmail(credentials.email)) {
      nextErrors.email = '이메일 형식을 정확히 입력해주세요.';
    }
    if (!isValidPassword(credentials.password)) {
      nextErrors.password = '비밀번호는 8자 이상이어야 해요.';
    }
    if (credentials.password !== credentials.passwordConfirm) {
      nextErrors.passwordConfirm = '비밀번호가 일치하지 않아요.';
    }

    setCredentialsErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStep('review');
  };

  const handleCompleteSignup = async () => {
    if (!agreedToPrivacy) return;

    setIsCompletingSignup(true);
    setCompleteError(null);
    try {
      await postSignup(
        info.name,
        info.birth,
        info.phone,
        credentials.email,
        credentials.password,
      );
      setStep('completed');
    } catch (error) {
      setCompleteError(
        error instanceof Error
          ? error.message
          : '회원가입 완료에 실패했습니다.',
      );
    } finally {
      setIsCompletingSignup(false);
    }
  };

  return {
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
  };
}
