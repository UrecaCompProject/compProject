import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/entities/user';

import { getReport } from '../api/getReport';

// 로그인한 유저의 레포트 목록. 상세 화면은 이 배열의 항목을 그대로 props로
// 받아서 보여주므로 상세용 재조회는 따로 없다.
export function useReports(enabled = true) {
  const userId = useAuth().user?.id;

  return useQuery({
    queryKey: ['reports', userId],
    queryFn: () => getReport(userId!),
    enabled: enabled && !!userId,
  });
}
