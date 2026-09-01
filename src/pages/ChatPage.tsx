import { useEffect, useState } from 'react';

import {
  ChatInput,
  ChatMessageList,
  QuickReplies,
} from '@/features/ai-consult';
import { getWelcomeQuickReplies } from '@/features/ai-consult/lib/chatHelpers';
import { preloadLottiePlayer } from '@/features/ai-consult/lib/preloadLottie';
import { useChat } from '@/features/ai-consult/model/useChat';
import { GameLayer } from '@/features/games';
import { BottomSheet, useSignupIntentStore } from '@/shared';

export default function ChatPage() {
  const [isQuickRepliesCollapsed, setIsQuickRepliesCollapsed] = useState(false);
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
    handleFormSubmit,
    handleGenerateReport,
    handlePlanCompare,
    handleSelectCurrentPlan,
    handleSelectTargetPlan,
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
    activeGameMeta,
  } = useChat();

  // 채팅 페이지 진입 즉시 Lottie 청크를 백그라운드에서 미리 로드
  // 사용자가 첫 메시지를 보내 로딩 인디케이터가 표시될 때 청크가 이미 캐시되어 있도록
  useEffect(() => {
    preloadLottiePlayer();
  }, []);

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

  const lastMessage = messages[messages.length - 1];
  // 빈 배열일 때도 웰컴 퀵리플라이로 폴백 — 폼 진입 등으로 quickReplies: []가 내려올 때 메뉴 유지
  const quickReplies =
    lastMessage?.type === 'ai' &&
    lastMessage.quickReplies &&
    lastMessage.quickReplies.length > 0
      ? lastMessage.quickReplies
      : getWelcomeQuickReplies(isLoggedIn);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        isGeneratingReport={isGeneratingReport}
        canShowReportButton={canShowReportButton}
        onSignupFinished={handleSignupFinished}
        onFormSubmit={handleFormSubmit}
        formDefaults={profile}
        onPlanSubscribe={openSubscription}
        onPlanCompare={handlePlanCompare}
        onSelectCurrentPlan={handleSelectCurrentPlan}
        onSelectTargetPlan={handleSelectTargetPlan}
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
      />
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
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSendAndCollapse}
        onStop={handleStop}
        onStartQuiz={startQuiz}
        onStartScratch={startScratch}
        onSignupClick={openSignupChat}
        disabled={isLoading}
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
