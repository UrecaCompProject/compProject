export type MessageType = 'ai' | 'user';

export interface ChatMessage {
  id: number;
  type: MessageType;
  sentence: string;
  quickReplies?: string[];
}
