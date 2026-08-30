-- current_plans에 write API(postChangePlan)를 처음 붙이면서 발견된 문제:
-- 이 테이블엔 authenticated 롤에 대한 기본 GRANT가 빠져있어 upsert가
-- "permission denied for table current_plans"로 실패한다.
-- RLS 정책(current_plans_owner)은 정상이라 행 단위 제한은 그대로 유지된다.

GRANT SELECT, INSERT, UPDATE ON public.current_plans TO authenticated;
