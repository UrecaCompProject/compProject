import { supabase } from '@/shared/lib/supabaseClient';

// 본인인증(OTP)은 SMS Provider(Twilio 등) 연동 비용이 들어, 현재는 mock으로
// 처리한다. 인증번호는 어떤 값을 입력해도 통과되도록 하고, 실제 Provider 연결
// 시 sendSignupOtp/verifySignupOtp를 supabase.auth.signInWithOtp/verifyOtp
// 호출로 교체하면 된다. 이메일/비밀번호 가입(completeSignupProfile)은 비용이
// 들지 않아 실제 Supabase 계정을 생성한다.
const MOCK_DELAY_MS = 500;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 인증번호(OTP)를 SMS로 발송한다(mock이므로 실제로는 발송하지 않는다).
export async function sendSignupOtp(_phone: string) {
  await wait(MOCK_DELAY_MS);
}

// SMS로 받은 인증번호를 확인한다. 현재는 어떤 번호/인증번호 조합이든 통과한다.
export async function verifySignupOtp(_phone: string, _code: string) {
  await wait(MOCK_DELAY_MS);

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
