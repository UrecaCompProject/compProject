-- public.users kakao_id nullable 변경 및 auth.users 가입 연동

-- 이메일/비밀번호 가입 등 kakao_id를 사용하지 않는 경우를 허용
ALTER TABLE public.users
  ALTER COLUMN kakao_id DROP NOT NULL;

-- auth.users INSERT 시 public.users에 동기화
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    kakao_id,
    email,
    phone,
    nickname,
    age_group
  )
  VALUES (
    NEW.id,
    NULL,
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1), '사용자'),
    COALESCE(NEW.raw_user_meta_data ->> 'age_group', '미제공')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Supabase Auth 가입 시 public.users 프로필 row를 자동 생성합니다.';

DROP TRIGGER IF EXISTS trg_auth_users_insert ON auth.users;
CREATE TRIGGER trg_auth_users_insert
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
