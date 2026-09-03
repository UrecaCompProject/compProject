import { useEffect, useMemo, useState } from 'react';

import {
  ChatInput,
  ChatMessageList,
  QuickReplies,
  RefreshCheckModal,
} from '@/features/ai-consult';
import {
  findLastRecommendations,
  getWelcomeQuickReplies,
} from '@/features/ai-consult/lib/chatHelpers';
import { useChat } from '@/features/ai-consult/model/useChat';
import ReportGenerateButton from '@/features/ai-consult/ui/ReportGenerateButton';
import { SigninModal, SignupChat } from '@/features/auth';
import { ChatQuizMessage } from '@/features/chat-quiz';
import {
  ReportCard,
  ReportGenerateConfirmModal,
  ReportSheet,
} from '@/features/consult-report';
import {
  GameLayer,
  ScratchGame,
  isGameId,
  useActiveGameMeta,
  useGameStore,
} from '@/features/games';
import PlanCompare from '@/features/plan-change/ui/PlanCompare';
import { CompareResultSheet } from '@/features/plan-compare';
import { PlanQuickSheet } from '@/features/plan-detail';
import PlanDetailContent from '@/features/plan-detail/ui/PlanDetailContent';
import { PlanSubscriptionSheet } from '@/features/plan-subscription';
import {
  GetBadgeModal,
  missions,
  RewardSheet,
  useAttendance,
  useMissionCompletion,
} from '@/features/reward';
import { MyPageSheet } from '@/features/usage';
import { BottomSheet, useModalStore, useSignupIntentStore } from '@/shared';
import type { QuizKind } from '@/shared/types/quiz';

