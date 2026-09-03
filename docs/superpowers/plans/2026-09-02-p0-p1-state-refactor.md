# P0/P1 상태관리 리팩터링 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 서버 상태를 Zustand에서 제거하고 TanStack Query를 유일한 신뢰원으로 삼으며, `useCurrentPlan` 캐싱과 `call_used_min` 네이밍을 정리한다.

**Architecture:** `useSubscriptionStore`를 완전히 제거하고 `entities/plan/useCurrentPlan`으로 `currentPlan`을 관리한다. `useChat`은 `useCurrentPlan`만 참조하며 직접 `loadCurrentPlan` 호출을 없앤다. `usage_monthly`의 `call_used_min` 컬럼(실제 초 단위)을 도메인 타입에서 `callUsedSeconds`로 명시적으로 매핑한다.

**Tech Stack:** React 19, Vite, Zustand, TanStack Query v5, TypeScript, MSW

**Spec:** 현재 프로젝트 전체 코드 파악 분석 결과 (2026-09-02)

## Global Constraints

- React Context API는 인증 상태 전용, Zustand는 UI/전역 클라이언트 상태 전용, TanStack Query는 서버 상태 전용.
- `entities` 레이어는 `features`/`widgets`/`pages`/`app`을 import할 수 없음 (FSD).
- `npm run lint`와 `npm run build`는 반드시 통과해야 함.
- 신규 dependency 추가 금지; 기존 라이브러리만 사용.
- 한국어 코드 주석은 복잡한 비즈니스 규칙/외부 의존성 호출 순서에만 추가.

---

## Task 1: `useCurrentPlan` 캐시 키에 사용자 ID 추가

**Files:**

- Modify: `src/entities/plan/model/useCurrentPlan.ts`

**Interfaces:**

- Consumes: `useAuth()` → `{ user }`
- Produces: `useQuery({ queryKey: ['plans', 'current', user?.id], ... })`

- [ ] **Step 1: `useCurrentPlan`에 `user?.id` 포함**

```ts
import { useAuth } from '@/entities/user';
import { getCurrentPlan } from '../api/getCurrentPlan';

export function useCurrentPlan(isLoggedIn: boolean) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['plans', 'current', user?.id],
    queryFn: getCurrentPlan,
    enabled: isLoggedIn && !!user,
  });
}
```

- [ ] **Step 2: import 순서 확인**

`entities/plan`이 `entities/user`를 import하는 것은 FSD 하위 레이어 참조이므로 허용됨. `eslint.config.js` `fsdBoundaryRules`에서 `entities`는 `features`/`widgets`/`pages`/`app`만 제한.

- [ ] **Step 3: grep으로 `queryKey: ['plans', 'current']` 잔여물 확인**

Run: `grep -n "'plans', 'current'" src/**/*.ts src/**/*.tsx`
Expected: `useCurrentPlan.ts`와 무효화 호출(`useSubmitSubscription.ts`)만 남음.

- [ ] **Step 4: Type 검사**

Run: `npx tsc -b`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/entities/plan/model/useCurrentPlan.ts
git commit -m "fix(plan): currentPlan queryKey에 user.id 추가

- 사용자가 변경되어도 캐시가 섞이지 않도록 queryKey에 user?.id 추가
- enabled 조건에 user 존재 여부 추가

Generated with [Devin](https://devin.ai)
Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Task 2: `useSubscriptionStore` 제거 및 `currentPlan` 단일화 (P0)

**Files:**

- Delete: `src/features/plan-subscription/model/useSubscriptionStore.ts`
- Modify: `src/features/plan-subscription/index.ts`
- Modify: `src/features/ai-consult/index.ts`
- Modify: `src/features/plan-subscription/model/useSubmitSubscription.ts`
- Modify: `src/features/ai-consult/model/useChat.tsx`

**Interfaces:**

- Consumes: `useCurrentPlan(isLoggedIn)` from `entities/plan`
- Produces: `useSubmitSubscription`의 `onSuccess`는 `invalidateQueries`만 수행

- [ ] **Step 1: `useSubscriptionStore.ts` 삭제**

파일 삭제 후 git stage.

```bash
git rm src/features/plan-subscription/model/useSubscriptionStore.ts
```

- [ ] **Step 2: re-export 제거**

`src/features/plan-subscription/index.ts`에서 `useSubscriptionStore` export 제거:

```ts
export { default as PlanSubscriptionSheet } from './ui/PlanSubscriptionSheet';
export { default as PlanSelector } from './ui/PlanSelector';
export { useSubmitSubscription } from './model/useSubmitSubscription';
export type { SubscriptionForm } from './types';
```

`src/features/ai-consult/index.ts`에서 `useSubscriptionStore` export 제거:

```ts
export {
  PlanSubscriptionSheet,
  PlanSelector,
} from '@/features/plan-subscription';
export type { SubscriptionForm } from '@/features/plan-subscription';
```

- [ ] **Step 3: `useSubmitSubscription.ts` 정리**

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postChangePlan } from '@/entities/plan';
import { ensureCurrentMonthUsage } from '@/entities/usage';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';

