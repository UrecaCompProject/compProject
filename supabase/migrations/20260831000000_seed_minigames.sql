-- 리워드 미션 목록(mocks/missions.ts)의 게임 미션에 대응하는 games 카탈로그 row.
-- id는 missions.ts에 이미 박혀있던 mission.uuid와 동일하게 맞춰서, 프론트에서 별도 매핑 없이
-- mission.uuid를 그대로 game_results.game_id로 쓸 수 있게 한다. (친구 공유는 게임이 아니라 제외)
INSERT INTO public.games (id, type, name) VALUES
('8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f101', 'card-match', '카드 맞추기'),
('8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f102', 'reaction', '반응속도 탭 게임'),
('8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f103', 'attendance', '출석 룰렛'),
('8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f104', 'scratch', '스크래치 이벤트'),
('8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f105', 'security-quiz', '보안 OX 퀴즈'),
('8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f106', 'telecom-quiz', '통신 상식 퀴즈')
ON CONFLICT (id) DO NOTHING;