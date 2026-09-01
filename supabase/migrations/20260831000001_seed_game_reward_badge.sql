-- 게임 플레이 보상으로 지급되는 배지 카탈로그 row.
-- 게임이 끝나면 game_results.score(=지급 배지 개수)만큼
-- user_badges.balance/total_earned에 누적된다.
INSERT INTO public.badges (id, name, description, type) VALUES
('8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f201', '게임 보상', '미니게임 플레이 보상 배지', 'game')
ON CONFLICT (id) DO NOTHING;