export default function ChatPage() {
  const [isQuickRepliesCollapsed, setIsQuickRepliesCollapsed] = useState(false);
  const [isReportButtonScrollVisible, setIsReportButtonScrollVisible] =
    useState(true);

  const { recordPlay, playedTodayGameIds } = useMissionCompletion();
  const { checkIn, weekChecks, todayIndex } = useAttendance();
  const openGame = useGameStore((state) => state.openGame);
  const closeGame = useGameStore((state) => state.closeGame);
  const activeGameMeta = useActiveGameMeta();

  const scratchMissionUuid = missions.find((m) => m.id === 'scratch')?.uuid;
  const quizMissionUuids: Partial<Record<QuizKind, string>> = {
    ox: missions.find((m) => m.id === 'security-quiz')?.uuid,
    'multiple-choice': missions.find((m) => m.id === 'telecom-quiz')?.uuid,
  };

  const {
    messages,
    input,
    setInput,
    isLoading,
    isGeneratingReport,
    canShowReportButton,
    handleSend,
    handleStop,
    handleRegenerate,
    handleEditMessage,
    handleSignupFinished,
    openSignupChat,
    requireLogin,
    handleFormSubmit,
    handleGenerateReport,
    handlePlanCompare,
    fetchCompare,
    profile,
    subscriptionOpen,
    subscriptionPlan,
    openSubscription,
    closeSubscription,
    isLoggedIn,
    startQuiz,
    startScratch,
    onScratchWin,
    answerOx,
    selectMultipleChoice,
    confirmMultipleChoice,
    closeSheetGame,
  } = useChat({
    signinModal: SigninModal,
    mission: { recordPlay, playedTodayGameIds },
    game: { openGame, closeGame },
    reward: { GetBadgeModal, scratchMissionUuid, quizMissionUuids },
    attendance: { checkIn, isCheckedInToday: weekChecks[todayIndex] },
  });

  const openModal = useModalStore((state) => state.open);

  const gameInfrastructure = useMemo(
    () => ({
      GameLayer,
      isGameId,
      activeGameMeta,
      openGame,
      closeGame,
    }),
    [activeGameMeta, openGame, closeGame],
  );

  // CompareResultSheet, PlanQuickSheet, ReportSheet는 내부적으로 다른 feature의
  // 컴포넌트를 slot으로 주입받아야 한다. ChatPage에서 slot을 채운 wrapper를 만들어
  // ChatMessageList와 ChatMenuBar에는 의존이 없는 단순 컴포넌트로 전달한다.
  const WrappedCompareResultSheet = useMemo(
    () =>
      function WrappedCompareResultSheet(props: {
        result?: import('@/shared/lib/aiConsult').CompareResult;
        onSubscribe?: (
          plan: import('@/shared/lib/aiConsult').RecommendedPlan,
        ) => void;
        onRecompare?: (a: string, b: string) => void;
      }) {
        return (
          <CompareResultSheet
            {...props}
            slots={{ PlanCompare, PlanDetailContent }}
          />
        );
      },
    [],
  );

  const WrappedPlanQuickSheet = useMemo(
    () =>
      function WrappedPlanQuickSheet(props: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
      }) {
        return (
          <PlanQuickSheet
            {...props}
            slots={{ PlanCompare, PlanSubscriptionSheet }}
          />
        );
      },
    [],
  );

  const WrappedReportSheet = useMemo(
    () =>
      function WrappedReportSheet(props: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
      }) {
        return <ReportSheet {...props} slots={{ PlanSubscriptionSheet }} />;
      },
    [],
  );

  const messageSlots = useMemo(
    () => ({
      ReportCard,
      CompareResultSheet: WrappedCompareResultSheet,
      SignupChat,
      ChatQuizMessage,
      PlanSubscriptionSheet,
      ScratchGame,
      PlanDetailContent,
    }),
    [WrappedCompareResultSheet],
  );
  const menuSlots = useMemo(
    () => ({
      MyPageSheet,
      PlanQuickSheet: WrappedPlanQuickSheet,
      RewardSheet,
      ReportSheet: WrappedReportSheet,
    }),
    [WrappedPlanQuickSheet, WrappedReportSheet],
  );

  // 웰컴 메시지 외에 대화가 쌓인 뒤에만 새로고침 시 대화가 사라진다는 경고가 의미 있다.
  const hasChatProgress = messages.length > 1;

  // F5, Ctrl/Cmd+R로 새로고침을 시도하면 가로채서 확인 모달을 띄운다.
  // 브라우저 새로고침 버튼 클릭이나 탭 닫기는 JS로 가로챌 수 없어 beforeunload의
  // 기본 브라우저 대화상자로만 안내할 수 있다.
  useEffect(() => {
    if (!hasChatProgress) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isRefreshShortcut =
        e.key === 'F5' ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r');
      if (isRefreshShortcut) {
        e.preventDefault();
        openModal({ title: '안내', content: <RefreshCheckModal /> });
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChatProgress, openModal]);

  // 헤더 등 채팅 페이지 밖에서 회원가입을 누른 경우, 여기서 신호를 받아 가입 플로우를 시작한다.
  const signupPending = useSignupIntentStore((state) => state.pending);
  const consumeSignup = useSignupIntentStore((state) => state.consumeSignup);
  useEffect(() => {
    if (signupPending) {
      openSignupChat();
      consumeSignup();
    }
  }, [signupPending, openSignupChat, consumeSignup]);

  // 질문을 보내면 퀵 리플라이를 접고, 응답이 오면(성공/오류 모두 handleSend가 resolve됨) 다시 펼친다.
  const handleSendAndCollapse = async (text: string) => {
    setIsQuickRepliesCollapsed(true);
    try {
      await handleSend(text);
    } finally {
      setIsQuickRepliesCollapsed(false);
    }
  };

  // 레포트 생성이 끝나면 퀵 리플라이가 접혀 있던 상태라도 강제로 펼친다.
  // 이전에 추천받은 요금제가 있으면 함께 넘겨서, 무조건 일반 상담 리포트로
  // 처리돼 요금제 정보가 빠지는 일이 없게 한다.
  const handleGenerateReportAndExpand = async () => {
    await handleGenerateReport(findLastRecommendations(messages));
    setIsQuickRepliesCollapsed(false);
  };

  // 레포트 생성 버튼을 누르면 곧바로 생성하지 않고, 대화가 초기화된다는
  // 안내 모달을 먼저 띄운 뒤 사용자가 확인해야 실제 생성이 시작된다.
  const requestGenerateReport = () => {
    openModal({
      title: '알림',
      content: (
        <ReportGenerateConfirmModal onConfirm={handleGenerateReportAndExpand} />
      ),
    });
  };

  const lastMessage = messages[messages.length - 1];
  // 퀴즈·게임 진행 중에도, 그리고 요금제 추천 시 정보 입력 폼처럼 서버가
  // quickReplies를 빈 배열로 내려주는 경우에도 메뉴 퀵 리플라이를 항상 유지
  const quickReplies =
    lastMessage?.type === 'ai' && lastMessage.quickReplies?.length
      ? lastMessage.quickReplies
      : getWelcomeQuickReplies(isLoggedIn);

  const showReportButton = canShowReportButton && isLoggedIn;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        isGeneratingReport={isGeneratingReport}
        canShowReportButton={showReportButton}
        onSignupFinished={handleSignupFinished}
        onFormSubmit={handleFormSubmit}
        formDefaults={profile}
        onPlanSubscribe={openSubscription}
        onPlanCompare={handlePlanCompare}
        onRecompare={(planAName, planBName) =>
          fetchCompare(planBName, planAName)
        }
        onGenerateReport={handleGenerateReport}
        subscriptionOpen={subscriptionOpen}
        subscriptionPlan={subscriptionPlan}
        onSubscriptionClose={closeSubscription}
        onQuizOxAnswer={answerOx}
        onQuizMultipleChoiceSelect={selectMultipleChoice}
        onQuizMultipleChoiceConfirm={confirmMultipleChoice}
        onScratchWin={onScratchWin}
        onScratchClose={closeSheetGame}
        onRegenerate={handleRegenerate}
        onEditMessage={handleEditMessage}
        onReportButtonVisibleChange={setIsReportButtonScrollVisible}
        slots={messageSlots}
      />

      <div className="relative">
        {showReportButton && (
          <ReportGenerateButton
            onGenerate={requestGenerateReport}
            isLoading={isLoading}
            isGeneratingReport={isGeneratingReport}
            visible={isReportButtonScrollVisible}
          />
        )}

        <QuickReplies
          replies={quickReplies}
          onReply={handleSendAndCollapse}
          disabled={isLoading}
          isLoggedIn={isLoggedIn}
          collapsed={isQuickRepliesCollapsed}
          onToggleCollapse={() =>
            setIsQuickRepliesCollapsed((previous) => !previous)
          }
        />
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSendAndCollapse}
        onStop={handleStop}
        onStartQuiz={startQuiz}
        onStartScratch={startScratch}
        isLoggedIn={isLoggedIn}
        onRequireLogin={requireLogin}
        disabled={isLoading}
        game={gameInfrastructure}
        menuSlots={menuSlots}
      />

      <BottomSheet
        open={!!activeGameMeta && activeGameMeta.source === 'chat'}
        onOpenChange={(open) => {
          if (!open) closeSheetGame();
        }}
        title={activeGameMeta?.title ?? ''}
        onBack={activeGameMeta?.onBack}
        size="full"
        bodyClassName="px-0"
      >
        <GameLayer />
      </BottomSheet>
    </div>
  );
}
