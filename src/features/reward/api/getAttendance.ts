import dayjs from 'dayjs';

import { supabase } from '@/shared/lib/supabaseClient';

export type AttendanceRow = {
  date: string;
};

// userId의 startDate~endDate(포함) 사이 출석 기록을 조회한다.
export async function getAttendances(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<AttendanceRow[]> {
  const { data, error } = await supabase
    .from('attendances')
    .select('date')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) {
    throw new Error(`출석 조회 실패: ${error.message}`);
  }

  return (data ?? []) as AttendanceRow[];
}

// userId의 연속 출석일(attendance_streaks.current_streak)을 조회한다.
// 출석 기록이 아예 없는 유저는 row가 없을 수 있어 그 경우 0을 반환한다.
// last_attended_at이 오늘도 어제도 아니면(하루 이상 건너뜀) 연속이 끊긴 것이므로,
// 다음 체크인 전까지 DB에 남아있는 값과 무관하게 0으로 보여준다.
export async function getAttendanceStreak(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('attendance_streaks')
    .select('current_streak, last_attended_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`연속 출석일 조회 실패: ${error.message}`);
  }

  if (!data) return 0;

  const today = dayjs().format('YYYY-MM-DD');
  const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
  const isBroken =
    data.last_attended_at !== today && data.last_attended_at !== yesterday;

  return isBroken ? 0 : data.current_streak;
}
