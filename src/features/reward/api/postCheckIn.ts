import dayjs from 'dayjs';

import { supabase } from '@/shared/lib/supabaseClient';

import { addBadgeBalance } from './getBadge';

export type CheckInResult = {
  streak: number;
  badgeCount: number;
};

// 출석 1회당 지급하는 배지 수 (attendances.reward_type/reward_value 시드 값과 동일)
const CHECK_IN_REWARD_VALUE = 1;

// 출석 체크 보상이 적립되는 배지 (20260901000000_seed_attendance_reward_badge.sql 참고)
const ATTENDANCE_REWARD_BADGE_ID = '1498c68c-7d17-4c8e-9217-e22c5c1298bd';

// 출석 체크: attendances에 오늘 날짜로 기록을 추가하고,
// attendance_streaks의 연속 출석일을 규칙에 맞게 갱신한다.
// - 어제까지 연속 출석 중이었다면 current_streak += 1
// - 연속이 끊긴 상태(어제 미출석/최초 출석)였다면 current_streak = 1
export async function postCheckIn(): Promise<CheckInResult> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('로그인이 필요합니다.');
  }
  const userId = userData.user.id;

  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

  const { data: attendance, error: attendanceError } = await supabase
    .from('attendances')
    .insert({
      user_id: userId,
      date: today,
      reward_type: 'badge',
      reward_value: CHECK_IN_REWARD_VALUE,
    })
    .select('reward_value')
    .single();

  if (attendanceError) {
    if (attendanceError.code === '23505') {
      throw new Error('오늘 이미 출석 체크를 완료했습니다.');
    }
    throw new Error(`출석 체크 실패: ${attendanceError.message}`);
  }

  const { data: streak, error: streakError } = await supabase
    .from('attendance_streaks')
    .select('current_streak, longest_streak, last_attended_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (streakError) {
    throw new Error(`연속 출석일 조회 실패: ${streakError.message}`);
  }

  const isContinuing = streak?.last_attended_at === yesterday;
  const nextStreak = isContinuing ? streak!.current_streak + 1 : 1;
  const nextLongest = Math.max(streak?.longest_streak ?? 0, nextStreak);

  const { error: upsertError } = await supabase
    .from('attendance_streaks')
    .upsert(
      {
        user_id: userId,
        current_streak: nextStreak,
        longest_streak: nextLongest,
        last_attended_at: today,
      },
      { onConflict: 'user_id' },
    );

  if (upsertError) {
    throw new Error(`연속 출석일 갱신 실패: ${upsertError.message}`);
  }

  await addBadgeBalance(
    userId,
    ATTENDANCE_REWARD_BADGE_ID,
    attendance.reward_value,
  );

  return { streak: nextStreak, badgeCount: attendance.reward_value };
}
