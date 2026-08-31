import { useEffect } from 'react';

import {
  ChatInput,
  ChatMessageList,
  QuickReplies,
} from '@/features/ai-consult';
import { preloadLottiePlayer } from '@/features/ai-consult/lib/preloadLottie';
import { useChat } from '@/features/ai-consult/model/useChat';

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
  } = useChat();

  // 채팅 페이지 진입 즉시 Lottie 청크를 백그라운드에서 미리 로드
  // 사용자가 첫 메시지를 보내 로딩 인디케이터가 표시될 때 청크가 이미 캐시되어 있도록
  useEffect(() => {
    preloadLottiePlayer();
  }, []);

  const lastMessage = messages[messages.length - 1];
  const quickReplies =
    lastMessage?.type === 'ai' ? lastMessage.quickReplies : undefined;

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
    </div>
  );
}
