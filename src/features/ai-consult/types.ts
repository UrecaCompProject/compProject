import type { ConsultForm, RecommendedPlan } from '@/lib/aiConsult';

export type MessageType = 'ai' | 'user' | 'signup';

export type ChatMessage =
  | {
      id: number;
      type: 'ai';
      sentence: string;
      quickReplies?: string[];
      form?: ConsultForm;
      recommendations?: RecommendedPlan[];
    }
  | { id: number; type: 'user'; sentence: string }
  | { id: number; type: 'signup' };
