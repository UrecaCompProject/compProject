# 챗봇 메시지 제어 및 에러 처리 개선 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 제미나이 챗봇 스타일의 메시지 제어(중지·재생성·수정) 기능을 추가하고, 기술적 에러 메시지를 사용자 친화적 문구로 교체하며, 레이아웃 안정성을 개선한다.

**Architecture:** `AbortController`를 `useChat`에 도입하여 `requestConsult`/`generateReport`의 fetch 호출을 취소 가능하게 만든다. 에러 분류 계층(`classifyError`)을 `chatHelpers.ts`에 추가하여 에러 유형별 사용자 친화적 메시지를 매핑한다. `AIChat`/`MyChat` 컴포넌트에 인라인 액션 버튼(재생성·수정)을 추가하고, `ChatInput`에 로딩 중 정지 버튼을 전환 표시한다. 접근성 속성(`role="alert"`, `aria-label`)을 보강한다.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Supabase Edge Functions (`@supabase/supabase-js`), FSD (Feature-Sliced Design)

**Spec:** 이 계획 자체가 스펙. UX 감사 보고서(2026-08-31)의 Critical/High 항목을 구현 대상으로 한다.

## Global Constraints

- **외부 인터페이스 불변**: `features/ai-consult/index.ts`의 기존 export 목록과 시그니처 유지 (새 export 추가는 허용)
- **검증 기준**: 테스트 인프라가 제한적이므로 `npm run build` + `npm run lint` 통과가 기본 검증 기준. 순수 함수(`classifyError`)는 단위 테스트 작성
- **한글 주석**: 핵심 로직에만 한국어 주석, 자명한 코드에는 주석 없음
- **기존 주석 보존**: 기존 주석은 수정 시 그대로 유지
- **커밋 단위**: 각 Task 완료 후 개별 커밋
- **새 의존성 없음**: `AbortController`는 브라우저 내장 API, 새 패키지 설치 불필요
- **Supabase SDK**: `functions.invoke`는 `signal?: AbortSignal` 옵션을 지원함 (`@supabase/functions-js` `FunctionInvokeOptions` 타입 확인 완료)
- **에러 메시지 언어**: 모든 사용자 대상 메시지는 한국어

## 현재 상태 요약 (2026-08-31 기준)

- 작업 브랜치: `feature/plan-compare`, working tree clean
- `useChat.ts` (376줄): `lastUserInputRef`로 재시도 로직 이미 존재, `AbortController` 없음
- `chatHelpers.ts` (151줄): `buildErrorMessage`가 `error.message`를 그대로 노출
- `aiConsult.ts` (163줄): `requestConsult`/`generateReport`가 `throw new Error('AI 상담 요청 실패: ...')` 형태로 기술적 에러 던짐
- `ChatInput.tsx` (93줄): 로딩 중 전송 버튼 비활성화만, 정지 버튼 없음
- `AIChat.tsx` (29줄): `variant="error"` 시 색상만 변경, `role="alert"` 없음
- `MyChat.tsx` (7줄): 읽기 전용 말풍선, 수정 버튼 없음
- `ChatLoadingIndicator.tsx` (43줄): `transform: scale(2.2)` + `overflow-visible`로 모바일 레이아웃 위험

## 우선순위별 구현 순서

| 순위 | Task                                         | 심각도   | 사용자 요청 관련                                      |
| ---- | -------------------------------------------- | -------- | ----------------------------------------------------- |
| 1    | Task 1: 에러 분류 및 사용자 친화적 메시지    | Critical | 직접 요청 — "인터넷 연결이 끊겼습니다" 등 돌려서 설명 |
| 2    | Task 2: 생성 중지 (AbortController)          | Critical | 직접 요청 — 제미나이처럼 중지                         |
| 3    | Task 3: AI 응답 재생성                       | High     | 직접 요청 — 제미나이처럼 다시 시도                    |
| 4    | Task 4: 사용자 메시지 수정                   | High     | 직접 요청 — 제미나이처럼 수정                         |
| 5    | Task 5: 접근성 보강 (role=alert, aria-label) | High     | 에러 처리 개선과 함께 적용                            |
| 6    | Task 6: 로딩 인디케이터 레이아웃 안정성      | Medium   | 레이아웃 안정성 — 직접 요청                           |
| 7    | Task 7: 최종 검증                            | —        | 전체 통합 검증                                        |

---

### Task 1: 에러 분류 및 사용자 친화적 메시지 시스템

**목표:** `requestConsult`/`generateReport`가 던지는 기술적 에러(`"AI 상담 요청 실패: ..."`)를 분류하여, 사용자에게 친화적인 한국어 메시지로 변환한다.

**Files:**

- Create: `src/features/ai-consult/lib/classifyError.ts`
- Create: `src/features/ai-consult/lib/classifyError.test.ts`
- Modify: `src/features/ai-consult/lib/chatHelpers.ts:118-132` (`buildErrorMessage`가 `classifyError` 사용하도록 변경)
- Modify: `src/shared/lib/aiConsult.ts:119-163` (`requestConsult`/`generateReport`의 `throw new Error` 문구를 에러 코드 포함 형태로 변경)

**Interfaces:**

- Produces:
  - `classifyError.ts`: `ErrorType` (union type), `ErrorClassification` (interface), `classifyError(error: unknown): ErrorClassification`
  - `ErrorType`: `'network' | 'server' | 'timeout' | 'empty_response' | 'auth' | 'unknown'`
  - `ErrorClassification`: `{ type: ErrorType; userMessage: string; quickReplies: string[] }`
- Consumes: `chatHelpers.ts`의 기존 `buildErrorMessage`가 `classifyError`를 호출