import { submitSubscription } from '../api/submitSubscription';

import type { SubscriptionForm } from '../types';

interface SubmitParams {
  plan: RecommendedPlan;
  form: SubscriptionForm;
  currentPlanId?: number | null;
}

export function useSubmitSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ plan, form, currentPlanId }: SubmitParams) => {
      const applicationId = await submitSubscription({
        plan,
        form,
        currentPlanId: form.type === 'change' ? (currentPlanId ?? null) : null,
      });
      await postChangePlan(Number(plan.planId));
      await ensureCurrentMonthUsage();
      return applicationId;
    },
    onSuccess: () => {
      // currentPlan은 TanStack Query 캐시를 유일한 신뢰원으로 한다.
      // Zustand 스토어와의 이중 동기화는 제거.
      queryClient.invalidateQueries({ queryKey: ['plans', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['usage'] });
    },
  });
}
```

- [ ] **Step 4: `useChat.tsx`에서 구독 스토어 의존 제거**

Import 변경:

```ts
import { useCurrentPlan } from '@/entities/plan';
import { useIsLoggedIn } from '@/entities/user';
import { postQuestion } from '@/features/ai-consult/api/postQuestion';
import { SigninModal } from '@/features/auth';
import { useChatQuiz } from '@/features/chat-quiz';
import type { QuizKind } from '@/features/chat-quiz';
import { useActiveGameMeta, useGameStore } from '@/features/games';
import type { GameId } from '@/features/games';
```

(`useSubscriptionStore` import 제거, `useCurrentPlan` 추가)

`useChat` 본문 변경 (기존 lines 152-157 대체):

```ts
const { data: currentPlan } = useCurrentPlan(isLoggedIn);

// 사용자가 직접 입력한 currentPlan이 우선, 없으면 DB의 현재 요금제를 사용
const effectiveCurrentPlan = profile.currentPlan ?? currentPlan?.planName;
```

`loadCurrentPlan` 관련 `useEffect` 제거 (기존 lines 200-207):

```ts
// useCurrentPlan이 enabled 상태일 때 자동으로 fetch/무효화되므로
// 별도 loadCurrentPlan 호출은 불필요.
```

`handleSend`/`useEffect` 의존성 배열에서 `subscribedCurrentPlan`과 `loadCurrentPlan` 제거. `effectiveCurrentPlan`은 `currentPlan`에서 파생된 string이므로 이미 배열에 포함되어 있다면 그대로 둔다.

- [ ] **Step 5: `useChat` 의존성 배열 정리**

`useChat`의 `handleSend` 의존성 배열에서 다음 항목 제거:

- `subscribedCurrentPlan`
- `loadCurrentPlan`

`effectiveCurrentPlan`이 배열에 있으면 `currentPlan` 객체 참조 변화에도 string 값이 같을 때는 리렌더/재생성이 트리거되지 않음. `effectiveCurrentPlan`이 매 render마다 새 string을 만들지 않도록 `useMemo`로 감싸는 것을 검토:

```ts
const effectiveCurrentPlan = useMemo(
  () => profile.currentPlan ?? currentPlan?.planName,
  [profile.currentPlan, currentPlan?.planName],
);
```

(`currentPlan?.planName`은 string primitive이므로 안정적.)

- [ ] **Step 6: grep으로 `useSubscriptionStore` 잔여 참조 확인**

Run: `grep -rn "useSubscriptionStore" src/`
Expected: no matches

- [ ] **Step 7: Build & Lint**

Run: `npm run lint`
Expected: PASS

Run: `npx tsc -b`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add src/features/plan-subscription/model/useSubscriptionStore.ts \
        src/features/plan-subscription/index.ts \
        src/features/ai-consult/index.ts \
        src/features/plan-subscription/model/useSubmitSubscription.ts \
        src/features/ai-consult/model/useChat.tsx
git commit -m "refactor(plan-subscription): currentPlan 서버 상태를 TanStack Query로 단일화

- useSubscriptionStore(currentPlan, loadCurrentPlan, submitApplication) 제거
- useChat이 useCurrentPlan만 참조하도록 변경
- useSubmitSubscription onSuccess에서 Zustand loadCurrentPlan 호출 제거
- currentPlan 캐시 무효화만으로 전체 UI 동기화

Generated with [Devin](https://devin.ai)
Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Task 3: `entities/usage` `call_used_min` → `callUsedSeconds` 도메인 이름 정리

**Files:**

- Modify: `src/entities/usage/api/getUsage.ts`
- Modify: `src/entities/usage/api/getUsageTrend.ts`
- Modify: `src/entities/usage/model/useUsage.ts`

**Interfaces:**

- Consumes: Supabase raw row with `call_used_min` (actually seconds)
- Produces: `UsageMonthlyRow.callUsedSeconds` (number)

- [ ] **Step 1: `getUsage.ts` 타입 및 매퍼 변경**

```ts
import dayjs from 'dayjs';

import { supabase } from '@/shared/lib/supabaseClient';

export type UsageMonthlyRow = {
  id: string;
  user_id: string;
  year_month: string;
  data_used_gb: number;
  callUsedSeconds: number;
  sms_used_count: number;
  created_at: string;
  updated_at: string;
};

