import { useRef } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth, useIsLoggedIn } from '@/entities/user';

import { getTodayPlayedGames, recordGamePlay } from '../api/getGameResult';

// 오늘 이미 플레이한 게임 미션(mission.uuid === game_results.game_id)을 조회하고,
// 게임이 끝났을 때 플레이 기록을 남기는 훅.
export function useMissionCompletion() {
  const { user } = useAuth();
  const isLoggedIn = useIsLoggedIn();
  const queryClient = useQueryClient();

  const { data: playedGames = [] } = useQuery({
    queryKey: ['game-results', 'today', user?.id],
    queryFn: () => getTodayPlayedGames(user!.id),
    enabled: isLoggedIn && !!user,
  });

  const recordPlayMutation = useMutation({
    mutationFn: ({ gameId, score }: { gameId: string; score?: number }) =>
      recordGamePlay(user!.id, gameId, score),
    onSuccess: () => {
      // 스크래치처럼 게임을 채팅에서 진행하는 경우, 적립 시점엔 배지 잔액·미션
      // 목록 화면(혜택 시트)이 언마운트 상태다. refetchType: 'all'로 지정해
      // 안 떠 있는 쿼리도 즉시 다시 불러오게 한다. (기본값은 'active'뿐)
      queryClient.invalidateQueries({
        queryKey: ['game-results', 'today'],
        refetchType: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: ['badge', 'balance'],
        refetchType: 'all',
      });
    },
    onError: (error, variables) => {
      // 실패한 게임은 in-flight 표시를 풀어서 다시 시도할 수 있게 한다.
      submittedRef.current.delete(variables.gameId);
      console.error('게임 결과 저장/배지 적립 실패:', error);
    },
  });

  // 서버 응답(쿼리 무효화)이 오기 전에 같은 게임의 onWin이 짧은 시간에 여러 번 불려도
  // 이 세션에서는 최초 1번만 실제로 기록을 시도하도록 동기적으로 막는다.
  // (서버 실패 시 onError에서 이 Set에서 제거되므로 재시도할 수 있다.)
  const submittedRef = useRef<Set<string>>(new Set());
  const recordPlay: typeof recordPlayMutation.mutate = (variables, options) => {
    if (
      playedGames.some((game) => game.gameId === variables.gameId) ||
      submittedRef.current.has(variables.gameId)
    ) {
      return;
    }
    submittedRef.current.add(variables.gameId);
    recordPlayMutation.mutate(variables, options);
  };

  return {
    playedTodayGameIds: new Set(playedGames.map((game) => game.gameId)),
    // 미션(uuid) → 오늘 그 게임에서 획득한 배지 수
    earnedScoreByMission: new Map(
      playedGames.map((game) => [game.gameId, game.score]),
    ),
    recordPlay,
  };
}