**에러 분류 매핑:**

| 에러 유형      | 감지 조건 (error.message 또는 error.name)                                             | 사용자 메시지                                                             | quickReplies                           |
| -------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------- |
| network        | `Failed to fetch`, `NetworkError`, `ERR_INTERNET`, `Network request failed`           | "인터넷 연결이 불안정해요. 네트워크 상태를 확인한 후 다시 시도해 주세요." | `['다시 시도', '메뉴로 돌아가기']`     |
| timeout        | `timeout`, `Timeout`, `AbortError` (timeout 발생), `ETIMEDOUT`                        | "응답이 오래 걸리고 있어요. 잠시 후 다시 시도해 주세요."                  | `['다시 시도', '메뉴로 돌아가기']`     |
| server         | `500`, `502`, `503`, `FunctionsRelayError`, `FunctionsHttpError`, `AI 상담 요청 실패` | "일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요."                 | `['다시 시도', '메뉴로 돌아가기']`     |
| empty_response | `응답이 비어 있습니다`, `AI 상담 응답이 비어`                                         | "응답을 불러오지 못했어요. 다시 시도해 주세요."                           | `['다시 시도', '메뉴로 돌아가기']`     |
| auth           | `401`, `403`, `Unauthorized`, `인증`                                                  | "로그인이 만료되었어요. 다시 로그인해 주세요."                            | `['회원 가입하기', '메뉴로 돌아가기']` |
| unknown        | 기타 모든 경우                                                                        | "요청 중 문제가 발생했어요. 다시 시도해 주세요."                          | `['다시 시도', '메뉴로 돌아가기']`     |

- [ ] **Step 1: `lib/classifyError.ts` 생성**

```ts
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
    message.includes('err_internet') ||
    message.includes('networkerror')
  ) {
    return 'network';
  }

  // 타임아웃 — AbortController timeout 또는 명시적 timeout 에러
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
```

- [ ] **Step 2: `lib/classifyError.test.ts` 작성 — 실패하는 테스트**

```ts
import { describe, it, expect } from 'vitest';

import { classifyError } from './classifyError';

describe('classifyError', () => {
  it('네트워크 에러를 network로 분류', () => {
    const result = classifyError(new Error('Failed to fetch'));
    expect(result.type).toBe('network');
    expect(result.userMessage).toContain('인터넷 연결');
  });

  it('타임아웃 에러를 timeout으로 분류', () => {
    const result = classifyError(new Error('Request timeout'));
    expect(result.type).toBe('timeout');
    expect(result.userMessage).toContain('오래 걸리고');
  });

  it('서버 500 에러를 server로 분류', () => {
    const result = classifyError(
      new Error('AI 상담 요청 실패: 500 Internal Server Error'),
    );
    expect(result.type).toBe('server');
    expect(result.userMessage).toContain('일시적인 오류');
  });

  it('빈 응답을 empty_response로 분류', () => {
    const result = classifyError(new Error('AI 상담 응답이 비어 있습니다.'));
    expect(result.type).toBe('empty_response');
    expect(result.userMessage).toContain('불러오지 못했어요');
  });

  it('인증 에러를 auth로 분류', () => {
    const result = classifyError(new Error('401 Unauthorized'));
    expect(result.type).toBe('auth');
    expect(result.userMessage).toContain('로그인이 만료');
  });

  it('알 수 없는 에러를 unknown으로 분류', () => {
    const result = classifyError(new Error('Something unexpected'));
    expect(result.type).toBe('unknown');
    expect(result.userMessage).toContain('요청 중 문제');
  });

  it('Error 인스턴스가 아닌 경우 unknown으로 분류', () => {
    const result = classifyError('some string error');
    expect(result.type).toBe('unknown');
  });

  it('모든 분류 결과에 quickReplies가 포함됨', () => {
    const cases = [
      new Error('Failed to fetch'),
      new Error('timeout'),
      new Error('500 error'),
      new Error('401'),
      new Error('unknown'),
    ];
    for (const err of cases) {
      const result = classifyError(err);
      expect(result.quickReplies.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 3: 테스트 실행 — 실패 확인**

Run: `npx vitest run src/features/ai-consult/lib/classifyError.test.ts`
Expected: FAIL — `classifyError` 모듈을 찾을 수 없거나 import 에러

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `npx vitest run src/features/ai-consult/lib/classifyError.test.ts`
Expected: PASS — 8개 테스트 전부 통과

- [ ] **Step 5: `chatHelpers.ts`의 `buildErrorMessage`가 `classifyError` 사용하도록 수정**

`chatHelpers.ts`의 `getErrorMessage` 함수와 `buildErrorMessage` 함수를 수정:

```ts
// 기존 getErrorMessage 함수 제거 또는 deprecated 처리
// buildErrorMessage가 classifyError를 사용하도록 변경

import { classifyError } from './classifyError';

