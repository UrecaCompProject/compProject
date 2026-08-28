import { createClient } from '@supabase/supabase-js';

function cleanEnvValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  // .env.local 에 키가 여러 줄로 복사되거나 공백/따옴표가 섞인 경우 안전하게 정리
  return value.replace(/\s+/g, '').replace(/^['"`]+|['"`]+$/g, '');
}

const supabaseUrl = cleanEnvValue(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = cleanEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase 환경변수가 누락되었습니다. .env.local 에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 를 설정하세요.',
  );
}

function getAuthStorage() {
  if (typeof window === 'undefined') return undefined;
  const persist = import.meta.env.VITE_PERSIST_AUTH;
  if (persist === 'session') return window.sessionStorage;
  return window.localStorage;
}

// 프론트엔드 전용 클라이언트.
// anon key 를 사용하므로 RLS 정책의 통제를 받는다.
// service_role 키는 브라우저에 절대 노출하면 안 된다.
const persistAuth = import.meta.env.VITE_PERSIST_AUTH !== 'false';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: persistAuth,
    storage: getAuthStorage(),
    autoRefreshToken: persistAuth,
    detectSessionInUrl: true,
  },
});

// 요금제 카탈로그처럼 공개 데이터를 조회할 때 사용하는 anon 전용 클라이언트
export const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: 'supabaseAnon',
  },
});
