# QA 배치 수정 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` skill to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 에피라 QA 20개 항목 중 사용자가 우선순위를 지정한 7개 작업을 수정한다.

**Architecture:** React 19 + Vite + TS + Tailwind 4 + Supabase + Zustand + TanStack Query, FSD 구조. 단일 채팅 페이지(ChatPage) 구조. 게임은 GameLayer(바텀시트)와 채팅 메시지(ScratchGame) 두 경로로 실행됨.

**Tech Stack:** React 19, TypeScript, Vite 8, TailwindCSS 4, Zustand, TanStack Query, Supabase, vaul (BottomSheet), lucide-react

**Spec:** 이 문서가 spec이자 plan이다.

## Global Constraints

- 한국어 주석은 핵심 로직(알고리즘 핵심 단계, 외부 의존성 호출 순서, 예외/경계 조건)에만 추가
- 기존 코드 스타일·포맷팅·컨벤션 유지 (Prettier, ESLint 규칙 준수)
- 새 dependency 추가 없음 (기존 lucide-react, vaul, zustand, @tanstack/react-query만 사용)
- 환경 변수 변경 없음
- 코드 수정 후 `npm run lint` 및 `npm run build` 통과 필수

---

## File Structure

| 파일                                                   | 작업 | 책임                                                                             |
| ------------------------------------------------------ | ---- | -------------------------------------------------------------------------------- |
| `src/features/ai-consult/model/useChat.tsx`            | 수정 | `openSheetGame`에 `onWin` 콜백 연결, `playedTodayGameIds` 노출                   |
| `src/features/ai-consult/lib/quickReplyRouter.ts`      | 수정 | "게임 하기" 시 완료된 게임 제외, `QuickReplyContext`에 `playedTodayGameIds` 추가 |
| `src/features/ai-consult/lib/gameRouter.ts`            | 수정 | `GameSelectContext`에 `playedTodayGameIds` 전달, 완료된 게임 진입 차단           |
| `src/features/ai-consult/constants/gameList.ts`        | 수정 | `GAME_LIST`에 `missionUuid` 필드 추가                                            |
| `src/pages/ChatPage.tsx`                               | 수정 | 퀵리플라이 빈 배열 폴백 처리, `playedTodayGameIds` 전달                          |
| `src/widgets/layout/Header.tsx`                        | 수정 | `Astroid` → `UserRound` 아이콘 교체                                              |
| `src/features/ai-consult/ui/ChatMenuBar.tsx`           | 수정 | `useClickOutside` ref 확장, 레포트 버튼 추가                                     |
| `src/features/games/ui/game/RuletteGame.tsx`           | 수정 | 휠/섹터 시각화 UI로 재작성                                                       |
| `src/features/reward/ui/coupon/MyCouponContent.tsx`    | 수정 | 배지 잔액 표시, 쿠폰 클릭 시 바코드 모달                                         |
| `src/features/reward/ui/coupon/CouponBarcodeModal.tsx` | 생성 | 바코드 표시 모달                                                                 |
| `src/entities/reward/model/reward.ts`                  | 수정 | `Coupon` 타입에 `barcode` 필드 추가                                              |
| `src/features/reward/api/getMyCoupons.ts`              | 수정 | 쿼리에 `barcode` 포함, 매핑에 추가                                               |
| `src/features/ai-consult/ui/AIChatExtras.tsx`          | 수정 | 레포트 버튼 제거 (메뉴바로 이동)                                                 |
| `src/features/ai-consult/ui/ReportGenerateButton.tsx`  | 수정 | 미사용 — 제거 또는 메뉴바용으로 이관                                             |

---

## Task 1: 채팅 경로 게임 배지 정산 + 재진입 방지 (#3 + #6)

**Files:**

- Modify: `src/features/ai-consult/constants/gameList.ts`
- Modify: `src/features/ai-consult/model/useChat.tsx:284-296`
- Modify: `src/features/ai-consult/lib/quickReplyRouter.ts:31-55, 92-115`
- Modify: `src/features/ai-consult/lib/gameRouter.ts:15-40`
- Modify: `src/pages/ChatPage.tsx:76-81, 109-118`

**Interfaces:**

- Consumes: `useMissionCompletion`의 `playedTodayGameIds: Set<string>`, `recordPlay`
- Produces: `openSheetGame`가 `onWin` 콜백을 내부적으로 연결, `QuickReplyContext.playedTodayGameIds` 필드

**배경:** 현재 채팅 경로 `openSheetGame`이 `onWin`을 전달하지 않아 배지 적립이 안 되고, `playedTodayGameIds`가 퀵리플라이에 연결되지 않아 완료된 게임도 재진입 가능함.

- [ ] **Step 1: `GAME_LIST`에 `missionUuid` 필드 추가**

`src/features/ai-consult/constants/gameList.ts`의 `GameMeta` 타입과 `GAME_LIST` 배열에 각 게임의 미션 UUID를 추가한다. UUID는 `src/features/reward/mocks/missions.ts`에서 가져온다.

```ts
// GameMeta 타입에 missionUuid 추가 (line 10-17)
export type GameMeta = {
  id: ChatGameId | SheetGameId;
  title: string;
  description: string;
  type: 'chat' | 'sheet';
  icon: string;
  reward?: number;
  missionUuid: string; // game_results.game_id와 매핑되는 미션 UUID
};

// GAME_LIST 각 항목에 missionUuid 추가
// 'card-match': '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f101'
// 'reaction': '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f102'
// 'attendance': '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f103'
// 'scratch': '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f104'
// 'ox': '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f105'
// 'multiple-choice': '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f106'
```

- [ ] **Step 2: `useChat`의 `openSheetGame`에 `onWin` 연결**

`src/features/ai-consult/model/useChat.tsx`의 `openSheetGame`(line 291-296)을 수정하여 `GameId` → `missionUuid` 매핑 후 `recordPlay` + `GetBadgeModal`을 `onWin`으로 연결한다.

```tsx
// line 291-296 수정
const openSheetGame = useCallback(
  (gameId: GameId, reward?: number) => {
    const gameMeta = GAME_LIST.find((g) => g.id === gameId);
    const missionUuid = gameMeta?.missionUuid;
    openGameStore(gameId, {
      reward,
      source: 'chat',
      onWin: (wonReward) => {
        if (!missionUuid) return;
        recordPlay(
          { gameId: missionUuid, score: wonReward },
          {
            onSuccess: () => {
              openModal({ content: <GetBadgeModal badgeCount={wonReward} /> });
            },
          },
        );
      },
    });
  },
  [openGameStore, recordPlay, openModal],
);
```

`GAME_LIST` import 추가: `import { GAME_LIST } from '../constants/gameList';` (이미 quickReplyRouter에서 사용 중이지만 useChat에는 없음)

- [ ] **Step 3: `useChat`에서 `playedTodayGameIds` 노출**

`useChat`의 return 객체(line 554-586)에 `playedTodayGameIds` 추가. `useMissionCompletion`는 이미 line 72에서 호출 중이므로 `playedTodayGameIds`를 가져온다.

```tsx
// line 72 근처 — useMissionCompletion에서 playedTodayGameIds도 가져오기
const { recordPlay, playedTodayGameIds } = useMissionCompletion();

// return 객체에 추가 (line 586 근처)
return {
  // ... 기존 필드들 ...
  playedTodayGameIds,
};
```

- [ ] **Step 4: `QuickReplyContext`에 `playedTodayGameIds` 추가**

`src/features/ai-consult/lib/quickReplyRouter.ts`의 `QuickReplyContext` 인터페이스(line 31-55)에 필드 추가.

```ts
export interface QuickReplyContext {
  // ... 기존 필드들 ...
  playedTodayGameIds: Set<string>;
  // ...
}
```

`routeQuickReply` 함수 내 destructuring(line 64-83)에 `playedTodayGameIds` 추가.

- [ ] **Step 5: "게임 하기" 퀵리플라이에서 완료된 게임 제외**

`quickReplyRouter.ts`의 "게임 하기" 분기(line 92-104)를 수정하여 `playedTodayGameIds`에 포함된 게임을 제외한다.

```ts
// line 92-104 수정
if (text === '게임 하기') {
  const availableGames = GAME_LIST.filter(
    (g) => !playedTodayGameIds.has(g.missionUuid),
  );
  const gameTitles = availableGames.map((g) => g.title);
  const message =
    availableGames.length === 0
      ? '오늘은 모든 게임을 플레이하셨어요! 내일 다시 만나요.'
      : '원하는 게임을 선택해 주세요!';
  setMessages((prev) => [
    ...prev,
    { id: Date.now(), type: 'user', sentence: '게임 하기', category: 'game' },
    buildAIMessage(message, [...gameTitles, '메뉴로 돌아가기'], {
      category: 'game',
    }),
  ]);
  return 'handled';
}
```

- [ ] **Step 6: 게임 선택 시 완료 여부 재확인**

`quickReplyRouter.ts`의 게임 매칭 분기(line 107-115)에 완료된 게임 차단 추가.

```ts
// line 107-115 수정
const matchedGame = GAME_LIST.find((g) => g.title === text);
if (matchedGame) {
  if (playedTodayGameIds.has(matchedGame.missionUuid)) {
    setMessages((prev) => [
      ...prev,
      buildAIMessage(
        '오늘은 이미 플레이한 게임이에요. 내일 다시 도전해 주세요!',
        ['게임 하기', '메뉴로 돌아가기'],
        { category: 'game' },
      ),
    ]);
    return 'handled';
  }
  handleGameSelect(matchedGame.id as ChatGameId | SheetGameId, {
    setMessages,
    startQuiz,
    openSheetGame,
  });
  return 'handled';
}
```