// 에러 AI 메시지 객체 생성 — classifyError로 사용자 친화적 메시지 분류
// fallback 파라미터는 classifyError의 unknown 케이스와 동일하므로 호환성 유지용으로 잔류
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
```

주의: `_fallback` 파라미터는 기존 호출부(`useChat.ts`, `quickReplyRouter.ts`, `useChatCompare.ts`, `useChatReport.ts`)에서 `buildErrorMessage(error, '요청 중 문제가 발생했어요. 다시 시도해주세요.')` 형태로 호출하므로 호환성을 위해 유지하되 사용하지 않음. 향후 호출부에서 fallback 인자 제거는 별도 리팩토링으로 진행.

- [ ] **Step 6: 빌드 및 lint 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0

- [ ] **Step 7: 테스트 재실행**

Run: `npx vitest run src/features/ai-consult/lib/classifyError.test.ts`
Expected: PASS

- [ ] **Step 8: 커밋**

```bash
git add src/features/ai-consult/lib/classifyError.ts src/features/ai-consult/lib/classifyError.test.ts src/features/ai-consult/lib/chatHelpers.ts
git commit -m "feat: 에러 분류 시스템 추가 — 기술적 에러를 사용자 친화적 메시지로 변환"
```

---

### Task 2: 생성 중지 기능 (AbortController)

**목표:** AI 응답 생성 중 사용자가 "중지" 버튼을 눌러 요청을 취소할 수 있게 한다. 제미나이 챗봇의 정지 기능과 동일한 패턴.

**Files:**

- Modify: `src/shared/lib/aiConsult.ts:119-163` (`requestConsult`/`generateReport`에 `signal` 파라미터 추가)
- Modify: `src/features/ai-consult/api/postQuestion.ts:33-49` (`signal` 전달)
- Modify: `src/features/ai-consult/model/useChat.ts` (`AbortController` ref 추가, `handleStop` 함수, `handleSend`/`handleFormSubmit`에 signal 연결)
- Modify: `src/features/ai-consult/model/useChatCompare.ts:48-83` (`fetchCompare`에 signal 전달)
- Modify: `src/features/ai-consult/model/useChatReport.ts:62-118` (`handleGenerateReport`에 signal 전달)
- Modify: `src/features/ai-consult/lib/quickReplyRouter.ts` (`QuickReplyContext`에 `signal` 추가, 비동기 분기에 전달)
- Modify: `src/features/ai-consult/ui/ChatInput.tsx` (로딩 중 전송 버튼 → 정지 버튼 전환)
- Modify: `src/pages/ChatPage.tsx` (`handleStop` prop 전달)

**Interfaces:**

- `requestConsult(input: ConsultInput, signal?: AbortSignal): Promise<ConsultResponse>`
- `generateReport(input: ReportInput, signal?: AbortSignal): Promise<ReportOutput>`
- `postQuestion(text: string, prev: ConsultInput, signal?: AbortSignal): Promise<{ input: ConsultInput; response: ConsultResponse }>`
- `useChat()` 반환값에 `handleStop: () => void` 추가
- `ChatInputProps`에 `onStop?: () => void` 추가
- `QuickReplyContext`에 `signal?: AbortSignal` 추가

**설계:**

- `useChat`에 `abortControllerRef = useRef<AbortController | null>(null)` 추가
- `handleSend` 시작 시 새 `AbortController` 생성, ref에 저장, `postQuestion`에 `signal` 전달
- `handleStop` 호출 시 `abortControllerRef.current?.abort()`, `setIsLoading(false)`
- catch 블록에서 `AbortError`인 경우 에러 메시지 추가하지 않고 조용히 종료 (사용자가 의도적으로 취소)
- `ChatInput`에서 `isLoading`일 때 전송 버튼(ArrowUp)을 정지 버튼(Square)으로 전환, `onStop` 호출

- [ ] **Step 1: `aiConsult.ts`의 `requestConsult`에 `signal` 파라미터 추가**

```ts
// Edge Function 응답 대기 최대 시간 (밀리초)
const CONSULT_TIMEOUT_MS = 30_000;
const REPORT_TIMEOUT_MS = 60_000;

// Supabase Edge Function 'ai-consult'를 호출하여 AI 요금제 추천 결과를 받습니다.
// signal을 전달하면 호출 도중에 요청을 취소할 수 있습니다.
export async function requestConsult(
  input: ConsultInput,
  signal?: AbortSignal,
): Promise<ConsultResponse> {
  const { data, error } = await supabase.functions.invoke<ConsultResponse>(
    'ai-consult',
    {
      body: input,
      timeout: CONSULT_TIMEOUT_MS,
      signal,
    },
  );

  if (error) {
    throw new Error(`AI 상담 요청 실패: ${error.message}`);
  }

  if (!data) {
    throw new Error('AI 상담 응답이 비어 있습니다.');
  }

  return data;
}

// 상담 내용과 추천 결과를 바탕으로 요약 레포트를 생성합니다.
// signal을 전달하면 레포트 생성 도중에 요청을 취소할 수 있습니다.
export async function generateReport(
  input: ReportInput,
  signal?: AbortSignal,
): Promise<ReportOutput> {
  const { data, error } = await supabase.functions.invoke<{
    report: ReportOutput;
    mode: 'report';
  }>('ai-consult', {
    body: { ...input, mode: 'report' },
    timeout: REPORT_TIMEOUT_MS,
    signal,
  });

  if (error) {
    throw new Error(`레포트 생성 실패: ${error.message}`);
  }

  if (!data?.report) {
    throw new Error('레포트 응답이 비어 있습니다.');
  }

  return data.report;
}
```

- [ ] **Step 2: `postQuestion.ts`에 `signal` 파라미터 추가**

```ts
export async function postQuestion(
  text: string,
  prev: ConsultInput,
  signal?: AbortSignal,
): Promise<{ input: ConsultInput; response: ConsultResponse }> {
  const input = parseUserInput(text, prev);

  // 프론트엔드 폴백: 메뉴 상태에서 통신과 무관한 입력은 Edge Function 호출 전 차단
  if (isOutOfScope(text, prev.mode)) {
    return {
      input: { ...input, mode: 'out_of_scope' },
      response: buildOutOfScopeFallback(prev.isLoggedIn ?? false),
    };
  }

  const response = await requestConsult(input, signal);
  return { input, response };
}
```

- [ ] **Step 3: `useChat.ts`에 `AbortController` ref 및 `handleStop` 추가**

`useChat` 함수 내부에 다음을 추가:

```ts
// AI 응답 생성 중 사용자가 중지할 수 있도록 AbortController를 보관
const abortControllerRef = useRef<AbortController | null>(null);

