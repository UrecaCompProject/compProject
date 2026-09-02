import type { QuizKind } from '@/features/chat-quiz';
import type {
  CompareResult,
  ConsultInput,
  RecommendedPlan,
  RecommendedPlanGroup,
} from '@/shared/lib/aiConsult';

import {
  BUDGET_BUCKETS,
  DATA_USAGE_BUCKETS,
  findBucketLabel,
} from '../constants/consultBuckets';

import { classifyError } from './classifyError';

import type { ChatMessage, MessageCategory } from '../types';

// "(으)로" 조사 처리 — 받침 없음/ㄹ받침이면 "로", 그 외 받침 있으면 "으로".
// 마지막 글자가 한글 음절이 아니면(영문/숫자 등) "으로"를 기본값으로 사용한다.
export function josaRo(word: string): string {
  const last = word[word.length - 1];
  const code = last.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return '으로';
  const jongseong = code % 28;
  return jongseong === 0 || jongseong === 8 ? '로' : '으로';
}

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

// 상담 중 마지막으로 비교했던 요금제 결과 — 리포트의 "비교했던 요금제" 버킷에 사용
export function findLastCompareResult(
  messages: ChatMessage[],
): CompareResult | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.type === 'ai' && message.compareResult) {
      return message.compareResult;
    }
  }
  return null;
}

// 그 시점의 확정 조건을 "20대 / 5GB ~ 10GB / 5만원 ~ 10만원 / 넷플릭스" 형태로 요약.
// dataUsage/budget은 대표값(정수)이 아니라 사용자가 실제로 고른 구간 라벨을 되찾아 쓴다.
export function buildRecommendTarget(input: ConsultInput): string {
  const parts: string[] = [];
  if (input.ageGroup) parts.push(input.ageGroup);
  if (input.dataUsage !== undefined) {
    parts.push(
      findBucketLabel(DATA_USAGE_BUCKETS, input.dataUsage) ??
        `${input.dataUsage}GB`,
    );
  }
  if (input.budget !== undefined) {
    parts.push(
      findBucketLabel(BUDGET_BUCKETS, input.budget) ??
        `${input.budget.toLocaleString()}원`,
    );
  }
  if (input.ott) parts.push(...input.ott);
  return parts.join(' / ');
}

// 상담 중 "요금제 추천받기"가 요청될 때마다 생기는 라운드를 전부 모은다 —
// 한 번만 추천받았으면 1개, 여러 번 추천받았으면 그만큼 여러 개가 순서대로 담긴다.
export function findAllRecommendationGroups(
  messages: ChatMessage[],
): RecommendedPlanGroup[] {
  const groups: RecommendedPlanGroup[] = [];
  for (const message of messages) {
    if (
      message.type === 'ai' &&
      message.recommendations &&
      message.recommendations.length > 0
    ) {
      groups.push({
        target: message.recommendTarget ?? '',
        detail: message.recommendDetail ?? '',
        plans: message.recommendations,
      });
    }
  }
  return groups;
}

// 리포트 대화 로그에 포함할 메시지인지 확인 — 요금제(추천/비교/가입)와
// 일반 상담(에피라 관련 문의)만 포함하고, 게임/출석/메뉴 이동 등 나머지는
// (명시적으로 태그되지 않은 메시지 포함) 전부 제외하는 허용목록 방식.
function isLoggableMessage(
  m: ChatMessage,
): m is Extract<ChatMessage, { type: 'ai' | 'user' }> {
  if (m.type !== 'ai' && m.type !== 'user') return false;
  return m.category === 'plan' || m.category === 'general';
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

// 에러 AI 메시지 객체 생성 — classifyError로 사용자 친화적 메시지 분류
// _fallback 파라미터는 기존 호출부 호환성 유지용 (classifyError의 unknown 케이스가 동일 문구 사용)
export function buildErrorMessage(error: unknown, _fallback?: string) {
  const { userMessage, quickReplies } = classifyError(error);
  return {
    id: Date.now(),
    type: 'ai' as const,
    sentence: userMessage,
    isError: true,
    quickReplies,
  };
}

// 간단한 AI 안내 메시지 객체 생성 — handleSend 내 quick reply 분기에서 공통 사용
export function buildAIMessage(
  sentence: string,
  quickReplies?: string[],
  extra?: Partial<{
    planCompare: boolean;
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
