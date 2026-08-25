import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { postSignup } from '../api/postSignup';
import { isValidBirth, isValidEmail, isValidPassword } from '../utils/signup';

export type SignupStep = 'basic-info' | 'credentials' | 'review' | 'completed';

export interface BasicInfo {
  name: string;
  birth: string;
}

export type BasicInfoErrors = Partial<Record<keyof BasicInfo, string>>;

export interface Credentials {
  email: string;
  password: string;
  passwordConfirm: string;
}

export type CredentialsErrors = Partial<Record<keyof Credentials, string>>;

// SignupChat의 스텝 전환·form 상태를 한데 묶어서 내려준다.
export function useSignupFlow(onFinish?: () => void) {
  const [step, setStep] = useState<SignupStep>('basic-info');
  const [info, setInfo] = useState<BasicInfo>({
    name: '',
    birth: '',
  });
  const [errors, setErrors] = useState<BasicInfoErrors>({});

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

  const isFinished = step === 'completed';

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

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStep('credentials');
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
    credentials,
    credentialsErrors,
    agreedToPrivacy,
    isCompletingSignup,
    completeError,
    setAgreedToPrivacy,
    handleChange,
    handleSubmitBasicInfo,
    handleCredentialsChange,
    handleSubmitCredentials,
    handleCompleteSignup,
  };
}
