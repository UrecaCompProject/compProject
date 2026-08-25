import { supabase } from '@/lib/supabaseClient';

// 이름·생년월일을 user_metadata에 담아 이메일/비밀번호로 실제 Supabase 계정을 생성한다.
export async function postSignup(
  name: string,
  birth: string,
  email: string,
  password: string,
) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, birth },
    },
  });

  if (error) throw new Error(error.message);
}
