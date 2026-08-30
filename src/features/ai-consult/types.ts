import type {
  QuizQuestionMessage,
  QuizResultMessage,
} from '@/features/chat-quiz';
import type {
  CompareResult,
  ConsultForm,
  RecommendedPlan,
  ReportOutput,
} from '@/shared/lib/aiConsult';

export type MessageType =
  'ai' | 'user' | 'signup' | 'quiz-question' | 'quiz-result' | 'scratch-game';

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
      // 현재 요금제가 미설정 상태에서 비교를 요청하면 드랍다운 셀렉터를 렌더링
      planSelector?: boolean;
      // planSelector 렌더링 모드: 'current' = 현재 요금제 선택, 'target' = 비교 대상 선택
      planSelectorMode?: 'current' | 'target';
      // 에러 메시지 여부 — AIChat에 error variant 적용 + 재시도 퀵리플라이 표시
      isError?: boolean;
    }
  | { id: number; type: 'user'; sentence: string }
  | { id: number; type: 'signup' }
  | QuizQuestionMessage
  | QuizResultMessage
  // 스크래치 게임 — 채팅 내에서 ScratchGame 컴포넌트 렌더링
  | {
      id: number;
      type: 'scratch-game';
      reward?: number;
    };
