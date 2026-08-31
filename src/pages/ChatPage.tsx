import { useEffect } from 'react';

import {
  ChatInput,
  ChatMessageList,
  QuickReplies,
} from '@/features/ai-consult';
import { getWelcomeQuickReplies } from '@/features/ai-consult/lib/chatHelpers';
import { preloadLottiePlayer } from '@/features/ai-consult/lib/preloadLottie';
import { useChat } from '@/features/ai-consult/model/useChat';
import { GameLayer } from '@/features/games';
import { BottomSheet } from '@/shared';

export default function ChatPage() {
  const {
    messages,
    input,
    setInput,
    isLoading,
    isGeneratingReport,
    handleSend,
    handleSignupFinished,
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
    answerOx,
    selectMultipleChoice,
    confirmMultipleChoice,
    finishQuiz,
    closeSheetGame,
    activeGameMeta,
  } = useChat();

  // 채팅 페이지 진입 즉시 Lottie 청크를 백그라운드에서 미리 로드
  // 사용자가 첫 메시지를 보내 로딩 인디케이터가 표시될 때 청크가 이미 캐시되어 있도록
  useEffect(() => {
    preloadLottiePlayer();
  }, []);

  const lastMessage = messages[messages.length - 1];
  // 퀴즈·게임 진행 중에도 메뉴 퀵 리플라이를 항상 유지
  const quickReplies =
    lastMessage?.type === 'ai' && lastMessage.quickReplies
      ? lastMessage.quickReplies
      : getWelcomeQuickReplies(isLoggedIn);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        isGeneratingReport={isGeneratingReport}
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
        onQuizNext={finishQuiz}
        onScratchClose={closeSheetGame}
      />
      <QuickReplies
        replies={quickReplies}
        onReply={handleSend}
        disabled={isLoading}
        isLoggedIn={isLoggedIn}
      />
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onStartQuiz={startQuiz}
        disabled={isLoading}
      />

      <BottomSheet
        open={!!activeGameMeta}
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
