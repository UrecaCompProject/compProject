import { requestConsult } from '@/shared/lib/aiConsult';
import type {
  ChatMode,
  ConsultInput,
  ConsultResponse,
} from '@/shared/lib/aiConsult';

import { TELECOM_KEYWORDS } from '../constants/telecomKeywords';
import { parseUserInput } from '../lib/parseUserInput';

// 프론트엔드 폴백: 메뉴 상태에서 통신과 무관한 입력 감지 시 Edge Function 호출 전 차단
function isOutOfScope(text: string, prevMode?: ChatMode): boolean {
  if (prevMode !== 'menu') return false;
  const normalized = text.toLowerCase().replace(/\s+/g, '');
  return !TELECOM_KEYWORDS.some((kw) =>
    normalized.includes(kw.toLowerCase().replace(/\s+/g, '')),
  );
}

// 상담 외 주제 폴백 응답 — Edge Function 미응답 시 프론트엔드에서 직접 생성
function buildOutOfScopeFallback(isLoggedIn: boolean): ConsultResponse {
  return {
    recommendations: [],
    notice:
      '죄송해요, 저는 통신 요금제 상담 도우미예요. 요금제 추천, 비교, 가입, 혜택 등 통신 관련 질문만 도와드릴 수 있어요. 아래 메뉴에서 원하는 항목을 선택해 주세요.',
    quickReplies: isLoggedIn
      ? ['요금제 추천받기', '요금제 비교하기', '요금제 가입하기', '기타 상담']
      : ['회원 가입하기', '요금제 추천받기', '요금제 비교하기', '기타 상담'],
    mode: 'out_of_scope',
  };
}

export async function postQuestion(
  text: string,
  prev: ConsultInput,
): Promise<{ input: ConsultInput; response: ConsultResponse }> {
  const input = parseUserInput(text, prev);

  // 프론트엔드 폴백: 메뉴 상태에서 통신과 무관한 입력은 Edge Function 호출 전 차단
  if (isOutOfScope(text, prev.mode)) {
    return {
      input: { ...input, mode: 'out_of_scope' },
      response: buildOutOfScopeFallback(prev.isLoggedIn ?? false),
    };
  }

  const response = await requestConsult(input);
  return { input, response };
}
