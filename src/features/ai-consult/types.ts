import type {
  CompareResult,
  ConsultForm,
  RecommendedPlan,
  ReportOutput,
} from '@/shared/lib/aiConsult';
import type {
  QuizQuestionMessage,
  QuizResultMessage,
} from '@/shared/types/quiz';

export type MessageType =
  'ai' | 'user' | 'signup' | 'quiz-question' | 'quiz-result' | 'scratch-game';

// 리포트 대화 로그에서 게임/출석 맥락 메시지를 제외하기 위한 분류
export type MessageCategory = 'plan' | 'game' | 'attendance' | 'general';

export type ChatMessage =
  | {
      id: number;
      type: 'ai';
      sentence: string;
      quickReplies?: string[];
      form?: ConsultForm;
      recommendations?: RecommendedPlan[];
      report?: ReportOutput;
      compareResult?: CompareResult;
      // '요금제 비교하기' 진입 시(또는 현재 요금제 미설정 상태로 비교 요청 시)
      // AI 호출 없이 카탈로그 기반 비교 컴포넌트를 렌더링
      planCompare?: boolean;
      // 에러 메시지 여부 — AIChat에 error variant 적용 + 재시도 퀵리플라이 표시
      isError?: boolean;
      category?: MessageCategory;
    }
  | { id: number; type: 'user'; sentence: string; category?: MessageCategory }
  | { id: number; type: 'signup' }
  | QuizQuestionMessage
  | QuizResultMessage
  // 스크래치 게임 — 채팅 내에서 ScratchGame 컴포넌트 렌더링
  | {
      id: number;
      type: 'scratch-game';
      reward?: number;
    };
