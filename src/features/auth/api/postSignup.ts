import { supabase } from '@/lib/supabaseClient';

// SMS Provider(Twilio 등) 연동에 비용이 들어, 본인인증(OTP)만 실제 발송 없이
// 테스트용 번호/인증번호 조합으로 통과하는 mock으로 구현했다. 나중에 Provider를
// 연결하면 sendSignupOtp/verifySignupOtp를 supabase.auth.signInWithOtp/verifyOtp
// 호출로 교체하면 된다. 이메일/비밀번호 가입(completeSignupProfile)은 비용이 들지
// 않아 실제 Supabase 계정을 생성한다.
const MOCK_PHONE = '01099826381';
const MOCK_OTP_CODE = '144768';
const MOCK_DELAY_MS = 500;

function normalizePhone(phone: string) {
  return phone.replace(/-/g, '');
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 인증번호(OTP)를 SMS로 발송한다(mock이므로 실제로는 발송하지 않는다).
export async function sendSignupOtp(_phone: string) {
  await wait(MOCK_DELAY_MS);
}

// SMS로 받은 인증번호를 확인한다.
// 테스트 번호(01099826381) + 인증번호(144768) 조합일 때만 통과한다.
export async function verifySignupOtp(phone: string, code: string) {
  await wait(MOCK_DELAY_MS);

  const isValid =
    normalizePhone(phone) === MOCK_PHONE && code === MOCK_OTP_CODE;
  if (!isValid) throw new Error('인증번호가 올바르지 않습니다.');

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