- [ ] **Step 7: `useChat.handleSend`에 `playedTodayGameIds` 전달**

`useChat.tsx`의 `handleSend`(line 298-421)에서 `routeQuickReply` 호출(line 313-347)에 `playedTodayGameIds` 추가.

```tsx
// line 313-347의 routeQuickReply 호출에 추가
const result = await routeQuickReply({
  text: trimmed,
  messages,
  profile,
  isLoggedIn,
  effectiveCurrentPlan,
  setMessages,
  setProfile,
  setIsLoading,
  addAIResponse,
  openSubscription,
  openSignupChat,
  startCompareFlow,
  setPendingComparePlan,
  fetchCompare,
  startQuiz,
  openSheetGame,
  playedTodayGameIds,
  signal,
  retryLastInput: () => {
    /* 기존 코드 유지 */
  },
});
```

`handleSend`의 dependency array(line 399-420)에 `playedTodayGameIds` 추가.

- [ ] **Step 8: `ChatPage`에서 `playedTodayGameIds` 받아서 전달**

`src/pages/ChatPage.tsx`의 `useChat()` destructuring(line 16-48)에 `playedTodayGameIds` 추가. 이 값은 `handleSend` 내부에서 사용되므로 별도 전달이 필요하지 않다 — `handleSend`가 `useChat` 내부에서 `playedTodayGameIds`를 참조하므로.

실제로는 Step 7에서 `useChat` 내부의 `playedTodayGameIds`를 `routeQuickReply`에 넘기므로, `ChatPage`에서 추가로 넘겨줄 것은 없다. 이 스텝은 확인용이다.

- [ ] **Step 9: lint 및 build 확인**

Run: `npm run lint`
Expected: PASS (에러 없음)

Run: `npm run build`
Expected: PASS (타입 에러 없음)

- [ ] **Step 10: 수동 검증**

개발 서버 실행 후:

1. 채팅에서 "게임 하기" → 게임 목록 확인
2. "반응속도 탭 게임" 선택 → 게임 완료 → 배지 획득 모달 확인
3. 다시 "게임 하기" → 완료한 게임이 목록에서 제외되었는지 확인
4. "카드 맞추기"도 동일하게 확인

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "fix: 채팅 경로 게임 배지 정산 연결 및 완료된 게임 재진입 방지

