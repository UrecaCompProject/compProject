export type MessageType = 'ai' | 'user' | 'signup';

export type ChatMessage =
  | { id: number; type: 'ai'; sentence: string; quickReplies?: string[] }
  | { id: number; type: 'user'; sentence: string }
  | { id: number; type: 'signup' };