// AI 응답 생성 중지 — 진행 중인 fetch 요청을 취소하고 로딩 상태 해제
const handleStop = useCallback(() => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = null;
  setIsLoading(false);
}, []);
```

`handleSend`의 try 블록 수정:

```ts
setIsLoading(true);

// 새 요청마다 새 AbortController 생성 — 이전 요청과 독립적으로 취소 가능
const controller = new AbortController();
abortControllerRef.current = controller;

try {
  const { input: nextProfile, response } = await postQuestion(
    trimmed,
    {
      ...profile,
      isLoggedIn,
    },
    controller.signal,
  );
  addAIResponse(response, nextProfile, nextProfile.mode);
} catch (error) {
  // 사용자가 의도적으로 중지한 경우 — AbortError는 에러 메시지 없이 조용히 종료
  if (error instanceof DOMException && error.name === 'AbortError') {
    // 중지 후 빈 AI 응답 자리에 안내 메시지 추가
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'ai' as const,
        sentence:
          '응답 생성을 중지했어요. 다시 시도하거나 새 질문을 입력해 주세요.',
        quickReplies: ['다시 시도', '메뉴로 돌아가기'],
      },
    ]);
  } else {
    setMessages((prev) => [...prev, buildErrorMessage(error)]);
  }
} finally {
  setIsLoading(false);
  abortControllerRef.current = null;
}
```

`handleFormSubmit`에도 동일하게 `AbortController` 연결:

```ts
const handleFormSubmit = useCallback(
  async (values: Partial<ConsultInput>) => {
    if (isLoading) return;

    const summary = formatFormSummary(values);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'user',
        sentence: summary || '정보를 입력했습니다.',
        category: 'plan',
      },
    ]);
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const merged: ConsultInput = {
        ...profile,
        ...values,
        userMessage: '정보 입력 완료',
        mode: 'recommend',
        isLoggedIn,
      };
      const response = await requestConsult(merged, controller.signal);
      addAIResponse(response, merged, 'recommend');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: 'ai' as const,
            sentence:
              '응답 생성을 중지했어요. 다시 시도하거나 새 질문을 입력해 주세요.',
            quickReplies: ['다시 시도', '메뉴로 돌아가기'],
          },
        ]);
      } else {
        setMessages((prev) => [...prev, buildErrorMessage(error)]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  },
  [isLoading, profile, isLoggedIn, addAIResponse, setMessages],
);
```

`useChat` 반환값에 `handleStop` 추가:

```ts
return {
  // ... 기존 반환값 ...
  handleStop,
};
```

- [ ] **Step 4: `useChatCompare.ts`의 `fetchCompare`에 `signal` 파라미터 추가**

`UseChatCompareParams` 인터페이스에 `getSignal?: () => AbortSignal | undefined` 추가:

```ts
interface UseChatCompareParams {
  profile: ConsultInput;
  isLoggedIn: boolean;
  effectiveCurrentPlan: string | undefined;
  setIsLoading: (v: boolean) => void;
  setMessages: SetMessages;
  addAIResponse: AddAIResponse;
  getSignal?: () => AbortSignal | undefined;
}
```

`fetchCompare` 내부에서 `getSignal()` 호출:

```ts
const fetchCompare = useCallback(
  async (planBName: string, planAName?: string) => {
    setIsLoading(true);
    try {
      const comparePlanA = planAName ?? effectiveCurrentPlan;
      const request: ConsultInput = {
        ...profile,
        userMessage: '현재 요금제와 비교',
        mode: 'compare',
        isLoggedIn,
        comparePlanA,
        comparePlanB: planBName,
      };
      const response = await requestConsult(request, getSignal?.());
      addAIResponse(response, request, 'compare');
    } catch (error) {
      // AbortError는 useChat의 handleStop에서 처리하므로 여기서는 조용히 무시
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setMessages((prev) => [...prev, buildErrorMessage(error)]);
    } finally {
      setIsLoading(false);
    }
  },
  [
    profile,
    isLoggedIn,
    effectiveCurrentPlan,
    setIsLoading,
    setMessages,
    addAIResponse,
    getSignal,
  ],
);
```

`useChat.ts`에서 `useChatCompare` 호출 시 `getSignal` 전달:

```ts
const {
  fetchCompare,
  handlePlanCompare,
  handleSelectCurrentPlan,
  handleSelectTargetPlan,
  startCompareFlow,
  setPendingComparePlan,
} = useChatCompare({
  profile,
  isLoggedIn,
  effectiveCurrentPlan,
  setIsLoading,
  setMessages,
  addAIResponse,
  getSignal: () => abortControllerRef.current?.signal,
});
```

- [ ] **Step 5: `useChatReport.ts`의 `handleGenerateReport`에 `signal` 연결**

`UseChatReportParams`에 `getSignal?: () => AbortSignal | undefined` 추가, `handleGenerateReport` 내부에서 사용:

```ts
const report = await generateReport(
  {
    conversation: buildConversationLog(messages),
    currentPlan: effectiveCurrentPlan || '미등록',
    recommendationResult: buildRecommendationResult(recommendations),
    reportKind,
    userProfile: buildUserProfile(userProfile),
  },
  getSignal?.(),
);
```

catch 블록에 AbortError 무시 추가:

```ts
} catch (error) {
  if (error instanceof DOMException && error.name === 'AbortError') return;
  setMessages((prev) => [
    ...prev,
    buildErrorMessage(error),
  ]);
}
```

`useChat.ts`에서 `useChatReport` 호출 시 `getSignal` 전달.

- [ ] **Step 6: `quickReplyRouter.ts`의 `QuickReplyContext`에 `signal` 추가**

`QuickReplyContext` 인터페이스에 `signal?: AbortSignal` 추가. 비동기 분기(`다른 요금제 보기`, `새 조건으로 다시 추천받기`)의 `requestConsult` 호출에 `ctx.signal` 전달:

```ts
export interface QuickReplyContext {
  // ... 기존 필드 ...
  signal?: AbortSignal;
}
```

`routeQuickReply` 내부에서 비동기 분기의 `requestConsult` 호출에 `signal` 전달:

```ts
// '다른 요금제 보기' 분기
const response = await requestConsult(request, signal);

