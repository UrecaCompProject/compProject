// 에러 유형 — classifyError가 반환하는 분류 결과
export type ErrorType =
  'network' | 'timeout' | 'server' | 'empty_response' | 'auth' | 'unknown';

export interface ErrorClassification {
  type: ErrorType;
  userMessage: string;
  quickReplies: string[];
}

// 사용자 친화적 에러 메시지 매핑
const ERROR_MESSAGES: Record<
  ErrorType,
  { message: string; quickReplies: string[] }
> = {
  network: {
    message:
      '인터넷 연결이 불안정해요. 네트워크 상태를 확인한 후 다시 시도해 주세요.',
    quickReplies: ['다시 시도', '메뉴로 돌아가기'],
  },
  timeout: {
    message: '응답이 오래 걸리고 있어요. 잠시 후 다시 시도해 주세요.',
    quickReplies: ['다시 시도', '메뉴로 돌아가기'],
  },
  server: {
    message: '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
    quickReplies: ['다시 시도', '메뉴로 돌아가기'],
  },
  empty_response: {
    message: '응답을 불러오지 못했어요. 다시 시도해 주세요.',
    quickReplies: ['다시 시도', '메뉴로 돌아가기'],
  },
  auth: {
    message: '로그인이 만료되었어요. 다시 로그인해 주세요.',
    quickReplies: ['회원 가입하기', '메뉴로 돌아가기'],
  },
  unknown: {
    message: '요청 중 문제가 발생했어요. 다시 시도해 주세요.',
    quickReplies: ['다시 시도', '메뉴로 돌아가기'],
  },
};

// 에러 메시지에서 에러 유형을 추론 — 네트워크·서버·타임아웃·인증 등 패턴 매칭
function detectErrorType(error: unknown): ErrorType {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();
  const name = error instanceof Error ? error.name.toLowerCase() : '';

  // 네트워크 끊김 — fetch 자체가 실패한 경우
  if (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('network request failed') ||
    message.includes('err_internet')
  ) {
    return 'network';
  }

  // 타임아웃 — AbortController timeout 또는 명시적 timeout 에러
  // 사용자가 의도적으로 중지한 AbortError는 'user' 키워드가 없는 순수 abort로 구분
  if (
    message.includes('timeout') ||
    message.includes('etimedout') ||
    (name === 'aborterror' && !message.includes('user'))
  ) {
    return 'timeout';
  }

  // 인증 만료
  if (
    message.includes('401') ||
    message.includes('403') ||
    message.includes('unauthorized') ||
    message.includes('인증')
  ) {
    return 'auth';
  }

  // 빈 응답
  if (
    message.includes('응답이 비어') ||
    message.includes('empty response') ||
    message.includes('응답을 불러오지')
  ) {
    return 'empty_response';
  }

  // 서버 오류 — 5xx, FunctionsRelayError, FunctionsHttpError, 기존 "요청 실패" 문구
  if (
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('functionsrelayerror') ||
    message.includes('functionshttperror') ||
    message.includes('요청 실패') ||
    message.includes('상담 요청 실패') ||
    message.includes('레포트 생성 실패')
  ) {
    return 'server';
  }

  return 'unknown';
}

// 에러를 분류하여 사용자 친화적 메시지와 quickReplies를 반환
export function classifyError(error: unknown): ErrorClassification {
  const type = detectErrorType(error);
  const { message, quickReplies } = ERROR_MESSAGES[type];
  return { type, userMessage: message, quickReplies };
}
