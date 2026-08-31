import { useRef } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth, useIsLoggedIn } from '@/entities/user';

import { getTodayPlayedGameIds, recordGamePlay } from '../api/getGameResult';

// 오늘 이미 플레이한 게임 미션(mission.uuid === game_results.game_id)을 조회하고,
// 게임이 끝났을 때 플레이 기록을 남기는 훅.
export function useMissionCompletion() {
  const { user } = useAuth();
  const isLoggedIn = useIsLoggedIn();
  const queryClient = useQueryClient();

  const { data: playedGameIds = [] } = useQuery({
    queryKey: ['game-results', 'today', user?.id],
    queryFn: () => getTodayPlayedGameIds(user!.id),
    enabled: isLoggedIn && !!user,
  });

  const recordPlayMutation = useMutation({
    mutationFn: ({ gameId, score }: { gameId: string; score?: number }) =>
      recordGamePlay(user!.id, gameId, score),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-results', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['badge', 'balance'] });
    },
    onError: (error) => {
      console.error('게임 결과 저장/배지 적립 실패:', error);
    },
  });

  // 서버 응답(쿼리 무효화)이 오기 전에 같은 게임의 onWin이 짧은 시간에 여러 번 불려도
  // 이 세션에서는 최초 1번만 실제로 기록을 시도하도록 동기적으로 막는다.
  // (서버 실패 시 재시도할 수 있도록, 이미 오늘 플레이한 게임은 여기서 제외한다.)
  const submittedRef = useRef<Set<string>>(new Set());
  const recordPlay: typeof recordPlayMutation.mutate = (variables, options) => {
    if (
      playedGameIds.includes(variables.gameId) ||
      submittedRef.current.has(variables.gameId)
    ) {
      return;
    }
    submittedRef.current.add(variables.gameId);
    recordPlayMutation.mutate(variables, options);
  };

  return {
    playedTodayGameIds: new Set(playedGameIds),
    recordPlay,
  };
}
