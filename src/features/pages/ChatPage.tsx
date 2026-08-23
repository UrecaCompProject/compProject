import {
  ChatInput,
  ChatMessageList,
  QuickReplies,
} from '@/features/ai-consult';
import { useChat } from '@/features/ai-consult/hooks/useChat';

export default function ChatPage() {
  const { messages, input, setInput, isLoading, handleSend } = useChat();

  const lastMessage = messages[messages.length - 1];
  const quickReplies =
    lastMessage?.type === 'ai' ? lastMessage.quickReplies : undefined;

  return (
    <div className="flex h-[calc(100vh-49px-45px-16px)] flex-col">
      <ChatMessageList messages={messages} isLoading={isLoading} />
      <QuickReplies
        replies={quickReplies}
        onReply={handleSend}
        disabled={isLoading}
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
