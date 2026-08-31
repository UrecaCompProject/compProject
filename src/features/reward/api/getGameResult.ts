import dayjs from 'dayjs';

import { supabase } from '@/shared/lib/supabaseClient';

// 게임 플레이 보상이 적립되는 배지 (20260831000001_seed_game_reward_badge.sql 참고)
const GAME_REWARD_BADGE_ID = '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f201';

function todayRange() {
  return {
    startOfToday: dayjs().startOf('day').toISOString(),
    startOfTomorrow: dayjs().add(1, 'day').startOf('day').toISOString(),
  };
}

// userId가 오늘 플레이한 게임의 game_id 목록을 조회한다.
// (game_results에 오늘 날짜 row가 있는 game_id = 오늘 이미 플레이한 게임)
export async function getTodayPlayedGameIds(userId: string): Promise<string[]> {
  const { startOfToday, startOfTomorrow } = todayRange();

  const { data, error } = await supabase
    .from('game_results')
    .select('game_id')
    .eq('user_id', userId)
    .gte('played_at', startOfToday)
    .lt('played_at', startOfTomorrow);

  if (error) {
    throw new Error(`게임 플레이 기록 조회 실패: ${error.message}`);
  }

  return (data ?? []).map((row) => row.game_id);
}

// userId가 오늘 이 게임을 이미 플레이했는지 확인한다.
async function hasPlayedToday(
  userId: string,
  gameId: string,
): Promise<boolean> {
  const { startOfToday, startOfTomorrow } = todayRange();

  const { data, error } = await supabase
    .from('game_results')
    .select('id')
    .eq('user_id', userId)
    .eq('game_id', gameId)
    .gte('played_at', startOfToday)
    .lt('played_at', startOfTomorrow)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`게임 플레이 기록 조회 실패: ${error.message}`);
  }

  return data !== null;
}

// 게임이 끝났을 때 오늘의 플레이 기록을 남기고, 보상만큼 배지 잔액을 적립한다.
// 오늘 이미 이 게임을 플레이한 기록이 있으면(user_id, game_id) 아무것도 하지 않는다 — 하루 1회 제한.
export async function recordGamePlay(
  userId: string,
  gameId: string,
  score = 0,
): Promise<void> {
  if (await hasPlayedToday(userId, gameId)) return;

  const { error } = await supabase
    .from('game_results')
    .insert({ user_id: userId, game_id: gameId, score });

  if (error) {
    throw new Error(`게임 결과 저장 실패: ${error.message}`);
  }

  if (score <= 0) return;

  await addBadgeReward(userId, score);
}

// user_badges의 balance/total_earned에 reward만큼 더하고 updated_at을 갱신한다.
async function addBadgeReward(userId: string, reward: number): Promise<void> {
  const { data: existing, error: selectError } = await supabase
    .from('user_badges')
    .select('balance, total_earned')
    .eq('user_id', userId)
    .eq('badge_id', GAME_REWARD_BADGE_ID)
    .maybeSingle();

  if (selectError) {
    throw new Error(`배지 잔액 조회 실패: ${selectError.message}`);
  }

  const { error: upsertError } = await supabase.from('user_badges').upsert(
    {
      user_id: userId,
      badge_id: GAME_REWARD_BADGE_ID,
      balance: (existing?.balance ?? 0) + reward,
      total_earned: (existing?.total_earned ?? 0) + reward,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,badge_id' },
  );

  if (upsertError) {
    throw new Error(`배지 잔액 적립 실패: ${upsertError.message}`);
  }
}
