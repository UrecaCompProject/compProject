import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase 환경변수가 누락되었습니다. .env.local 에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 를 설정하세요.',
  );
}

// 프론트엔드 전용 클라이언트.
// anon key 를 사용하므로 RLS 정책의 통제를 받는다.
// service_role 키는 브라우저에 절대 노출하면 안 된다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