// '새 조건으로 다시 추천받기' 분기
const response = await requestConsult(request, signal);
```

`useChat.ts`의 `handleSend`에서 `routeQuickReply` 호출 시 `signal: controller.signal` 추가.

- [ ] **Step 7: `ChatInput.tsx`에 정지 버튼 전환 로직 추가**

`ChatInputProps`에 `onStop?: () => void` 추가:

```ts
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
  onStop?: () => void;
  onStartQuiz?: (quizType: QuizKind) => void;
  disabled?: boolean;
}
```

전송 버튼을 로딩 상태에 따라 전환:

```tsx
import { ArrowUp, Menu, Square } from 'lucide-react';

// ... 컴포넌트 내부 ...

{
  disabled ? (
    // 로딩 중 — 정지 버튼 표시
    <Button
      variant="primary"
      size="icon"
      round
      onClick={onStop}
      aria-label="응답 생성 중지"
    >
      <Square size={16} />
    </Button>
  ) : (
    // 대기 중 — 전송 버튼 표시
    <Button
      variant="primary"
      size="icon"
      round
      onClick={handleSend}
      disabled={!isLogin || !value.trim()}
      aria-label="메시지 전송"
    >
      <ArrowUp size={16} />
    </Button>
  );
}
```

주의: `disabled` prop은 현재 `isLoading`과 연결되어 있음. `disabled === true`일 때 정지 버튼을 표시하므로, `disabled` 상태에서 정지 버튼은 활성화되어야 함. 위 코드에서 `disabled` 버튼의 `disabled` 속성을 제거하지 않도록 주의 — 정지 버튼에는 `disabled` 속성을 주지 않음.

- [ ] **Step 8: `ChatPage.tsx`에 `handleStop` 연결**

`useChat()` 반환값에서 `handleStop` 추출, `ChatInput`에 전달:

```ts
const {
  // ... 기존 ...
  handleStop,
} = useChat();
```

```tsx
<ChatInput
  value={input}
  onChange={setInput}
  onSend={handleSend}
  onStop={handleStop}
  onStartQuiz={startQuiz}
  disabled={isLoading}
/>
```

- [ ] **Step 9: 빌드 및 lint 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0

- [ ] **Step 10: 커밋**

```bash
git add -A
git commit -m "feat: AI 응답 생성 중지 기능 추가 — AbortController 연동"
```

---

### Task 3: AI 응답 재생성 기능

**목표:** 정상 AI 응답 아래에 "재생성" 버튼을 표시하여, 사용자가 만족스럽지 않은 응답을 다시 받을 수 있게 한다. 제미나이 챗봇의 재생성 기능과 동일.

**Files:**

- Modify: `src/features/ai-consult/ui/AIChat.tsx` (재생성 버튼 추가)
- Modify: `src/features/ai-consult/ui/ChatMessageList.tsx` (`onRegenerate` prop 전달)
- Modify: `src/features/ai-consult/model/useChat.ts` (`handleRegenerate` 함수 추가)
- Modify: `src/pages/ChatPage.tsx` (`onRegenerate` prop 전달)

**Interfaces:**

- `AIChatProps`에 `onRegenerate?: () => void`, `showRegenerate?: boolean` 추가
- `ChatMessageListProps`에 `onRegenerate?: () => void` 추가
- `useChat()` 반환값에 `handleRegenerate: () => void` 추가

**설계:**

- `handleRegenerate`: `lastUserInputRef.current`를 확인, 마지막 AI 응답 메시지를 제거하고 `handleSend(lastInput)` 재호출
- `AIChat`에 `onRegenerate`가 있고 마지막 메시지이고 에러가 아닌 경우에만 재생성 버튼 표시
- 재생성 버튼은 말풍선 하단에 작은 텍스트 버튼으로 배치 (Gemini 스타일)

- [ ] **Step 1: `useChat.ts`에 `handleRegenerate` 함수 추가**

`handleSend` 정의 이후에 추가:

```ts
// 마지막 AI 응답을 제거하고 마지막 사용자 입력으로 재생성
const handleRegenerate = useCallback(() => {
  if (isLoading) return;
  const lastInput = lastUserInputRef.current;
  if (!lastInput) return;

  // 마지막 AI 응답 메시지 제거 후 재전송
  setMessages((prev) => {
    const last = prev[prev.length - 1];
    if (last?.type === 'ai') {
      return prev.slice(0, -1);
    }
    return prev;
  });
  handleSend(lastInput);
}, [isLoading, handleSend, setMessages]);
```

`useChat` 반환값에 `handleRegenerate` 추가.

- [ ] **Step 2: `AIChat.tsx`에 재생성 버튼 추가**

```tsx
import type { ReactNode } from 'react';

import { RefreshCw } from 'lucide-react';

type AIChatVariant = 'default' | 'success' | 'error';

