import type {
  ConsultForm,
  RecommendedPlan,
  ReportOutput,
} from '@/lib/aiConsult';

export type MessageType = 'ai' | 'user' | 'signup';

export interface SubscriptionForm {
  type: 'new' | 'portability' | 'device' | 'change';
  name: string;
  birth: string;
  phone: string;
  address: string;
  simType: 'usim' | 'esim' | '';
  agreedPrivacy: boolean;
  agreedService: boolean;
  agreedMarketing: boolean;
}

export type ChatMessage =
  | {
      id: number;
      type: 'ai';
      sentence: string;
      quickReplies?: string[];
      form?: ConsultForm;
      recommendations?: RecommendedPlan[];
      report?: ReportOutput;
    }
  | { id: number; type: 'user'; sentence: string }
  | { id: number; type: 'signup' };
