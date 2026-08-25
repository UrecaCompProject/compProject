import {
  ChatInput,
  ChatMessageList,
  QuickReplies,
} from '@/features/ai-consult';
import { useChat } from '@/features/ai-consult/hooks/useChat';

export default function ChatPage() {
  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSend,
    handleSignupFinished,
    handleFormSubmit,
    handleGenerateReport,
    profile,
    subscriptionOpen,
    subscriptionPlan,
    openSubscription,
    closeSubscription,
    isLoggedIn,
  } = useChat();

  const lastMessage = messages[messages.length - 1];
  const quickReplies =
    lastMessage?.type === 'ai' ? lastMessage.quickReplies : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        onSignupFinished={handleSignupFinished}
        onFormSubmit={handleFormSubmit}
        formDefaults={profile}
        onPlanSubscribe={openSubscription}
        onGenerateReport={handleGenerateReport}
        subscriptionOpen={subscriptionOpen}
        subscriptionPlan={subscriptionPlan}
        onSubscriptionClose={closeSubscription}
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
        disabled={isLoading}
      />
    </div>
  );
}