const AIChatBubbleVariants: Record<AIChatVariant, string> = {
  default: 'bg-surface-card',
  success: 'bg-semantic-success/10 text-semantic-success',
  error: 'bg-semantic-error/10 text-semantic-error',
};

interface AIChatProps {
  sentence: ReactNode;
  variant?: AIChatVariant;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
}

export default function AIChat({
  sentence,
  variant = 'default',
  onRegenerate,
  showRegenerate = false,
}: AIChatProps) {
  return (
    <div className="flex gap-2">
      <div className="rounded-full w-7 h-7 bg-gray-300 shrink-0">
        <img src="/bot_profile.png" alt="AI 도우미 해리" />
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <div
          className={`shadow-shadow rounded-2xl rounded-tl-sm px-4 py-3 max-w-[70%] whitespace-pre-line ${AIChatBubbleVariants[variant]}`}
        >
          {sentence}
        </div>
        {showRegenerate && onRegenerate && variant !== 'error' && (
          <button
            type="button"
            onClick={onRegenerate}
            className="flex items-center gap-1 text-caption text-fg-tertiary hover:text-brand-primary transition-colors w-fit"
            aria-label="응답 재생성"
          >
            <RefreshCw size={12} />
            재생성
          </button>
        )}
      </div>
    </div>
  );
}
```

주의 변경점:

- `alt="bot-profile"` → `alt="AI 도우미 해리"` (접근성 개선, Task 5와 연동)
- 말풍선 `max-w-[70%]` 유지, 재생성 버튼은 말풍선 하단에 별도 요소로 배치
- 기존 `mt-2`를 말풍선에서 부모 flex 컨테이너로 이동

- [ ] **Step 3: `ChatMessageList.tsx`에 `onRegenerate` prop 추가 및 전달**

`ChatMessageListProps`에 추가:

```ts
interface ChatMessageListProps {
  // ... 기존 ...
  onRegenerate?: () => void;
}
```

렌더링 부분에서 `AIChat`에 props 전달:

```tsx
{
  message.type === 'ai' && (
    <>
      <AIChat
        sentence={message.sentence}
        variant={message.isError ? 'error' : 'default'}
        onRegenerate={onRegenerate}
        showRegenerate={index === lastIndex && !isLoading && !message.isError}
      />
      <AIChatExtras
      // ... 기존 ...
      />
    </>
  );
}
```

- [ ] **Step 4: `ChatPage.tsx`에 `onRegenerate` 연결**

```ts
const {
  // ... 기존 ...
  handleRegenerate,
} = useChat();
```

```tsx
<ChatMessageList
  // ... 기존 ...
  onRegenerate={handleRegenerate}
/>
```

- [ ] **Step 5: 빌드 및 lint 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: AI 응답 재생성 버튼 추가 — 마지막 응답 제거 후 재전송"
```

---

### Task 4: 사용자 메시지 수정 기능

**목표:** 사용자가 보낸 메시지를 수정하여 재전송할 수 있게 한다. 수정 시 해당 메시지 이후의 대화를 잘라내고 입력창에 원문을 채운다. 제미나이 챗봇의 수정 기능과 동일.

**Files:**

- Modify: `src/features/ai-consult/ui/MyChat.tsx` (수정 버튼 추가)
- Modify: `src/features/ai-consult/ui/ChatMessageList.tsx` (`onEditMessage` prop 전달)
- Modify: `src/features/ai-consult/model/useChat.ts` (`handleEditMessage` 함수 추가)
- Modify: `src/pages/ChatPage.tsx` (`onEditMessage` prop 전달)

**Interfaces:**

- `MyChatProps`에 `onEdit?: () => void`, `showEdit?: boolean` 추가
- `ChatMessageListProps`에 `onEditMessage?: (messageId: number) => void` 추가
- `useChat()` 반환값에 `handleEditMessage: (messageId: number) => void` 추가

**설계:**

- `handleEditMessage(messageId)`: 해당 ID의 사용자 메시지를 찾아 `sentence`를 `input`에 주입, 해당 메시지 이후의 모든 메시지를 잘라냄, `lastUserInputRef`는 잘라낸 메시지의 sentence로 갱신하지 않음 (재전송 시 handleSend에서 설정)
- `MyChat`에 `onEdit`이 있고 마지막 사용자 메시지인 경우에만 수정 버튼 표시
- 수정 버튼은 말풍선 하단에 작은 텍스트 버튼으로 배치 (재생성 버튼과 대칭)

- [ ] **Step 1: `useChat.ts`에 `handleEditMessage` 함수 추가**

```ts
// 사용자 메시지 수정 — 해당 메시지 이후 대화를 잘라내고 입력창에 원문 주입
const handleEditMessage = useCallback(
  (messageId: number) => {
    if (isLoading) return;

    setMessages((prev) => {
      const targetIndex = prev.findIndex(
        (m) => m.id === messageId && m.type === 'user',
      );
      if (targetIndex === -1) return prev;

      const targetMessage = prev[targetIndex];
      if (targetMessage.type !== 'user') return prev;

      // 입력창에 원문 주입
      setInput(targetMessage.sentence);
      // 해당 메시지까지 포함하여 이후 메시지 제거 (메시지 자체도 제거)
      return prev.slice(0, targetIndex);
    });
  },
  [isLoading, setMessages, setInput],
);
```

`useChat` 반환값에 `handleEditMessage` 추가.

주의: 메시지를 잘라낼 때 해당 사용자 메시지 자체도 제거(`slice(0, targetIndex)`). 사용자가 수정 후 재전송하면 `handleSend`에서 새 메시지로 추가됨. `lastUserInputRef`는 재전송 시 `handleSend`에서 자동으로 갱신되므로 여기서 조작하지 않음.

