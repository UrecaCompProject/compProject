import { supabase } from '@/shared/lib/supabaseClient';

// 본인인증(OTP)은 SMS Provider(Twilio 등) 연동 비용이 들어, 현재는 mock으로
// 처리한다. 인증번호는 123456만 통과되도록 고정하고, 실제 Provider 연결
// 시 sendSignupOtp/verifySignupOtp를 supabase.auth.signInWithOtp/verifyOtp
// 호출로 교체하면 된다. 이메일/비밀번호 가입(completeSignupProfile)은 비용이
// 들지 않아 실제 Supabase 계정을 생성한다.
const MOCK_DELAY_MS = 500;
const MOCK_VERIFY_CODE = '123456';

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 인증번호(OTP)를 SMS로 발송한다(mock이므로 실제로는 발송하지 않는다).
export async function sendSignupOtp(_phone: string) {
  await wait(MOCK_DELAY_MS);
}

// 인증번호를 확인한다. mock 환경에서는 123456만 통과한다.
export async function verifySignupOtp(_phone: string, code: string) {
  await wait(MOCK_DELAY_MS);

  if (code !== MOCK_VERIFY_CODE) {
    throw new Error('인증번호가 올바르지 않습니다.');
  }

  return { isExistingMember: false };
}

// 이름·생년월일·전화번호를 user_metadata에 담아 이메일/비밀번호로 실제 계정을 생성한다.
export async function postSignup(
  name: string,
  birth: string,
  phone: string,
  email: string,
  password: string,
) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, birth, phone },
    },
  });

  if (error) throw new Error(error.message);
}
