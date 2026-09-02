import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { postSignup, sendSignupOtp, verifySignupOtp } from '../api/postSignup';
import {
  isValidBirth,
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidPhone,
} from '../lib/signup';

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

  // 필드별 입력 필터링 — 생년월일/전화번호는 숫자만 허용.
  // 이름은 IME 조합 중인 자모(ㄱ-ㅎ, ㅏ-ㅣ)가 [가-힣] 범위 밖이라
  // 입력 중 잘리는 현상을 막기 위해 입력 시 필터링하지 않고 검증 단계에서만 체크한다.
  const handleChange =
    (field: keyof BasicInfo) => (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (field === 'birth') {
        const filtered = raw.replace(/\D/g, '').slice(0, 6);
        setInfo((prev) => ({ ...prev, birth: filtered }));
      } else if (field === 'phone') {
        const filtered = raw.replace(/\D/g, '').slice(0, 11);
        setInfo((prev) => ({ ...prev, phone: filtered }));
      } else {
        setInfo((prev) => ({ ...prev, [field]: raw }));
      }
    };

  const handleSubmitBasicInfo = async () => {
    const nextErrors: BasicInfoErrors = {};
    if (!isValidName(info.name)) {
      nextErrors.name = '이름은 한글 2자 이상으로 입력해주세요.';
    }
    if (!isValidBirth(info.birth)) {
      nextErrors.birth = '생년월일 6자리를 정확히 입력해주세요.';
    }
    if (!isValidPhone(info.phone)) {
      nextErrors.phone = '전화번호 10~11자리를 입력해주세요.';
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

    // 인증번호는 숫자 6자리여야 함
    if (!/^\d{6}$/.test(code.trim())) {
      setVerifyError('인증번호 6자리 숫자를 입력해주세요.');
      return;
    }

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

  // review 단계에서 credentials 단계로 되돌아간다 — 이메일 중복 등 가입 실패 시
  // 이메일·비밀번호를 수정할 수 있도록 한다. completeError도 함께 초기화.
  const handleBackToCredentials = () => {
    setCompleteError(null);
    setAgreedToPrivacy(false);
    setStep('credentials');
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
    handleBackToCredentials,
  };
}