- [ ] **Step 2: `MyChat.tsx`에 수정 버튼 추가**

```tsx
import { Pencil } from 'lucide-react';

interface MyChatProps {
  sentence: string;
  onEdit?: () => void;
  showEdit?: boolean;
}

export default function MyChat({
  sentence,
  onEdit,
  showEdit = false,
}: MyChatProps) {
  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="w-fit self-end rounded-2xl rounded-tr-sm px-4 py-3 bg-brand-promo-primary max-w-[70%] text-surface-card whitespace-pre-line">
        {sentence}
      </div>
      {showEdit && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-caption text-fg-tertiary hover:text-brand-primary transition-colors"
          aria-label="메시지 수정"
        >
          <Pencil size={12} />
          수정
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 3: `ChatMessageList.tsx`에 `onEditMessage` prop 추가 및 전달**

`ChatMessageListProps`에 추가:

```ts
interface ChatMessageListProps {
  // ... 기존 ...
  onEditMessage?: (messageId: number) => void;
}
```

사용자 메시지 렌더링 부분 수정:

```tsx
{
  message.type === 'user' && (
    <div className="flex justify-end">
      <MyChat
        sentence={message.sentence}
        onEdit={onEditMessage ? () => onEditMessage(message.id) : undefined}
        showEdit={index === lastIndex && !isLoading}
      />
    </div>
  );
}
```

주의: `showEdit`은 마지막 메시지가 사용자 메시지인 경우에만 true. 마지막 메시지가 AI 응답인 경우 사용자 메시지는 마지막이 아니므로 수정 버튼 표시 안 함. 단, AI 응답 생성 중(`isLoading`)에는 수정 버튼 숨김.

- [ ] **Step 4: `ChatPage.tsx`에 `onEditMessage` 연결**

```ts
const {
  // ... 기존 ...
  handleEditMessage,
} = useChat();
```

```tsx
<ChatMessageList
  // ... 기존 ...
  onEditMessage={handleEditMessage}
/>
```

- [ ] **Step 5: 빌드 및 lint 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: 사용자 메시지 수정 기능 추가 — 이후 대화 잘라내고 입력창에 원문 주입"
```

---

### Task 5: 접근성 보강

**목표:** 에러 메시지에 `role="alert"` 추가, 아이콘 전용 버튼에 `aria-label` 추가, ChatMenuBar의 `div onClick`을 `button`으로 변경.

**Files:**

- Modify: `src/features/ai-consult/ui/AIChat.tsx` (에러 시 `role="alert"`)
- Modify: `src/features/ai-consult/ui/ChatInput.tsx` (Menu 버튼 `aria-label`)
- Modify: `src/features/ai-consult/ui/ChatMenuBar.tsx` (`div onClick` → `button`)

- [ ] **Step 1: `AIChat.tsx`에 에러 시 `role="alert"` 추가**

Task 3에서 수정한 `AIChat.tsx`의 말풍선 div에 `variant === 'error'`일 때 `role="alert"` 추가:

```tsx
<div
  className={`shadow-shadow rounded-2xl rounded-tl-sm px-4 py-3 max-w-[70%] whitespace-pre-line ${AIChatBubbleVariants[variant]}`}
  role={variant === 'error' ? 'alert' : undefined}
>
  {sentence}
</div>
```

- [ ] **Step 2: `ChatInput.tsx`의 Menu 버튼에 `aria-label` 추가**

Task 2에서 수정한 `ChatInput.tsx`의 Menu 버튼에 `aria-label` 추가:

```tsx
<Button
  variant="secondary"
  size="icon"
  round
  active={isMenuOpen}
  onClick={() => setIsMenuOpen((prev) => !prev)}
  aria-label="메뉴 열기"
>
  <Menu size={20} />
</Button>
```

- [ ] **Step 3: `ChatMenuBar.tsx`의 `div onClick`을 `button`으로 변경**

4개 메뉴 항목을 `<div onClick>`에서 `<button type="button">`으로 변경:

```tsx
<button
  type="button"
  className="flex flex-col gap-2.5 w-15 items-center justify-center cursor-pointer"
  onClick={() => setMyPageOpen(true)}
>
  <IconBadge icon={UserRound} size={52} radius={16} />
  <div>마이페이지</div>
</button>
```

4개 항목(마이페이지, 요금제, 혜택/이벤트, 상담 리포트) 모두 동일하게 적용.

