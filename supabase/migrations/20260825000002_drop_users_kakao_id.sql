-- public.users 에서 카카오 연동 컬럼 제거

ALTER TABLE public.users
  DROP COLUMN IF EXISTS kakao_id;

-- auth.users INSERT 시 public.users에 동기화 (kakao_id 제외)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    phone,
    nickname,
    age_group
  )
  VALUES (
    NEW.id,
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