- openSheetGame에 onWin 콜백 연결 (recordPlay + GetBadgeModal)
- GAME_LIST에 missionUuid 필드 추가
- 퀵리플라이 '게임 하기'에서 오늘 완료한 게임 제외
- 게임 선택 시 완료 여부 재확인 차단

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Task 2: 추천폼 진입 후 퀵리플라이 유지 (#8)

**Files:**

- Modify: `src/pages/ChatPage.tsx:76-81`

**배경:** 백엔드가 폼 응답 시 `quickReplies: []`를 반환하면, 프론트가 빈 배열을 truthy로 처리해 `QuickReplies`가 `null`을 반환하여 퀵리플라이가 사라짐. 폼 진입 중에도 웰컴 메뉴를 유지하도록 폴백 처리.

- [ ] **Step 1: `ChatPage` 퀵리플라이 계산 로직 수정**

`src/pages/ChatPage.tsx` line 76-81을 수정하여 빈 배열일 때 웰컴 퀵리플라이로 폴백.

```tsx
// line 76-81 수정
const lastMessage = messages[messages.length - 1];
// 빈 배열일 때도 웰컴 퀵리플라이로 폴백 — 폼 진입 등으로 quickReplies: []가 내려올 때 메뉴 유지
const quickReplies =
  lastMessage?.type === 'ai' &&
  lastMessage.quickReplies &&
  lastMessage.quickReplies.length > 0
    ? lastMessage.quickReplies
    : getWelcomeQuickReplies(isLoggedIn);
```

- [ ] **Step 2: lint 및 build 확인**

Run: `npm run lint`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: 수동 검증**

1. "요금제 추천받기" 클릭 → 추천 폼 진입
2. 폼 진입 후에도 퀵리플라이 메뉴가 유지되는지 확인

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: 추천 폼 진입 후 퀵리플라이 사라짐 현상 수정

빈 quickReplies 배열일 때 웰컴 퀵리플라이로 폴백하도록 수정

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Task 3: 알림 클릭 시 마이메뉴 닫힘 수정 (#19)

**Files:**

- Modify: `src/features/ai-consult/ui/ChatMenuBar.tsx:27-37`

**배경:** `ChatMenuBar`의 `useClickOutside`가 `containerRef`(메뉴 바 본인) 밖 클릭을 외부로 취급하여, Header의 Bell 클릭 시 메뉴가 먼저 닫힘. Header를 ref에 포함시키기 어려우므로, `useClickOutside`의 active 조건을 조정하여 Header 영역 클릭 시 메뉴가 닫히지 않도록 처리.

**접근:** Header의 Bell 버튼은 `ChatMenuBar`와 형제 레벨에 있어 ref로 포함하기 어려움. 대신 `useClickOutside`의 active 조건에서 Header 클릭 시 비활성화하는 대신, 더 간단한 방법으로: 메뉴가 열려 있을 때 Header 클릭으로 메뉴가 닫히는 것은 자연스러운 동작이지만, **마이페이지/시트가 열려 있을 때는 메뉴가 이미 닫혀 있어야 함**. 핵심 문제는 MyPageSheet 열린 상태에서 Bell 클릭 시 MyPageSheet가 닫히는 것.

`ChatMenuBar`의 `useClickOutside`는 이미 `!myPageOpen && !planOpen && !rewardOpen && !reportOpen` 조건으로 시트 열린 동안 비활성화됨. 따라서 시트 열린 상태에서는 `useClickOutside`가 메뉴를 닫지 않음. 문제는 `vaul` Drawer의 Overlay가 Header 영역도 덮어서, Overlay 클릭 시 시트가 먼저 닫히는 것.

**해결:** MyPageSheet 등 시트가 열린 상태에서는 Header의 Bell 클릭이 Overlay에 가로채이지 않도록, 시트의 `dismissible`을 유지하되 Bell 클릭 이벤트가 Overlay에 의해 무시되도록 Header에 z-index를 높이거나, 시트 열린 상태에서 Bell 클릭을 별도로 처리.

가장 간단한 해결: Header에 `z-50`을 주어 BottomSheet Overlay(`z-40`) 위에 렌더링되도록 한다.

- [ ] **Step 1: Header z-index 조정**

`src/widgets/layout/Header.tsx` line 15의 className에 `z-50` 추가.

```tsx
// line 15 수정
<div className="sticky top-0 z-50 w-full bg-surface-card flex gap-3 px-4 py-3 items-center border-b border-border">
```

이렇게 하면 BottomSheet의 Overlay(`z-40`)보다 Header가 위에 렌더링되어, 시트 열린 상태에서도 Bell 클릭이 Overlay에 가로채이지 않고 직접 전달됨.

- [ ] **Step 2: lint 및 build 확인**

Run: `npm run lint`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: 수동 검증**

1. 메뉴바에서 마이페이지 열기
2. 마이페이지 열린 상태에서 Header의 Bell(알림) 클릭
3. 마이페이지가 닫히지 않고 알림 모달이 열리는지 확인
4. 반대로 알림 모달 닫기 후 마이페이지가 여전히 열려 있는지 확인

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: 알림 클릭 시 마이메뉴가 닫히는 현상 수정

Header z-index를 BottomSheet Overlay보다 높여 시트 열린 상태에서도 알림 클릭이 작동하도록 수정

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Task 4: 쿠폰함 바코드 모달 및 배지 잔액 표시 (#20)

**Files:**

- Modify: `src/entities/reward/model/reward.ts:23-30`
- Modify: `src/features/reward/api/getMyCoupons.ts:16-21, 36-50, 54-65`
- Modify: `src/features/reward/ui/coupon/MyCouponContent.tsx`
- Create: `src/features/reward/ui/coupon/CouponBarcodeModal.tsx`

**배경:** DB `coupons` 테이블에 `barcode` 컬럼이 있고 `postExchange`에서 발급하지만, `getMyCoupons` 쿼리에서 제외되고 `Coupon` 타입에도 없어 UI에서 바코드를 표시할 수 없음. 또한 쿠폰함에 배지 잔액 표시가 없음.

- [ ] **Step 1: `Coupon` 타입에 `barcode` 추가**

`src/entities/reward/model/reward.ts` line 23-30의 `Coupon` 타입에 `barcode` 필드 추가.

```ts
export type Coupon = {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  expiresAt: string;
  status: CouponStatus;
  barcode: string; // DB coupons.barcode — 바코드 모달에서 표시
};
```

- [ ] **Step 2: `getMyCoupons` 쿼리에 `barcode` 포함**

`src/features/reward/api/getMyCoupons.ts` 수정:

`MyCouponRow` 타입(line 16-21)에 `barcode` 추가:

```ts
type MyCouponRow = {
  id: string;
  status: 'unused' | 'used';
  expired_at: string | null;
  barcode: string;
  products: CouponProductJoin | CouponProductJoin[] | null;
};
```

`toCoupon` 함수(line 36-50)에 `barcode` 매핑 추가:

```ts
function toCoupon(row: MyCouponRow): Coupon {
  const product = Array.isArray(row.products)
    ? (row.products[0] ?? null)
    : row.products;

  return {
    id: row.id,
    name: product?.name ?? '',
    brand: product?.description ?? '',
    imageUrl: getProductImage(product?.image ?? null),
    expiresAt: row.expired_at ? dayjs(row.expired_at).format('YYYY.MM.DD') : '',
    status: toCouponStatus(row.status, row.expired_at),
    barcode: row.barcode ?? '',
  };
}
```

`getMyCoupons` 함수(line 54-65)의 select 쿼리에 `barcode` 추가:

```ts
const { data, error } = await supabase
  .from('coupons')
  .select(
    'id, status, expired_at, barcode, products(id, name, description, image)',
  )
  .eq('user_id', userId)
  .order('expired_at', { ascending: true });
```

- [ ] **Step 3: `CouponBarcodeModal` 컴포넌트 생성**

`src/features/reward/ui/coupon/CouponBarcodeModal.tsx` 생성 — 쿠폰 클릭 시 바코드를 표시하는 모달.

```tsx
import { X } from 'lucide-react';

import type { Coupon } from '../../types';

type CouponBarcodeModalProps = {
  coupon: Coupon;
  onClose: () => void;
};

// 쿠폰 상세 바코드 모달 — 쿠폰 클릭 시 바코드와 사용 정보를 표시
export default function CouponBarcodeModal({
  coupon,
  onClose,
}: CouponBarcodeModalProps) {
  return (
    <div className="flex flex-col items-center gap-6 px-6 py-8">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-title text-fg-primary">쿠폰 상세</h2>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-fg-tertiary hover:bg-surface-page"
        >
          <X size={18} />
        </button>
      </div>

      <div
        style={{ backgroundImage: `url(${coupon.imageUrl})` }}
        className="aspect-square w-32 rounded-xl bg-surface-page bg-size-[80%] bg-center bg-no-repeat"
      />

      <div className="text-center">
        <h3 className="text-[18px] font-bold text-fg-primary">{coupon.name}</h3>
        <p className="mt-1 text-[14px] text-fg-tertiary">
          유효기간: {coupon.expiresAt}
        </p>
      </div>

      {coupon.barcode && (
        <div className="w-full rounded-xl border border-border bg-surface-page p-4 text-center">
          <p className="mb-2 text-[12px] text-fg-tertiary">바코드</p>
          <p className="font-mono text-[20px] font-bold tracking-widest text-fg-primary">
            {coupon.barcode}
          </p>
        </div>
      )}

      <p className="text-[13px] text-fg-tertiary">
        매장에서 바코드를 제시하여 사용하세요.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: `MyCouponContent`에 배지 잔액 표시 및 바코드 모달 연결**

`src/features/reward/ui/coupon/MyCouponContent.tsx` 수정:

import 추가:

```tsx
import { useBadgeBalance } from '../../model/useBadgeBalance';
import { useModalStore } from '@/shared';
import CouponBarcodeModal from './CouponBarcodeModal';
import Badge from '../shared/Badge';
```

`CouponBox` 컴포넌트 내부에 배지 잔액 조회 및 모달 상태 추가:

```tsx
export default function CouponBox({ onGoToReward }: CouponBoxProps) {
  const [query, setQuery] = useState('');
  const { data: coupons = [], isLoading, error } = useMyCoupons();
  const { data: badgeBalance = 0 } = useBadgeBalance();
  const openModal = useModalStore((state) => state.open);

  // ... 기존 필터링 로직 유지 ...

  // 쿠폰 클릭 시 바코드 모달 열기
  const handleCouponSelect = (coupon: Coupon) => {
    openModal({
      content: <CouponBarcodeModal coupon={coupon} onClose={() => {}} />,
    });
  };
```

배지 잔액 표시를 상단 섹션(line 78-87)에 추가:

```tsx
// line 78-87 수정 — 배지 잔액 표시 추가
<section className="flex items-center justify-between">
  <p className="text-[22px] font-bold leading-[150%] text-fg-primary">
    사용할 수 있는 쿠폰이
    <br />
    <span className="text-brand-promo-primary">
      {availableCoupons.length}개
    </span>{' '}
    있어요
  </p>
  <Badge
    size="large"
    value={badgeBalance}
    ariaLabel={`보유 배지 ${badgeBalance}개`}
  />
</section>
```

`ProductCard`에 `onSelect` 전달 (line 93-95 수정):

```tsx
{
  availableCoupons.map((coupon) => (
    <ProductCard
      key={coupon.id}
      product={coupon}
      onSelect={handleCouponSelect}
    />
  ));
}
```

`Coupon` 타입 import 추가:

```tsx
import type { Coupon } from '../../types';
```

- [ ] **Step 5: lint 및 build 확인**

Run: `npm run lint`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: 수동 검증**

1. 혜택/이벤트 → 쿠폰함 진입
2. 상단에 배지 잔액이 표시되는지 확인
3. 쿠폰 카드 클릭 시 바코드 모달이 열리는지 확인
4. 바코드 번호가 표시되는지 확인

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: 쿠폰함 바코드 모달 및 배지 잔액 표시 추가

- Coupon 타입에 barcode 필드 추가
- getMyCoupons 쿼리에 barcode 포함
- CouponBarcodeModal 컴포넌트 생성
- MyCouponContent 상단에 배지 잔액 표시
- 쿠폰 카드 클릭 시 바코드 모달 열기

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Task 5: 헤더 아이콘 교체 (Astroid → UserRound) (#11)

**Files:**

- Modify: `src/widgets/layout/Header.tsx:1, 44-55`

**배경:** 비로그인 상태에서 `Astroid` 아이콘을 사용 중이나, `lucide-react` 표준 이름인지 불확실하고 `UserRound`로 교체 요청.

- [ ] **Step 1: `Header.tsx` import 및 아이콘 교체**

`src/widgets/layout/Header.tsx` line 1의 import에서 `Astroid` 제거, `UserRound` 추가:

```tsx
// line 1 수정
import { Bell, UserRound, DoorOpen } from 'lucide-react';
```

line 44-55의 비로그인 아이콘 교체:

```tsx
// line 44-55 수정
) : (
  <UserRound
    size={22}
    className="shrink-0"
    onClick={() =>
      open({
        title: '회원관리',
        content: <SigninModal />,
      })
    }
  />
)}
```

- [ ] **Step 2: lint 및 build 확인**

Run: `npm run lint`
Expected: PASS

Run: `npm run build`
Expected: PASS (Astroid 미존재로 인한 빌드 오류가 있었다면 해결됨)

- [ ] **Step 3: 수동 검증**

1. 비로그인 상태에서 Header 우측 아이콘이 UserRound(사람 모양)로 표시되는지 확인
2. 클릭 시 회원관리 모달이 열리는지 확인

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: 헤더 비로그인 아이콘 Astroid를 UserRound로 교체

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Task 6: 출석 룰렛 휠/섹터 시각화 (#13)

**Files:**

- Modify: `src/features/games/ui/game/RuletteGame.tsx`

**배경:** 현재 룰렛이 단순 원형 + 텍스트 + `rotate-1080` 회전. 실제 룰렛 휠처럼 색상 섹터 + 포인터 + 당첨 금액 표시로 개선.

**접근:** CSS `conic-gradient`로 섹터를 그리고, 회전 시 당첨 섹터가 포인터 위치에 오도록 각도 계산. `REWARD_OPTIONS = [1, 3, 5, 10]`을 4개 섹터로 표현.

- [ ] **Step 1: `RuletteGame` 휠/섹터 UI 재작성**

`src/features/games/ui/game/RuletteGame.tsx` 전체 재작성:

```tsx
import { useState } from 'react';

import { Button } from '@/shared';

import { ATTENDANCE_RULES } from '../../mocks/rules';
import GameResultCard from '../GameResultCard';
import GameRulesCard from '../GameRulesCard';
import GameShell from '../GameShell';

import type { GamePhase } from '../../types';

const SPIN_DURATION = 3000; // ms — 휠이 도는 시간
const REWARD_OPTIONS = [1, 3, 5, 10];

// 각 섹터의 색상 — 시계 방향으로 배치
const SECTOR_COLORS = [
  'var(--color-brand-promo-primary)',
  'var(--color-brand-secondary)',
  'var(--color-brand-promo-secondary)',
  'var(--color-brand-primary)',
];

// conic-gradient 문자열 생성 — n개 섹터를 균등 분할
function buildConicGradient(colors: string[], sectorCount: number): string {
  const segmentSize = 360 / sectorCount;
  const stops = colors
    .map(
      (color, i) =>
        `${color} ${i * segmentSize}deg ${(i + 1) * segmentSize}deg`,
    )
    .join(', ');
  return `conic-gradient(${stops})`;
}

// 당첨 섹터 인덱스를 랜덤으로 선택하고, 해당 섹터가 포인터(상단)에 오도록 회전 각도 계산
function calculateRotation(sectorIndex: number, sectorCount: number): number {
  const sectorSize = 360 / sectorCount;
  // 섹터 중앙이 상단(0deg)에 오도록 — 시계 방향이므로 음수 회전
  const targetAngle = -(sectorIndex * sectorSize + sectorSize / 2);
  // 3바퀴 회전 + 목표 각도
  return 360 * 3 + targetAngle;
}

type RuletteGameProps = {
  reward?: number;
  onWin?: (reward: number) => void;
  onClose?: () => void;
};

export default function RuletteGame({
  reward,
  onWin,
  onClose,
}: RuletteGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState(0);

  const handleStart = () => {
    setPhase('playing');
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // reward가 고정되어 있지 않으면 랜덤 선택
    const sectorIndex = reward
      ? REWARD_OPTIONS.indexOf(reward)
      : Math.floor(Math.random() * REWARD_OPTIONS.length);
    const picked = REWARD_OPTIONS[sectorIndex] ?? REWARD_OPTIONS[0];
    const targetRotation = calculateRotation(
      sectorIndex >= 0 ? sectorIndex : 0,
      REWARD_OPTIONS.length,
    );

    setRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWonReward(picked);
      onWin?.(picked);
      setPhase('result');
    }, SPIN_DURATION);
  };

  return (
    <GameShell
      phase={phase}
      intro={<GameRulesCard {...ATTENDANCE_RULES} onStart={handleStart} />}
      playing={
        <div className="flex h-full flex-col items-center justify-center gap-8 px-10">
          {/* 룰렛 휠 — conic-gradient 섹터 + 포인터 */}
          <div className="relative">
            {/* 상단 포인터 */}
            <div className="absolute left-1/2 top-[-8px] z-10 -translate-x-1/2">
              <div className="h-0 w-0 border-x-[10px] border-t-[16px] border-x-transparent border-t-fg-primary" />
            </div>
            {/* 휠 본체 */}
            <div
              className="h-60 w-60 rounded-full border-8 border-surface-card shadow-lg"
              style={{
                background: buildConicGradient(
                  SECTOR_COLORS,
                  REWARD_OPTIONS.length,
                ),
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning
                  ? `transform ${SPIN_DURATION}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
                  : 'none',
              }}
            >
              {/* 섹터 라벨 — 각 섹터 중앙에 배지 수 표시 */}
              {REWARD_OPTIONS.map((value, i) => {
                const sectorSize = 360 / REWARD_OPTIONS.length;
                const angle = i * sectorSize + sectorSize / 2;
                return (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 origin-top"
                    style={{
                      transform: `rotate(${angle}deg) translateY(-100px)`,
                    }}
                  >
                    <span className="block -translate-x-1/2 text-[18px] font-bold text-white drop-shadow">
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* 중앙 허브 */}
            <div className="absolute left-1/2 top-1/2 z-10 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-surface-card bg-surface-page shadow-md" />
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSpin}
            disabled={isSpinning}
          >
            {isSpinning ? '돌아가는 중...' : '룰렛 돌리기'}
          </Button>
        </div>
      }
      result={
        <GameResultCard
          image={ATTENDANCE_RULES.image}
          title={`${wonReward}배지 획득!`}
          description="내일 또 출석하고 룰렛을 돌려보세요."
          onClose={onClose}
        />
      }
    />
  );
}
```

- [ ] **Step 2: lint 및 build 확인**

Run: `npm run lint`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: 수동 검증**

1. 혜택/이벤트 → 출석 룰렛 미션 시작
2. 룰렛 휠에 4개 색상 섹터와 배지 수(1, 3, 5, 10)가 표시되는지 확인
3. "룰렛 돌리기" 클릭 시 휠이 3바퀴 회전 후 멈추는지 확인
4. 포인터가 가리키는 섹터의 배지 수가 결과에 표시되는지 확인

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 출석 룰렛 휠/섹터 시각화 UI로 개편

conic-gradient 기반 4섹터 휠, 포인터, 배지 수 라벨, 3바퀴 회전 애니메이션 적용

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Task 7: 레포트 생성 버튼 위치 이동 (#14)

**Files:**

- Modify: `src/features/ai-consult/ui/ChatMenuBar.tsx`
- Modify: `src/features/ai-consult/ui/AIChatExtras.tsx:86-97`
- Modify: `src/pages/ChatPage.tsx`

**배경:** 현재 레포트 생성 버튼이 `RecommendationCards` 내부와 `AIChatExtras`의 일반 AI 메시지 하단에 있음. 이를 메뉴바(ChatMenuBar)의 "상담 리포트" 메뉴에서 접근할 수 있도록 이동. 이미 `ChatMenuBar`에 `ReportSheet`가 열리는 메뉴 아이콘이 있음.

**접근:** `ChatMenuBar`의 "상담 리포트" 아이콘 클릭 시 `ReportSheet`가 열릨. `ReportSheet`는 기존 저장된 레포트 목록을 보여줌. 레포트 **생성** 버튼을 `ReportSheet` 내부에 추가하거나, `ChatMenuBar`에서 직접 생성 버튼을 노출.

가장 간단한 접근: `AIChatExtras`의 독립 `ReportGenerateButton`(line 86-97)을 제거하고, `ReportSheet` 내부에 "레포트 생성" 버튼을 추가. 단, `ReportSheet`는 `features/consult-report`에 있으므로 생성 콜백을 prop으로 받아야 함.

**수정 범위 최소화 접근:** `AIChatExtras`의 독립 버튼(line 86-97)을 제거하고, `RecommendationCards` 내 버튼은 유지. 대신 `ChatMenuBar`의 "상담 리포트" 메뉴에 `canShowReportButton` 상태를 전달하여, `ReportSheet` 열기 전에 생성 가능 여부를 안내.

더 간단하게: `AIChatExtras`의 독립 버튼을 제거하고, `ReportSheet`에 `onGenerateReport` 콜백을 prop으로 전달하여 `ReportSheet` 내부에 생성 버튼을 추가.

- [ ] **Step 1: `AIChatExtras`에서 독립 레포트 버튼 제거**

`src/features/ai-consult/ui/AIChatExtras.tsx` line 86-97 제거:

```tsx
// line 86-97 제거 — 메뉴바의 ReportSheet로 이동
// {/* 요금제 추천이 없는 일반 대화에서 5회 AI 응답 후 리포트 생성 버튼 노출 (회원 전용) */}
// {isLast && canShowReportButton && !hasRecommendations && !message.report && isLoggedIn && (
//   <ReportGenerateButton onGenerate={() => requestGenerateReport([])} ... />
// )}
```

실제 코드에서는 이 블록을 삭제. `ReportGenerateButton` import도 제거.

- [ ] **Step 2: `ReportSheet`에 레포트 생성 버튼 추가**

`src/features/consult-report/ui/ReportSheet.tsx`를 확인하여, `onGenerateReport` prop을 추가하고 빈 상태(저장된 레포트 없음)일 때 생성 버튼을 노출.

먼저 `ReportSheet.tsx`를 읽어야 함 — 이 태스크 실행 시 파일을 읽고 수정.

`ReportSheet`에 다음 prop 추가:

```tsx
type ReportSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateReport?: () => void; // 새 레포트 생성 버튼
  canGenerateReport?: boolean; // 생성 가능 여부 (AI 응답 5회 이상)
  isGeneratingReport?: boolean;
};
```

빈 상태 또는 상단에 "레포트 생성" 버튼 추가.

- [ ] **Step 3: `ChatMenuBar`에서 `ReportSheet`에 생성 콜백 전달**

`src/features/ai-consult/ui/ChatMenuBar.tsx`의 `ReportSheet`(line 104)에 props 추가. 이를 위해 `ChatMenuBar`에 `onGenerateReport`, `canShowReportButton`, `isGeneratingReport` props를 추가하고 `ChatInput` → `ChatPage`에서 전달.

`ChatMenuBar` props에 추가:

```tsx
interface ChatMenuBarProps {
  isMenuOpen: boolean;
  onMenuClose: () => void;
  onStartQuiz?: (quizType: QuizKind) => void;
  onStartScratch?: (reward?: number) => void;
  onGenerateReport?: () => void;
  canShowReportButton?: boolean;
  isGeneratingReport?: boolean;
}
```

`ReportSheet` 렌더(line 104)에 props 전달:

```tsx
<ReportSheet
  open={reportOpen}
  onOpenChange={setReportOpen}
  onGenerateReport={onGenerateReport}
  canGenerateReport={canShowReportButton}
  isGeneratingReport={isGeneratingReport}
/>
```

- [ ] **Step 4: `ChatInput` → `ChatPage` prop 전달 체인 구성**

`ChatInput.tsx`에 `onGenerateReport`, `canShowReportButton`, `isGeneratingReport` props를 추가하고 `ChatMenuBar`에 전달.

`ChatPage.tsx`에서 `useChat()`의 `handleGenerateReport`, `canShowReportButton`, `isGeneratingReport`를 `ChatInput`에 전달.

- [ ] **Step 5: lint 및 build 확인**

Run: `npm run lint`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: 수동 검증**

1. AI 응답 5회 이상 대화 후 메뉴바 → "상담 리포트" 클릭
2. `ReportSheet`에 레포트 생성 버튼이 표시되는지 확인
3. 생성 버튼 클릭 → 확인 모달 → 레포트 생성되는지 확인
4. 일반 AI 메시지 하단에 더 이상 독립 버튼이 표시되지 않는지 확인

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: 레포트 생성 버튼을 메뉴바 ReportSheet로 이동

AIChatExtras의 독립 레포트 버튼 제거, ReportSheet 내부에 생성 버튼 추가

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Phase 2: 미룬 QA 항목 (Task 8~16)

> Phase 1(Task 1~7) 완료 후 진행. 사용자가 "시간 남으면 포함"으로 지정한 항목들.

---

## Task 8: 퀵리플라이/메뉴 동시 토글 현상 (#1)

**Files:**

- Modify: `src/pages/ChatPage.tsx`
- Modify: `src/features/ai-consult/ui/ChatInput.tsx`
- Modify: `src/features/ai-consult/ui/QuickReplies.tsx`

**배경:** "퀵리플라이 열고 닫으면 메뉴까지 한 번에 열고 닫히는 현상" — QuickReplies의 접기/펼치기 토글과 ChatInput의 메뉴 버튼 토글이 시각적으로 연동되어 보임. 두 상태(`isQuickRepliesCollapsed` in ChatPage, `isMenuOpen` in ChatInput)는 독립적이나, 레이아웃상 인접해 있어 애니메이션이 동시에 일어나는 것처럼 보임.

**접근:**

1. 퀵리플라이 접기 시 메뉴가 열려있으면 메뉴도 닫기 (상태 동기화)
2. 메뉴 열기 시 퀵리플라이가 펼쳐져 있으면 접기 (상태 동기화)
3. 또는 두 영역 사이에 시각적 구분선 추가하여 독립성 명확화

**선택한 접근:** 상태 동기화 — 한쪽을 토글하면 다른 쪽은 닫도록 통제.

- [ ] **Step 1: ChatInput에 메뉴 토글 시 퀵리플라이 접기 콜백 추가**

`ChatInput.tsx`에 `onMenuToggle` 콜백 prop 추가. 메뉴가 열릴 때 상위(ChatPage)에서 퀵리플라이를 접도록 알림.

```tsx
// ChatInputProps에 추가
interface ChatInputProps {
  // ... 기존 props ...
  onMenuOpenChange?: (isOpen: boolean) => void;
}

// 메뉴 버튼 onClick 수정 (line 60)
onClick={() => {
  const next = !isMenuOpen;
  setIsMenuOpen(next);
  onMenuOpenChange?.(next);
}}
```

- [ ] **Step 2: ChatPage에서 메뉴 열림 시 퀵리플라이 접기**

`ChatPage.tsx`에서 `ChatInput`에 `onMenuOpenChange` 전달.

```tsx
// ChatInput 렌더 (line 119-128)에 추가
<ChatInput
  // ... 기존 props ...
  onMenuOpenChange={(isOpen) => {
    if (isOpen) setIsQuickRepliesCollapsed(true);
  }}
/>
```

- [ ] **Step 3: QuickReplies 펼치기 시 메뉴 닫기**

QuickReplies의 `onToggleCollapse` 호출 시 메뉴도 닫히도록 ChatPage에서 처리. 현재 `onToggleCollapse`는 `setIsQuickRepliesCollapsed((prev) => !prev)`로 동작. 펼칠 때 메뉴를 닫도록 수정.

```tsx
// ChatPage line 115-117 수정
onToggleCollapse={() => {
  setIsQuickRepliesCollapsed((prev) => {
    const next = !prev;
    // 퀵리플라이를 펼칠 때는 메뉴를 닫지 않음 (둘 다 펼칠 수 있음)
    // 접을 때도 메뉴에 영향 없음
    return next;
  });
}}
```

실제로는 Step 2만으로 충분 — 메뉴를 열면 퀵리플라이가 접히므로, 퀵리플라이를 펼쳤을 때 메뉴가 이미 닫혀있는 상태. 이 Step은 확인용.

- [ ] **Step 4: lint 및 build 확인**

Run: `npm run lint && npm run build`
Expected: PASS

- [ ] **Step 5: 수동 검증**

1. 퀵리플라이가 펼쳐진 상태에서 메뉴 버튼 클릭 → 퀵리플라이가 접히고 메뉴만 열리는지 확인
2. 메뉴가 열린 상태에서 퀵리플라이 펼치기 → 정상 동작 확인
3. 두 영역이 독립적으로 동작하는지 확인

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix: 퀵리플라이와 메뉴 토글 동시 동작 현상 수정

메뉴 열림 시 퀵리플라이를 자동으로 접어 두 영역이 동시에 열리지 않도록 통제

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Task 9: 스크래치 쿠폰함 이동 버튼 (#5)

**Files:**

- Modify: `src/features/games/ui/game/ScratchGame.tsx:17, 345-353`
- Modify: `src/features/ai-consult/model/useChat.tsx:239-263`
- Modify: `src/pages/ChatPage.tsx`

**배경:** ScratchGame의 "쿠폰함 확인하기" 버튼이 `onClose`만 호출하여 게임을 닫을 뿐, 쿠폰함으로 이동하지 않음. `onClose`는 `closeSheetGame` → `useGameStore.closeGame()`로 연결되어 바텀시트가 닫히기만 함.

**접근:** ScratchGame에 `onGoToCoupon` 콜백 prop 추가. useChat의 `startScratch`에서 scratch-game 메시지에 `onGoToCoupon`을 전달하고, 이 콜백이 RewardSheet의 쿠폰함 뷰를 열도록 연결.

단, ScratchGame은 채팅 메시지로 렌더링되므로 (`type: 'scratch-game'`), GameLayer를 통하지 않음. `ChatMessageList`에서 scratch-game 메시지를 렌더링할 때 `onGoToCoupon` prop을 전달해야 함.

더 간단한 접근: "쿠폰함 확인하기" 버튼 클릭 시 `useModalStore`로 쿠폰함 모달을 직접 열거나, ChatMenuBar의 RewardSheet를 쿠폰함 뷰로 열기. 하지만 RewardSheet는 ChatMenuBar 내부 상태이므로 직접 접근이 어려움.

**가장 간단한 접근:** "쿠폰함 확인하기" 버튼 클릭 시 전역 모달 스토어로 안내 메시지 + "혜택/이벤트 메뉴에서 쿠폰함을 확인하세요" 안내. 또는 RewardSheet를 별도로 열 수 있는 전역 상태 추가.

**실제 구현:** ScratchGame의 `onClose` 대신 별도 `onGoToCoupon` 콜백을 추가하고, useChat에서 이를 처리하여 채팅에 안내 메시지를 추가 + 메뉴바의 RewardSheet를 열도록 전역 상태 사용.

`useSignupIntentStore`와 유사한 패턴으로 `useRewardIntentStore` 생성 — 외부에서 RewardSheet를 쿠폰함 뷰로 열라는 신호를 보냄.

- [ ] **Step 1: `useRewardIntentStore` 전역 상태 생성**

`src/features/reward/model/useRewardIntentStore.ts` 생성:

```ts
import { create } from 'zustand';

type RewardView = 'reward' | 'coupon' | 'store';

interface RewardIntentState {
  pendingView: RewardView | null;
  openRewardView: (view: RewardView) => void;
  consume: () => void;
}

// 외부(ScratchGame 등)에서 RewardSheet의 특정 뷰를 열라는 신호를 보낼 때 사용
export const useRewardIntentStore = create<RewardIntentState>((set) => ({
  pendingView: null,
  openRewardView: (view) => set({ pendingView: view }),
  consume: () => set({ pendingView: null }),
}));
```

- [ ] **Step 2: ChatMenuBar에서 RewardIntent 신호 처리**

`ChatMenuBar.tsx`에서 `useRewardIntentStore`를 구독하여 `pendingView`가 설정되면 RewardSheet를 열고 해당 뷰로 이동.

```tsx
// ChatMenuBar에 import 추가
import { useRewardIntentStore } from '@/features/reward/model/useRewardIntentStore';

// 컴포넌트 내부에 추가
const pendingRewardView = useRewardIntentStore((state) => state.pendingView);
const consumeRewardIntent = useRewardIntentStore((state) => state.consume);

useEffect(() => {
  if (pendingRewardView) {
    setRewardOpen(true);
    // RewardSheet의 goToView를 호출해야 하므로, viewEntryKey와 activeView를 직접 설정
    // 하지만 activeView는 RewardSheet 내부 상태이므로, prop으로 전달해야 함
    consumeRewardIntent();
  }
}, [pendingRewardView, consumeRewardIntent]);
```

`RewardSheet`에 `initialView` prop 추가:

```tsx
type RewardSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: RewardView;
  onStartQuiz?: (quizType: QuizKind) => void;
  onStartScratch?: (reward?: number) => void;
};
```

`RewardSheet` 내부에서 `initialView`가 변경되면 `setActiveView` 호출.

- [ ] **Step 3: ScratchGame에 `onGoToCoupon` prop 추가**

`ScratchGame.tsx`의 props에 `onGoToCoupon?: () => void` 추가. "쿠폰함 확인하기" 버튼이 `onGoToCoupon`을 우선 호출하도록 수정.

```tsx
type ScratchGameProps = {
  reward?: number;
  onWin?: (reward: number) => void;
  onClose?: () => void;
  onGoToCoupon?: () => void;
};

// 버튼 onClick 수정 (line 350)
<Button
  variant="secondary"
  size="sm"
  round
  className="mt-1"
  onClick={() => {
    onGoToCoupon?.();
    onClose?.();
  }}
>
  {CTA_LABEL}
</Button>;
```

- [ ] **Step 4: useChat에서 scratch-game 메시지에 onGoToCoupon 연결**

`useChat.tsx`의 `startScratch`와 `onScratchWin`에서 ScratchGame에 `onGoToCoupon`을 전달하도록 수정. 단, scratch-game은 채팅 메시지 타입이므로 `ChatMessageList`에서 렌더링 시 prop을 전달해야 함.

`ChatMessage` 타입에 `onGoToCoupon`을 직접 넣을 수 없으므로, `ChatMessageList`에서 scratch-game 메시지 렌더링 시 `useRewardIntentStore.openRewardView('coupon')`을 호출하는 버튼을 직접 연결.

`ChatMessageList`에서 ScratchGame 렌더 부분 확인 후 수정.

- [ ] **Step 5: lint 및 build 확인**

Run: `npm run lint && npm run build`
Expected: PASS

- [ ] **Step 6: 수동 검증**

1. 스크래치 이벤트 진행 → 카드 긁기 완료
2. "쿠폰함 확인하기" 버튼 클릭
3. RewardSheet가 열리며 쿠폰함 뷰가 표시되는지 확인

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "fix: 스크래치 쿠폰함 이동 버튼 작동하도록 수정

useRewardIntentStore 전역 상태로 ScratchGame에서 쿠폰함 뷰를 직접 열도록 연결

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Task 10: 요금제 가입 신청 완료창 줄어듦 (#7)

**Files:**

- Modify: `src/features/plan-subscription/ui/PlanSubscriptionSheet.tsx:482-483`

**배경:** `complete` 단계에서 `size: 'content'`(`max-h-[60dvh]`)를 사용하여 이전 단계(`large`, `h-[85dvh]`)보다 시트가 줄어듦. vaul Drawer의 높이 변화 애니메이션이 어색함.

- [ ] **Step 1: complete 단계 size를 'large'로 변경**

`PlanSubscriptionSheet.tsx` line 482-483 수정:

```tsx
// line 482-483 수정
const size: SubscriptionShell['size'] = 'large';
```

`complete` 단계도 `large`(`h-[85dvh]`)를 사용하도록 변경. 시트 높이가 단계 전환 중 변하지 않음.

- [ ] **Step 2: lint 및 build 확인**

Run: `npm run lint && npm run build`
Expected: PASS

- [ ] **Step 3: 수동 검증**

1. 요금제 가입 플로우 진행 → 약관 동의 → 신청 완료
2. 완료 화면에서 시트 높이가 이전 단계와 동일하게 유지되는지 확인

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: 요금제 가입 완료창 높이 줄어듦 현상 수정

complete 단계의 BottomSheet size를 content에서 large로 변경

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Task 11: 출석체크 기능 + 연속 출석 (#9 + #2)

**Files:**

- Modify: `src/features/ai-consult/lib/quickReplyRouter.ts:117-130`
- Modify: `src/features/ai-consult/model/useChat.tsx`

**배경:**

- #9: "퀵리플라이 출석체크 → 룰렛 말고 출첵 기능으로" — 현재 "출석체크" 퀵리플라이가 `openSheetGame('attendance', 5)`로 룰렛 게임을 엶. 실제 출석체크(CheckIn 컴포넌트 + postCheckIn API)가 이미 구현되어 있으나 연결되지 않음.
- #2: "연속 출석 n일째 적용 안 됨" — 출석체크가 룰렛 게임으로 대체되어 `attendances` 테이블에 기록이 남지 않으므로 `attendance_streaks`가 갱신되지 않음.

**접근:** "출석체크" 퀵리플라이를 룰렛 게임 대신 RewardSheet의 출석체크(CheckIn) 뷰로 연결. Task 9에서 생성한 `useRewardIntentStore`를 재활용하여 RewardSheet를 'reward' 뷰로 열면 CheckIn 컴포넌트가 상단에 표시됨.

**추가 고려:** 출석체크 완료 후 룰렛을 돌리는 보너스 기능을 유지하려면, 출석체크 완료 후 룰렛 게임을 옵션으로 열 수 있도록 분리. 단, 사용자 요청은 "룰렛 말고 출첵 기능으로"이므로 룰렛을 제거하고 순수 출석체크로 변경.

- [ ] **Step 1: "출석체크" 퀵리플라이 분기를 출석체크 기능으로 변경**

`quickReplyRouter.ts` line 117-130 수정:

```ts
// "출석체크" 퀵 리플라이 — 출석체크 기능으로 연결 (룰렛 게임이 아님)
if (text === '출석체크') {
  setMessages((prev) => [
    ...prev,
    {
      id: Date.now(),
      type: 'user',
      sentence: '출석체크',
      category: 'attendance',
    },
    buildAIMessage(
      '출석체크 메뉴를 열었어요. 출석하고 배지를 받아보세요!',
      ['메뉴로 돌아가기'],
      { category: 'attendance' },
    ),
  ]);
  // RewardSheet를 열어 CheckIn 컴포넌트 표시
  openRewardView('reward');
  return 'handled';
}
```

`QuickReplyContext`에 `openRewardView: (view: 'reward' | 'coupon' | 'store') => void` 추가.

- [ ] **Step 2: useChat에서 openRewardView 전달**

`useChat.tsx`에서 `useRewardIntentStore`의 `openRewardView`를 가져와 `routeQuickReply`에 전달.

```tsx
// useChat 내부에 추가
const openRewardView = useRewardIntentStore((state) => state.openRewardView);

// routeQuickReply 호출에 추가 (handleSend 내)
const result = await routeQuickReply({
  // ... 기존 필드 ...
  openRewardView,
});
```

`quickReplyRouter.ts`의 destructuring에 `openRewardView` 추가.

- [ ] **Step 3: 출석체크 미션의 룰렛 게임을 출석체크 기능으로 변경**

`RewardSheet.tsx`의 `handleMissionAction`에서 `attendance` 미션을 처리할 때 룰렛 게임(`openGame`) 대신 출석체크 모달을 띄우도록 변경. 단, CheckIn은 RewardHome 내부에 있으므로, 출석체크 미션 클릭 시 RewardHome의 CheckIn 영역으로 스크롤하거나 별도 모달로 분리.

가장 간단한 접근: `attendance` 미션 클릭 시 CheckIn의 `handleOpenCheckInModal`을 직접 호출. 이를 위해 CheckIn의 출석 로직을 별도 훅으로 분리하거나, `attendance` 미션은 이미 RewardHome에 CheckIn이 표시되어 있으므로 안내 메시지만 표시.

```tsx
// RewardSheet.tsx handleMissionAction 내부
if (mission.id === 'attendance') {
  // 출석체크는 RewardHome 상단의 CheckIn 컴포넌트에서 처리
  // 시트가 이미 'reward' 뷰이면 CheckIn이 보임, 다른 뷰면 'reward'로 전환
  goToView('reward');
  return;
}
```

- [ ] **Step 4: GAME_LIST에서 attendance 항목 제거 또는 수정**

`gameList.ts`의 `attendance` 항목은 더 이상 게임이 아님. 출석체크는 미션 목록에서 "시작" 대신 "출석" 버튼으로 표시되어야 함.

`missions.ts`의 attendance 미션 `actionLabel`을 `'시작'` → `'출석'`으로 변경.

```ts
// missions.ts attendance 항목 수정
{
  id: 'attendance',
  uuid: '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f103',
  title: '출석 체크',
  reward: 1, // 출석 1회당 배지 1개 (postCheckIn의 CHECK_IN_REWARD_VALUE와 일치)
  actionLabel: '출석',
  icon: 'roulette',
},
```

- [ ] **Step 5: lint 및 build 확인**

Run: `npm run lint && npm run build`
Expected: PASS

- [ ] **Step 6: 수동 검증**

1. 퀵리플라이 "출석체크" 클릭 → RewardSheet가 열리며 CheckIn 컴포넌트 표시
2. "출석 체크" 버튼 클릭 → 출석 완료 → 배지 획득 모달
3. 연속 출석 n일째가 정상 표시되는지 확인 (다음 날 다시 출석)
4. 미션 목록에서 출석 미션이 "완료"로 표시되는지 확인

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: 출석체크를 룰렛 게임에서 실제 출석체크 기능으로 변경

- 퀵리플라이 '출석체크'를 RewardSheet의 CheckIn으로 연결
- attendance 미션 actionLabel을 '출석'으로 변경
- 연속 출석일이 attendances/attendance_streaks 테이블에 정상 갱신되도록 수정

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Task 12: navbar 요금제 비교하기 버튼 작동안함 + 현재 요금제 미적용 (#16 + #18)

**Files:**

- Modify: `src/features/plan-detail/ui/PlanQuickSheet.tsx:92-95`

**배경:**

- #18: "navbar 요금제에서 비교하기 클릭 시 작동안함" — `PlanQuickSheet`의 "비교 하기" 버튼(line 93)에 `onClick` 핸들러가 없음.
- #16: "요금제 비교하기 버튼 시, 현재 요금제 적용 안됨" — 비교하기가 작동해도 현재 요금제가 자동으로 선택되지 않음.

**접근:** `PlanQuickSheet`의 "비교 하기" 버튼에 비교 플로우를 연결. `useChatCompare`의 `fetchCompare`를 사용하거나, `PlanCompare` 컴포넌트를 직접 렌더. 단, `PlanQuickSheet`는 채팅 외부의 독립 시트이므로 채팅의 `useChatCompare`를 직접 사용할 수 없음.

**구현:** "비교 하기" 클릭 시 `PlanCompare`를 별도 BottomSheet로 렌더. 현재 요금제는 `useCurrentPlan`으로 조회, 선택된 요금제는 `selectedPlan`을 사용.

- [ ] **Step 1: PlanQuickSheet에 비교 시트 상태 추가**

`PlanQuickSheet.tsx`에 비교 모달 상태와 데이터 준비.

```tsx
// import 추가
import { useCurrentPlan } from '@/entities/plan';
import { useIsLoggedIn } from '@/entities/user';
import PlanCompare, {
  type PlanCompareData,
} from '@/features/plan-change/ui/PlanCompare';

// 컴포넌트 내부에 추가
const isLoggedIn = useIsLoggedIn();
const { data: currentPlan = null } = useCurrentPlan(isLoggedIn);
const [compareOpen, setCompareOpen] = useState(false);

// 비교 데이터 생성
const compareData: PlanCompareData | null = useMemo(() => {
  if (!selectedPlan || !currentPlan) return null;
  return {
    currentPlanName: currentPlan.planName,
    currentFee: `${currentPlan.monthlyFee?.toLocaleString() ?? '-'}원`,
    currentDiscount: '-',
    currentData: currentPlan.data ?? '-',
    currentTethering: currentPlan.tethering ?? '-',
    currentShareData: currentPlan.shareData ?? '-',
    currentVoice: currentPlan.voice ?? '-',
    currentMessage: currentPlan.message ?? '-',
    selectedPlanName: selectedPlan.name,
    selectedFee: `${selectedPlan.monthlyFee.toLocaleString()}원`,
    selectedDiscount: '-',
    selectedData: selectedPlan.data ?? '-',
    selectedTethering: selectedPlan.tethering ?? '-',
    selectedShareData: selectedPlan.shareData ?? '-',
    selectedVoice: selectedPlan.voice ?? '-',
    selectedMessage: selectedPlan.message ?? '-',
  };
}, [selectedPlan, currentPlan]);
```

- [ ] **Step 2: "비교 하기" 버튼에 onClick 추가**

```tsx
// line 93 수정
<Button
  variant="outline"
  size="lg"
  className="flex-1"
  onClick={() => setCompareOpen(true)}
  disabled={!currentPlan}
>
  비교 하기
</Button>
```

`currentPlan`이 없으면 버튼 비활성화 + 툴팁 안내.

- [ ] **Step 3: 비교 BottomSheet 렌더 추가**

`PlanQuickSheet`의 JSX에 비교 시트 추가:

```tsx
{
  /* 기 BottomSheet 내부 또는 별도로 */
}
<BottomSheet
  open={compareOpen}
  onOpenChange={setCompareOpen}
  title="요금제 비교"
  size="large"
  bodyClassName="px-0"
>
  {compareData && (
    <PlanCompare
      data={compareData}
      onChangePlan={() => {
        setCompareOpen(false);
        setIsSubscribeOpen(true);
      }}
      className="w-full"
    />
  )}
</BottomSheet>;
```

- [ ] **Step 4: lint 및 build 확인**

Run: `npm run lint && npm run build`
Expected: PASS

- [ ] **Step 5: 수동 검증**

1. 메뉴바 → 요금제 → 요금제 선택 → "비교 하기" 버튼 클릭
2. 비교 시트가 열리고 현재 요금제 vs 선택 요금제가 표시되는지 확인
3. "요금제 변경하기" 버튼 클릭 → 가입 플로우로 전환되는지 확인
4. 현재 요금제가 없을 때 "비교 하기" 버튼이 비활성화되는지 확인

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix: navbar 요금제 비교하기 버튼 작동 및 현재 요금제 자동 적용

PlanQuickSheet의 비교하기 버튼에 onClick 연결, useCurrentPlan으로 현재 요금제 자동 조회

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Task 13: navbar 요금제 sort 드롭다운 (#17)

**Files:**

- Modify: `src/features/plan-detail/ui/PlanSearchBar.tsx`
- Modify: `src/features/plan-detail/ui/PlanCatalogList.tsx`

**배경:** "navbar 요금제에서 sort 드롭다운으로 선택하도록 변경하기" — 현재 `PlanSearchBar`의 정렬 버튼이 `onCycleSort`로 클릭마다 `recommended → priceAsc → priceDesc`를 순환함. 드롭다운으로 직접 선택할 수 있도록 변경.

- [ ] **Step 1: PlanSearchBar를 드롭다운으로 변경**

`PlanSearchBar.tsx` 전체 수정 — `onCycleSort` 대신 `onSortChange: (sort: SortOption) => void` prop 사용. 드롭다운은 HTML `<select>` 또는 커스텀 드롭다운 컴포넌트.

```tsx
import { ArrowUpDown, Search, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { SORT_LABELS } from '../types';
import { useClickOutside } from '@/shared';

import type { SortOption } from '../types';

interface PlanSearchBarProps {
  sort: SortOption;
  onOpenFilter: () => void;
  onSortChange: (sort: SortOption) => void;
}

export default function PlanSearchBar({
  sort,
  onOpenFilter,
  onSortChange,
}: PlanSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, isOpen, () => setIsOpen(false));

  const options: SortOption[] = ['recommended', 'priceAsc', 'priceDesc'];

  return (
    <div className="flex items-center gap-3 bg-surface-page">
      <button
        type="button"
        onClick={onOpenFilter}
        className="flex flex-1 items-center gap-1 text-[14px] font-medium text-fg-tertiary"
      >
        <Search size={17} />
        검색필터
      </button>

      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex shrink-0 items-center gap-1 text-[14px] font-medium text-fg-tertiary"
        >
          <ArrowUpDown size={17} />
          {SORT_LABELS[sort]}
          <ChevronDown
            size={14}
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <ul className="absolute right-0 top-full mt-1 z-10 min-w-[120px] rounded-lg border border-border bg-surface-card py-1 shadow-md">
            {options.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => {
                    onSortChange(option);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-[13px] transition-colors hover:bg-surface-page ${
                    option === sort
                      ? 'font-semibold text-brand-promo-primary'
                      : 'text-fg-secondary'
                  }`}
                >
                  {SORT_LABELS[option]}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: PlanCatalogList에서 onCycleSort를 onSortChange로 변경**

`PlanCatalogList.tsx` line 50 수정:

```tsx
<PlanSearchBar
  sort={sort}
  onOpenFilter={handleOpenFilter}
  onSortChange={setSort}
/>
```

- [ ] **Step 3: lint 및 build 확인**

Run: `npm run lint && npm run build`
Expected: PASS

- [ ] **Step 4: 수동 검증**

1. 메뉴바 → 요금제 → 정렬 버튼 클릭 → 드롭다운 표시
2. 각 옵션(추천순, 낮은 가격순, 높은 가격순) 클릭 시 목록이 정렬되는지 확인
3. 드롭다운 외부 클릭 시 닫히는지 확인

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 요금제 정렬을 드롭다운으로 선택하도록 변경

순환식 정렬 버튼을 드롭다운 메뉴로 변경하여 직접 정렬 옵션 선택 가능

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Task 14: 요금제 비교하기 변경 (#10)

**Files:**

- Modify: `src/features/plan-compare/ui/CompareResultSheet.tsx`
- Modify: `src/features/plan-change/ui/PlanCompare.tsx`

**배경:** "요금제 비교하기 변경" — 구체적 요구사항이 불명확. 현재 비교 기능은 채팅 경로(추천 카드의 비교 버튼, "현재 요금제와 비교" 퀵리플라이)와 메뉴바 경로(Task 12에서 추가)로 동작. 사용자 피드백을 기반으로 UX 개선이 필요할 수 있음.

**가능한 개선 사항:**

1. 비교 결과에 "절감액" 표시 추가 (현재 `CompareResultSheet`에 절감액 없음)
2. 비교 결과 시트의 "요금제 변경하기" 버튼을 가입 플로우로 직접 연결
3. 비교 결과에 혜택(benefit) 행 추가 — 현재 `toPlanCompareData`가 benefitRows를 생성하지 않음

**구현:** `CompareResultSheet`의 `toPlanCompareData`에 `benefitRows` 추가 및 절감액 표시.

> **주의:** 이 태스크는 사용자 추가 명확화가 필요할 수 있음. 실행 전 사용자에게 구체적 요구사항 확인 권장.

- [ ] **Step 1: CompareResultSheet에 절감액 표시 추가**

`CompareResultSheet.tsx`의 요약 영역(line 50-56)에 절감액 표시 추가:

```tsx
// line 50-56 수정
<div className="mt-2 rounded-2xl bg-surface-page p-3 text-center">
  <p className="text-body-sm font-medium text-fg-primary">
    {result.planA.planName} <span className="text-fg-tertiary">vs</span>{' '}
    {result.planB.planName}
  </p>
  {result.savingAmount !== undefined && result.savingAmount > 0 && (
    <p className="mt-1 text-caption text-brand-promo-primary">
      월 {result.savingAmount.toLocaleString()}원 절약
    </p>
  )}
</div>
```

- [ ] **Step 2: toPlanCompareData에 benefitRows 추가**

`CompareResultSheet.tsx`의 `toPlanCompareData`에 `benefits` 필드 매핑 추가 (RecommendedPlan의 benefits 배열을 benefitRows로 변환).

```tsx
function toPlanCompareData(result: CompareResult): PlanCompareData {
  const { planA, planB } = result;
  const benefitRows = (planB.benefits ?? []).map((benefit, i) => ({
    key: `benefit-${i}`,
    label: '혜택',
    current: planA.benefits?.[i] ?? '-',
    selectedSummary: benefit,
  }));

  return {
    // ... 기존 필드 ...
    benefitRows,
  };
}
```

- [ ] **Step 3: lint 및 build 확인**

Run: `npm run lint && npm run build`
Expected: PASS

- [ ] **Step 4: 수동 검증**

1. 채팅에서 요금제 추천 → "현재 요금제와 비교" 클릭
2. 비교 결과에 절감액이 표시되는지 확인
3. 비교 상세 보기에 혜택 행이 표시되는지 확인

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 요금제 비교 결과에 절감액 및 혜택 행 추가

CompareResultSheet에 savingAmount 표시, benefitRows 매핑 추가

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Task 15: 카드 게임 맞추기 개선 (#12)

**Files:**

- Modify: `src/features/games/ui/game/CardMatchGame.tsx`

**배경:** "카드 게임 맞추기" — 구체적 요구사항이 불명확. 현재 `CardMatchGame`은 6쌍(12장), 40초 제한, 점수 시스템으로 동작. 가능한 개선 사항:

1. 게임 완료 시 배지 정산이 되지 않을 수 있음 — `onWin`이 `matchedCount === PAIR_COUNT`일 때만 호출됨 (시간 초과 시 onWin 미호출)
2. 카드 매칭 시 시각적 피드백 부족
3. 난이도 조절 기능 (TODO 주석이 있음)

**핵심 확인:** 시간 초과로 게임이 끝난 경우 `onWin`이 호출되지 않아 배지를 받지 못함. 부분 매칭에 대한 보상이 필요할 수 있음.

> **주의:** 이 태스크는 사용자 추가 명확화가 필요할 수 있음.

- [ ] **Step 1: 시간 초과 시 부분 보상 지급**

`CardMatchGame.tsx`의 시간 초과 처리(line 101-108)에 `onWin` 호출 추가:

```tsx
// line 101-108 수정
const timer = setTimeout(() => {
  setTimeLeft((t) => {
    if (t <= 1) {
      setPhase('result');
      // 부분 매칭 보상 — 맞춘 쌍 수만큼 배지 지급 (최소 1쌍 이상 시)
      if (matchedCount > 0) {
        onWin?.(Math.min(matchedCount, reward));
      }
      return 0;
    }
    return t - 1;
  });
}, 1000);
```

단, `matchedCount`가 timer callback 내에서 stale closure 문제를 일으킬 수 있으므로 ref로 최신값을 참조해야 함.

```tsx
// matchedCount ref 추가
const matchedCountRef = useRef(matchedCount);
useEffect(() => {
  matchedCountRef.current = matchedCount;
}, [matchedCount]);

// timer 내부에서는 matchedCountRef.current 사용
if (matchedCountRef.current > 0) {
  onWin?.(Math.min(matchedCountRef.current, reward));
}
```

- [ ] **Step 2: lint 및 build 확인**

Run: `npm run lint && npm run build`
Expected: PASS

- [ ] **Step 3: 수동 검증**

1. 카드 맞추기 게임 진행 → 일부만 맞추고 시간 초과
2. 맞춘 쌍 수만큼 배지가 지급되는지 확인
3. 모두 맞추었을 때 정상적으로 배지가 지급되는지 확인

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: 카드 맞추기 게임 시간 초과 시 부분 매칭 보상 지급

시간 초과로 게임이 끝나도 맞춘 쌍 수만큼 배지를 지급하도록 수정

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Task 16: 스크래치 이벤트 개선 (#15)

**Files:**

- Modify: `src/features/ai-consult/lib/gameRouter.ts:77-87`
- Modify: `src/features/ai-consult/constants/gameList.ts`

**배경:** "스크래치 이벤트" — 구체적 요구사항이 불명확. 현재 스크래치 이벤트는 채팅 게임으로 동작하며, `gameRouter.ts`에서 `scratch-game` 메시지를 채팅에 추가. 가능한 개선 사항:

1. 스크래치 이벤트 개요/설명 화면 부족 — `GAME_INTRO.scratch`는 있으나 상세 설명 부족
2. 스크래치 이벤트 진입 시 보상 범위 안내 (1~5배지 랜덤)
3. 스크래치 완료 후 "쿠폰함 확인하기" 버튼 작동 (Task 9에서 처리)

**구현:** 스크래치 이벤트 설명 메시지에 보상 범위 안내 추가.

> **주의:** 이 태스크는 사용자 추가 명확화가 필요할 수 있음. Task 9(쿠폰함 이동 버튼)와 연관됨.

- [ ] **Step 1: 스크래치 이벤트 설명 메시지 개선**

`gameList.ts`의 `GAME_INTRO.scratch` 수정:

```ts
// gameList.ts GAME_INTRO 수정
scratch: '스크래치 이벤트를 시작할게요!\n카드를 긁어서 1~5개 배지를 받아보세요.',
```

- [ ] **Step 2: 스크래치 이벤트 미션 보상 범위 안내**

`missions.ts`의 scratch 미션 `reward`를 범위로 표현하기 어려우므로, `MissionItem`에서 scratch 미션일 경우 "배지 1~5개"로 표시하도록 수정.

```tsx
// MissionItem.tsx line 56-58 수정
<span className="flex items-center gap-1 text-medium-12-130 text-fg-tertiary">
  <img src={badgeImage} alt="" className="h-3.5 w-3.5" />
  {mission.id === 'scratch'
    ? `배지 1~${mission.reward}개`
    : `배지 ${mission.reward}개`}
</span>
```

- [ ] **Step 3: lint 및 build 확인**

Run: `npm run lint && npm run build`
Expected: PASS

- [ ] **Step 4: 수동 검증**

1. 스크래치 이벤트 진입 시 안내 메시지에 보상 범위(1~5배지) 표시 확인
2. 미션 목록에서 스크래치 이벤트 보상이 "배지 1~3개"로 표시되는지 확인

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 스크래치 이벤트 보상 범위 안내 추가

게임 설명과 미션 목록에 스크래치 보상 범위(1~N개) 표시

Generated with [Devin](https://devin.ai)

Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
```

---

## Self-Review

### 1. Spec coverage (전체 20개 QA 항목)

| #   | QA 항목                             | Task                 | 상태                                    |
| --- | ----------------------------------- | -------------------- | --------------------------------------- |
| 1   | 퀵리플라이/메뉴 동시 토글           | Task 8               | Phase 2                                 |
| 2   | 연속 출석 n일째 적용 안 됨          | Task 11 (#9와 통합)  | Phase 2                                 |
| 3   | 반응속도 게임 배지 정산             | Task 1               | Phase 1                                 |
| 4   | 스크래치 배지 정산                  | —                    | 이미 구현됨 (onScratchWin → recordPlay) |
| 5   | 스크래치 쿠폰함 이동 버튼           | Task 9               | Phase 2                                 |
| 6   | 게임 완료 후 재진입                 | Task 1               | Phase 1                                 |
| 7   | 요금제 가입 완료창 줄어듦           | Task 10              | Phase 2                                 |
| 8   | 추천폼 진입 후 퀵리플라이 사라짐    | Task 2               | Phase 1                                 |
| 9   | 출석체크 → 룰렛 말고 출첵 기능      | Task 11              | Phase 2                                 |
| 10  | 요금제 비교하기 변경                | Task 14              | Phase 2 (명확화 필요)                   |
| 11  | 헤더 아이콘 변경                    | Task 5               | Phase 1                                 |
| 12  | 카드 게임 맞추기                    | Task 15              | Phase 2 (명확화 필요)                   |
| 13  | 출석 룰렛 UI 변경                   | Task 6               | Phase 1                                 |
| 14  | 레포트 생성 위치 변경               | Task 7               | Phase 1                                 |
| 15  | 스크래치 이벤트                     | Task 16              | Phase 2 (명확화 필요)                   |
| 16  | 요금제 비교 버튼 현재 요금제 미적용 | Task 12              | Phase 2                                 |
| 17  | navbar sort 드롭다운                | Task 13              | Phase 2                                 |
| 18  | navbar 비교하기 작동안함            | Task 12 (#16과 통합) | Phase 2                                 |
| 19  | 알림 시 마이메뉴 닫힘               | Task 3               | Phase 1                                 |
| 20  | 쿠폰함 바코드/배지 표시             | Task 4               | Phase 1                                 |

### 2. 명확화 필요 항목

- #10 (Task 14): "요금제 비교하기 변경"의 구체적 요구사항 — 절감액 표시, 혜택 행 추가로 해석했으나 확인 필요
- #12 (Task 15): "카드 게임 맞추기"의 구체적 요구사항 — 시간 초과 보상으로 해석했으나 확인 필요
- #15 (Task 16): "스크래치 이벤트"의 구체적 요구사항 — 보상 범위 안내로 해석했으나 확인 필요

### 3. Type consistency

- `Coupon` 타입에 `barcode: string` 추가 → `getMyCoupons` 매핑, `CouponBarcodeModal` props, `MyCouponContent`에서 일관되게 사용
- `GameMeta.missionUuid: string` → `quickReplyRouter`, `gameRouter`, `useChat`에서 일관되게 사용
- `QuickReplyContext.playedTodayGameIds: Set<string>` → `useChat`에서 `useMissionCompletion`의 반환 타입과 일치
- `useRewardIntentStore` — Task 9에서 생성, Task 11에서 재활용. `openRewardView: (view: 'reward' | 'coupon' | 'store') => void`
- `RewardSheet.initialView` prop — Task 9에서 추가, `RewardView` 타입은 `RewardSheet` 내부 타입과 일치
- `PlanSearchBar` props 변경 — `onCycleSort` → `onSortChange: (sort: SortOption) => void`, `PlanCatalogList`에서 일관되게 사용

### 4. 의존성 순서

- Task 9(`useRewardIntentStore` 생성)가 Task 11(출석체크에서 재활용)보다 선행되어야 함
- Task 1(`GAME_LIST.missionUuid` 추가)이 모든 게임 관련 태스크보다 선행
- Phase 1(Task 1~~7) 완료 후 Phase 2(Task 8~~16) 진행
