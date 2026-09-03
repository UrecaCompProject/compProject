import { useState } from 'react';

import { BottomSheet, useModalStore } from '@/shared';
import type { GameInfrastructure } from '@/shared/types/games';
import type { QuizKind } from '@/shared/types/quiz';

import { useMissionCompletion } from '../model/useMissionCompletion';

import MyCouponContent from './coupon/MyCouponContent';
import GetBadgeModal from './GetBadgeModal';
import RewardHome from './RewardHome';
import StoreContent from './store/StoreContent';

import type { Mission } from '../types';

type RewardSheetProps = {
  game: GameInfrastructure;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartQuiz?: (quizType: QuizKind) => void;
  onStartScratch?: (reward?: number) => void;
};

type RewardView = 'reward' | 'store' | 'coupon';

export default function RewardSheet({
  game,
  open,
  onOpenChange,
  onStartQuiz,
  onStartScratch,
}: RewardSheetProps) {
  const [activeView, setActiveView] = useState<RewardView>('reward');
  // activeView가 바뀔 때마다 증가 — 상점 등 하위 화면에 key로 넘겨서
  // 다시 들어올 때마다 검색어 같은 로컬 상태가 초기화된 채로 새로 마운트되게 한다.
  const [viewEntryKey, setViewEntryKey] = useState(0);
  const goToView = (view: RewardView) => {
    setActiveView(view);
    setViewEntryKey((key) => key + 1);
  };
  const { activeGameMeta, openGame, closeGame, isGameId, GameLayer } = game;
  const { recordPlay } = useMissionCompletion();
  const openModal = useModalStore((state) => state.open);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      goToView('reward');
      closeGame();
    }

    onOpenChange(nextOpen);
  };

  const handleBack = () => {
    goToView('reward');
  };

  const handleMissionAction = (mission: Mission) => {
    // 스크래치 이벤트는 GameLayer(바텀시트)가 아니라 채팅 쪽에서 진행한다.
    // isGameId보다 먼저 체크해야 한다 — GameId 타입에는 더 이상 'scratch'가 없지만,
    // 혹시 남아있더라도 이 분기가 우선한다.
    if (mission.id === 'scratch') {
      handleOpenChange(false);
      // 스크래치 보상은 ScratchGame이 1~5 중 랜덤으로 정한다.
      // 여기서 고정값을 넘기면 랜덤이 무시되므로 아무것도 넘기지 않는다.
      onStartScratch?.();
      return;
    }

    if (isGameId(mission.id)) {
      // source: 'reward'로 열면 ChatPage의 채팅 전용 게임 시트는 열리지 않고,
      // 이 시트(RewardSheet) 안의 GameLayer가 게임을 보여준다.
      // 게임이 끝나면(closeGame) 이 시트는 계속 열려있던 상태라 자연스럽게 미션 목록으로 돌아간다.
      openGame(mission.id, {
        reward: mission.reward,
        source: 'reward',
        onWin: (reward) =>
          recordPlay(
            { gameId: mission.uuid, score: reward },
            {
              onSuccess: () => {
                openModal({ content: <GetBadgeModal badgeCount={reward} /> });
              },
            },
          ),
      });
      return;
    }

    const quizTypeByMissionId: Partial<Record<string, QuizKind>> = {
      'security-quiz': 'ox',
      'telecom-quiz': 'multiple-choice',
    };
    const quizType = quizTypeByMissionId[mission.id];
    if (!quizType || !onStartQuiz) return;

    handleOpenChange(false);
    onStartQuiz(quizType);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={activeGameMeta?.title ?? '혜택/이벤트'}
      onBack={
        activeGameMeta?.onBack ??
        (activeView === 'reward' ? undefined : handleBack)
      }
      size="full"
      bodyClassName={
        activeGameMeta || activeView !== 'coupon'
          ? 'px-0'
          : 'bg-surface-page px-5 py-4'
      }
      scrollResetKey={viewEntryKey}
    >
      <GameLayer>
        {activeView === 'reward' && (
          <RewardHome
            onStoreClick={() => goToView('store')}
            onCouponClick={() => goToView('coupon')}
            onMissionAction={handleMissionAction}
          />
        )}

        {activeView === 'store' && (
          <StoreContent
            key={viewEntryKey}
            onGoToCoupon={() => goToView('coupon')}
          />
        )}

        {activeView === 'coupon' && (
          <MyCouponContent onGoToReward={handleBack} />
        )}
      </GameLayer>
    </BottomSheet>
  );
}