- [ ] **Step 4: 빌드 및 lint 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "fix: 접근성 보강 — 에러 role=alert, 아이콘 버튼 aria-label, div onClick을 button으로 변경"
```

---

### Task 6: 로딩 인디케이터 레이아웃 안정성

**목표:** `ChatLoadingIndicator`의 `transform: scale(2.2)` + `overflow-visible`로 인한 모바일 레이아웃 위험을 제거한다.

**Files:**

- Modify: `src/features/ai-consult/ui/ChatLoadingIndicator.tsx`

**설계:**

- Lottie Player의 `style`에서 `transform: scale(2.2)` 제거, `width`/`height`를 직접 120px/80px로 설정 (60px × 2.2 ≈ 132px, 여백 고려해 120px)
- 말풍선 컨테이너의 `overflow-visible`을 `overflow-hidden`으로 변경
- Suspense fallback의 크기를 실제 Lottie 크기와 일치시킴

- [ ] **Step 1: `ChatLoadingIndicator.tsx` 수정**

```tsx
export default function ChatLoadingIndicator() {
  return (
    <div className="flex gap-2">
      <div className="rounded-full w-7 h-7 bg-gray-300 shrink-0">
        <img src="/bot_profile.png" alt="AI 도우미 해리" />
      </div>
      <div className="shadow-shadow rounded-2xl rounded-tl-sm px-4 py-3 mt-2 bg-surface-card overflow-hidden">
        <Suspense
          fallback={
            <div className="w-[120px] h-[80px] flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-fg-disabled animate-pulse" />
            </div>
          }
        >
          <Player
            autoplay
            loop
            src={loadingAnimation}
            style={{
              width: '120px',
              height: '80px',
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
```

주의 변경점:

- `transform: scale(2.2)` 및 `transformOrigin` 제거
- `width: '60px'` → `'120px'`, `height: '40px'` → `'80px'` (직접 크기 지정)
- `overflow-visible` → `overflow-hidden` (말풍선 컨테이너)
- Suspense fallback 크기 `60px × 40px` → `120px × 80px` (실제 Lottie 크기와 일치)
- `alt="bot-profile"` → `alt="AI 도우미 해리"` (Task 5와 연동)

- [ ] **Step 2: 빌드 및 lint 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0

- [ ] **Step 3: 커밋**

```bash
git add src/features/ai-consult/ui/ChatLoadingIndicator.tsx
git commit -m "fix: 로딩 인디케이터 scale(2.2) 제거 — 직접 크기 지정으로 레이아웃 안정성 확보"
```

---

### Task 7: 최종 검증

**Files:**

- Verify: 모든 수정된 파일
- Verify: `src/features/ai-consult/index.ts` (export 변경 없음 확인)

- [ ] **Step 1: 전체 빌드 + lint 최종 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0

- [ ] **Step 2: 단위 테스트 실행**

Run: `npx vitest run`
Expected: 기존 테스트 + `classifyError.test.ts` 전부 PASS

- [ ] **Step 3: 수동 시나리오 점검 (브라우저)**

개발 서버 실행 후 확인:

1. **에러 메시지**: 네트워크 끊김 상태에서 메시지 전송 → "인터넷 연결이 불안정해요..." 메시지 표시
2. **생성 중지**: 메시지 전송 후 로딩 중 정지 버튼(■) 클릭 → "응답 생성을 중지했어요..." 메시지 표시
3. **재생성**: AI 응답 후 "재생성" 버튼 클릭 → 마지막 AI 응답 제거 후 재전송
4. **메시지 수정**: 마지막 사용자 메시지 하단 "수정" 버튼 클릭 → 입력창에 원문 주입, 이후 대화 제거
5. **접근성**: 에러 메시지에 `role="alert"` 확인, 아이콘 버튼에 `aria-label` 확인
6. **로딩 인디케이터**: 로딩 시 Lottie가 말풍선 영역을 벗어나지 않는지 확인

- [ ] **Step 4: 최종 커밋 (변경사항이 있으면)**

```bash
git add -A
git commit -m "chore: 챗봇 메시지 제어 및 에러 처리 개선 최종 검증"
```

---

## Self-Review

### 1. Spec coverage

| UX 감사 항목                                 | 구현 Task          | 상태 |
| -------------------------------------------- | ------------------ | ---- |
| C-2: 에러 메시지 사용자 친화화 (Critical)    | Task 1             | ✅   |
| U-1: 생성 중지 버튼 (Critical)               | Task 2             | ✅   |
| A-1: 에러 메시지 role=alert (Critical)       | Task 5             | ✅   |
| U-3: AI 응답 재생성 (High)                   | Task 3             | ✅   |
| U-2: 사용자 메시지 수정 (High)               | Task 4             | ✅   |
| A-2: 아이콘 버튼 aria-label (High)           | Task 5             | ✅   |
| A-3: ChatMenuBar div→button (High)           | Task 5             | ✅   |
| V-1/M-2: 로딩 인디케이터 scale 문제 (Medium) | Task 6             | ✅   |
| A-4: 봇 프로필 alt 개선 (Low)                | Task 3, 6 (부가적) | ✅   |

미구현 항목 (별도 후속 작업 권장):

- C-1: 에러 후 전환 액션 유지 — Task 1의 `classifyError`에서 auth 케이스에 `['회원 가입하기', ...]` 적용으로 부분 구현
- I-1: 퀵 리플라이 헤더 동적화 — 별도 IA 개선 작업 필요
- I-2: ChatMenuBar/QuickReplies 역할 중복 — 별도 IA 개선 작업 필요
- M-1: enterKeyHint="send" — 간단하므로 Task 5에 포함 가능하나 현재 계획에서는 제외

### 2. Placeholder scan

- "TBD", "TODO", "implement later" — 없음
- "Add appropriate error handling" — 없음, 모든 catch 블록에 구체적 처리 명시
- "Similar to Task N" — 없음, 각 Task에 전체 코드 제공
- 모든 Step에 실제 코드 블록 포함

### 3. Type consistency

- `classifyError(error: unknown): ErrorClassification` — Task 1에서 정의, `chatHelpers.ts`에서 사용
- `requestConsult(input, signal?)` — Task 2에서 정의, `postQuestion`/`useChatCompare`/`useChatReport`/`quickReplyRouter`에서 사용
- `handleStop: () => void` — Task 2에서 정의, `ChatInput`에서 사용
- `handleRegenerate: () => void` — Task 3에서 정의, `ChatMessageList`/`ChatPage`에서 사용
- `handleEditMessage: (messageId: number) => void` — Task 4에서 정의, `ChatMessageList`/`ChatPage`에서 사용
- `AbortError` 감지: `error instanceof DOMException && error.name === 'AbortError'` — 모든 catch 블록에서 일관되게 사용