// Supabase의 call_used_min 컬럼은 실제로 초(second) 단위를 저장한다.
// 도메인 타입에서는 단위가 명확하도록 callUsedSeconds로 매핑한다.
export function toUsageMonthlyRow(
  raw: Record<string, unknown>,
): UsageMonthlyRow {
  const { call_used_min, ...rest } = raw;
  return {
    ...(rest as Omit<UsageMonthlyRow, 'callUsedSeconds'>),
    callUsedSeconds: Number(call_used_min),
  };
}

export async function getUsage(userId: string): Promise<UsageMonthlyRow[]> {
  const currentYearMonth = dayjs().format('YYYY-MM');

  const { data, error } = await supabase
    .from('usage_monthly')
    .select('*')
    .eq('user_id', userId)
    .eq('year_month', currentYearMonth)
    .order('year_month', { ascending: false });

  if (error) {
    throw new Error(`사용량 조회 실패: ${error.message}`);
  }

  // eslint-disable-next-line no-console
  console.log(data);

  return ((data ?? []) as unknown[]).map(toUsageMonthlyRow);
}
```

- [ ] **Step 2: `getUsageTrend.ts` 동일 매퍼 적용**

```ts
import dayjs from 'dayjs';

import { supabase } from '@/shared/lib/supabaseClient';

import { toUsageMonthlyRow, type UsageMonthlyRow } from './getUsage';

export async function getUsageTrend(
  userId: string,
): Promise<UsageMonthlyRow[]> {
  const currentYearMonth = dayjs().format('YYYY-MM');

  const { data, error } = await supabase
    .from('usage_monthly')
    .select('*')
    .eq('user_id', userId)
    .lt('year_month', currentYearMonth)
    .order('year_month', { ascending: true });

  if (error) {
    throw new Error(`사용량 추이 조회 실패: ${error.message}`);
  }

  return ((data ?? []) as unknown[]).map(toUsageMonthlyRow);
}
```

- [ ] **Step 3: `useUsage.ts` 소비처 변경**

```ts
// call_used_min은 실제로 초 단위이므로 분 단계로 변환해 잔여량을 계산한다.
const callUsedSeconds = latestUsage?.callUsedSeconds ?? 0;
const callUsedMinutes = callUsedSeconds / 60;

const callRemaining = toRemaining(callUsedMinutes, currentPlan?.callAmountMin);
```

반환값 `callUsedSeconds`는 이미 `latestUsage?.callUsedSeconds`이므로 그대로 유지:

```ts
return {
  ...,
  callUsedSeconds,
  ...,
};
```

- [ ] **Step 4: grep으로 잔여 `call_used_min` 참조 확인**

Run: `grep -rn "call_used_min" src/`
Expected: `getUsage.ts`, `getUsageTrend.ts`, `mocks/db.ts`, `postUsageMonthly.ts`만 남음. `mocks/db.ts`는 DB raw 모킹이므로 그대로. `postUsageMonthly.ts`는 INSERT 시 DB 컬럼명이므로 그대로.

- [ ] **Step 5: Build & Lint**

Run: `npm run lint`
Expected: PASS

Run: `npx tsc -b`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/entities/usage/api/getUsage.ts \
        src/entities/usage/api/getUsageTrend.ts \
        src/entities/usage/model/useUsage.ts
git commit -m "refactor(usage): call_used_min을 callUsedSeconds로 도메인 매핑

- DB 컬럼 call_used_min은 실제 초 단위이므로 UsageMonthlyRow.callUsedSeconds로 명시
- getUsage, getUsageTrend에서 매퍼로 일관되게 변환
- useUsage 내부 변수/반환값 단위 혼란 제거

Generated with [Devin](https://devin.ai)
Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Global Verification

- [ ] **Step 1: 전체 `grep` 재확인**

```bash
grep -rn "useSubscriptionStore" src/ || echo "OK: no useSubscriptionStore references"
grep -rn "subscribedCurrentPlan\|loadCurrentPlan" src/ || echo "OK: no legacy currentPlan references"
grep -n "queryKey: \['plans', 'current'" src/entities/plan/model/useCurrentPlan.ts
```

- [ ] **Step 2: 전체 정적 검사**

```bash
npm run lint
npx tsc -b
npm run build
```

- [ ] **Step 3: 선택적 E2E 검증**

```bash
npx playwright test e2e/02-signup-and-subscribe.spec.ts
npx playwright test e2e/03-general-consult.spec.ts
```

(로컬 Supabase/백엔드가 떠 있어야 실행 가능.)

---

## Out of Scope / 후속 계획 제안

- `useChat.tsx` 614라인 전체 분리는 별도 계획으로 진행. (Task 2에서는 currentPlan/구독 스토어 의존만 제거.)
- `AuthProvider` → Zustand 마이그레이션은 성능 병목 측정 후 결정.
- FSD `features` 간 직접 import(예: `features/ai-consult` → `features/games`/`reward` 등) 제한은 아키텍처 규칙 변경이 필요하므로 별도 ADR.
