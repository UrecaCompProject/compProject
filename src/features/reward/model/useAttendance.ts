import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { useAuth, useIsLoggedIn } from '@/entities/user';

import { getAttendanceStreak, getAttendances } from '../api/getAttendance';
import { postCheckIn } from '../api/postCheckIn';

// 월요일을 0으로 보는 요일 인덱스 (일요일=0인 Date.getDay()를 보정)
function toMondayStartIndex(date: dayjs.Dayjs) {
  return (date.day() + 6) % 7;
}

// 이번 주 월~일 7일의 날짜(YYYY-MM-DD)를 반환한다.
function getWeekDates(): string[] {
  const today = dayjs();
  const monday = today.subtract(toMondayStartIndex(today), 'day');
  return Array.from({ length: 7 }, (_, i) =>
    monday.add(i, 'day').format('YYYY-MM-DD'),
  );
}

// 이번 주 요일별 출석 여부와 연속 출석일을 조회하는 훅.
export function useAttendance() {
  const { user } = useAuth();
  const isLoggedIn = useIsLoggedIn();
  const queryClient = useQueryClient();

  const weekDates = getWeekDates();
  const todayIndex = toMondayStartIndex(dayjs());

  const { data: attendanceRows = [] } = useQuery({
    queryKey: ['attendance', 'week', user?.id, weekDates[0]],
    queryFn: () => getAttendances(user!.id, weekDates[0], weekDates[6]),
    enabled: isLoggedIn && !!user,
  });

  const { data: currentStreak = 0 } = useQuery({
    queryKey: ['attendance', 'streak', user?.id],
    queryFn: () => getAttendanceStreak(user!.id),
    enabled: isLoggedIn && !!user,
  });

  const checkInMutation = useMutation({
    mutationFn: postCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  const attendedDates = new Set(attendanceRows.map((row) => row.date));
  const weekChecks = weekDates.map((date) => attendedDates.has(date));

  return {
    weekDates,
    weekChecks,
    todayIndex,
    currentStreak,
    checkIn: checkInMutation.mutateAsync,
    isCheckingIn: checkInMutation.isPending,
  };
}
