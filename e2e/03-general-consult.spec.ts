import { test, expect } from '@playwright/test';

// 알려진 버그를 문서화하는 테스트 — QA_REPORT.md #1 참고.
//
// "기타 상담"으로 대화가 한 번이라도 'general' 모드에 들어가면,
// supabase/functions/_shared/ai/recommend.ts의 buildGeneralResponse()가
// LLM을 전혀 호출하지 않고 고정 문구만 돌려준다. 게다가 모드 라우터
// (resolveNextMode)는 다음 메시지에 '추천/비교/가입/상담/문의/질문/도움/게임/출석/레포트'
// 키워드가 없으면 이전 모드를 그대로 유지하므로, 한 번 general에 들어가면
// 서로 다른 질문을 해도 계속 같은 대답만 반복된다.
//
// 이 테스트는 로그인 세션(e2e/.auth/qa-user.json, 02-signup-and-subscribe.spec.ts 실행 후 생성)이
// 필요하다 — 파일명 접두 번호(01/02/03)로 실행 순서를 보장한다. 버그가 고쳐지면
// 이 테스트는 통과로 바뀌어야 하므로 test.fail을 제거할 것.
test.use({ storageState: 'e2e/.auth/qa-user.json' });

test.fail(
  'different follow-up questions in general mode should get different answers',
  async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/');

    const input = page.getByPlaceholder('AI에게 질문해보세요');
    const send = page.getByLabel('메시지 전송');

    await input.fill('기타 상담 부탁해요');
    await send.click();
    await page.waitForTimeout(6000);

    await input.fill('해외 로밍도 되나요');
    await send.click();
    await page.waitForTimeout(6000);
    const answer1 = await page
      .locator('[class*="rounded-tl-sm"]')
      .last()
      .innerText();

    await input.fill('위약금 없이 해지할 수 있나요');
    await send.click();
    await page.waitForTimeout(6000);
    const answer2 = await page
      .locator('[class*="rounded-tl-sm"]')
      .last()
      .innerText();

    // 서로 완전히 다른 질문인데 답변이 토씨 하나 안 틀리고 같다면 버그.
    expect(answer1).not.toBe(answer2);
  },
);
