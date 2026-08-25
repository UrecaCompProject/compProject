-- plans 카탈로그는 비로그인자(anon)도 조회할 수 있도록 SELECT 정책 확장

DROP POLICY IF EXISTS "plans_select_active" ON public.plans;

CREATE POLICY "plans_select_active"
  ON public.plans FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
