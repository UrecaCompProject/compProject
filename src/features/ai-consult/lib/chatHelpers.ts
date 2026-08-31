import type { QuizKind } from '@/features/chat-quiz';
import type { ConsultInput, RecommendedPlan } from '@/shared/lib/aiConsult';

import type { ChatMessage, MessageCategory } from '../types';

export const WELCOME_MESSAGE =
  '안녕하세요! AI 요금제 도우미 해리에요.\n\n아래 메뉴에서 원하는 항목을 선택해 주세요.';

export function getWelcomeQuickReplies(isLoggedIn: boolean): string[] {
  return isLoggedIn
    ? [
        '요금제 추천받기',
        '요금제 비교하기',
        '요금제 가입하기',
        '게임 하기',
        '출석체크',
        '기타 상담',
      ]
    : ['회원 가입하기', '요금제 추천받기', '요금제 비교하기', '기타 상담'];
}

export function getQuizIntent(message: string): QuizKind | null {
  const normalized = message.toLowerCase().replace(/\s+/g, '');
  const shortOxReplies = new Set([
    'ox',
    '오엑스',
    'ox퀴즈',
    '오엑스퀴즈',
    'ox게임',
    '보안퀴즈',
    '보안ox퀴즈',
  ]);
  const shortMultipleChoiceReplies = new Set([
    '통신퀴즈',
    '통신상식퀴즈',
    '통신보안퀴즈',
    '사지선다',
    '사지선다퀴즈',
  ]);

  if (shortOxReplies.has(normalized)) return 'ox';
  if (shortMultipleChoiceReplies.has(normalized)) return 'multiple-choice';

  const wantsToStart = /(할래|할게|하자|해줘|해볼래|시작|진행)/.test(
    normalized,
  );
  if (!wantsToStart) return null;

  if (/(ox|오엑스|보안).*(퀴즈|게임)/.test(normalized)) return 'ox';
  if (/통신.*(퀴즈|게임)/.test(normalized)) return 'multiple-choice';
  return null;
}

export function formatFormSummary(values: Partial<ConsultInput>): string {
  const parts: string[] = [];
  if (values.ageGroup) parts.push(`연령대: ${values.ageGroup}`);
  if (values.dataUsage !== undefined)
    parts.push(`데이터: ${values.dataUsage}GB`);
  if (values.budget !== undefined)
    parts.push(`예산: ${values.budget.toLocaleString()}원`);
  if (values.ott && values.ott.length > 0)
    parts.push(`OTT: ${values.ott.join(', ')}`);
  return parts.join(' / ');
}

export function findLastRecommendedPlan(
  messages: ChatMessage[],
): RecommendedPlan | null {
  const last = findLastRecommendations(messages);
  return last.length > 0 ? last[0] : null;
}

export function findLastRecommendations(
  messages: ChatMessage[],
): RecommendedPlan[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (
      message.type === 'ai' &&
      message.recommendations &&
      message.recommendations.length > 0
    ) {
      return message.recommendations;
    }
  }
  return [];
}

// 리포트 대화 로그에 포함할 메시지인지 확인 — 게임/출석 맥락은 제외
function isLoggableMessage(
  m: ChatMessage,
): m is Extract<ChatMessage, { type: 'ai' | 'user' }> {
  if (m.type !== 'ai' && m.type !== 'user') return false;
  return m.category !== 'game' && m.category !== 'attendance';
}

export function buildConversationLog(messages: ChatMessage[]): string {
  return messages
    .filter(isLoggableMessage)
    .map((m) => {
      const role = m.type === 'ai' ? 'AI' : '사용자';
      return `${role}: ${m.sentence}`;
    })
    .join('\n');
}

export function buildRecommendationResult(
  recommendations: RecommendedPlan[],
): string {
  return recommendations
    .map(
      (p) =>
        `${p.planName} (월 ${p.monthlyFee?.toLocaleString() ?? '-'}원, ${p.reason}, 절감액 ${p.savingAmount.toLocaleString()}원)`,
    )
    .join('\n');
}

// 에러 메시지 추출 — Error 인스턴스면 message, 아니면 기본 문구 사용
function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

// 에러 AI 메시지 객체 생성 — isError 플래그로 빨간 말풍선 + 재시도 퀵리플라이 적용
export function buildErrorMessage(error: unknown, fallback: string) {
  return {
    id: Date.now(),
    type: 'ai' as const,
    sentence: getErrorMessage(error, fallback),
    isError: true,
    quickReplies: ['다시 시도', '메뉴로 돌아가기'],
  };
}

// 간단한 AI 안내 메시지 객체 생성 — handleSend 내 quick reply 분기에서 공통 사용
export function buildAIMessage(
  sentence: string,
  quickReplies?: string[],
  extra?: Partial<{
    planSelector: boolean;
    planSelectorMode: 'current' | 'target';
    category: MessageCategory;
  }>,
) {
  return {
    id: Date.now() + 1,
    type: 'ai' as const,
    sentence,
    quickReplies,
    ...extra,
  };
}
