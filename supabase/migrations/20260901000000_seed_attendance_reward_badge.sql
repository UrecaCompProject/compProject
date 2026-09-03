-- 출석 체크 보상으로 지급되는 배지 카탈로그 row.
-- 출석 체크가 성공하면 attendances.reward_value(=지급 배지 개수)만큼
-- user_badges.balance/total_earned에 누적된다.
INSERT INTO public.badges (id, name, description, type) VALUES
('1498c68c-7d17-4c8e-9217-e22c5c1298bd', '출석 보상', '출석 체크 보상 배지', 'attendance')
ON CONFLICT (id) DO NOTHING;