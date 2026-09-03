import { test, expect } from '@playwright/test';

// 회원가입 -> AI 요금제 추천 -> 요금제 가입까지 핵심 골든 패스를 끝까지 실행하는 E2E.
// 주의: 실제 Supabase 프로젝트에 실제 계정을 생성하고, 실제 ai-consult Edge Function(OpenAI)을
// 호출한다. seed.sql의 테스트 계정(user1/2@example.com)은 원격 DB에 적용되어 있지 않아
// 매 실행마다 새 계정을 만든다 — QA_REPORT.md의 "테스트 계정 부재" 항목 참고.
test('signup -> recommend -> subscribe golden path', async ({ page }) => {
  test.setTimeout(120_000);

  const ts = Date.now();
  const email = `qa.playwright.${ts}@example.com`;
  const password = 'TestPassword123!';

  await page.goto('/');
  await page.getByRole('button', { name: '회원 가입하기' }).click();

  await page.getByRole('textbox', { name: '이름' }).fill('QA테스터');
  await page.getByRole('textbox', { name: '생년월일' }).fill('990101');
  await page.getByRole('textbox', { name: '전화번호' }).fill('01099998888');
  await page.getByRole('button', { name: '다음' }).click();

  // OTP는 코드상 mock 처리되어 있어(sendSignupOtp/verifySignupOtp) 어떤 값을 넣어도 통과한다.
  await page.getByPlaceholder('인증번호').fill('123456');
  await page.getByRole('button', { name: '확인' }).click();

  await page.getByPlaceholder('이메일').fill(email);
  await page.getByPlaceholder('비밀번호 (8자 이상)').fill(password);
  await page.getByPlaceholder('비밀번호 확인').fill(password);
  await page.getByRole('button', { name: '다음 >' }).click();

  await page.locator('input[type=checkbox]').check();
  await page.getByRole('button', { name: '가입 완료하기' }).click();
  await expect(page.getByText('회원가입이 완료되었어요')).toBeVisible({
    timeout: 15000,
  });

  // 이후 단계에서 실패하더라도(아래 known bug 참고) 03-general-consult.spec.ts 등
  // 로그인이 필요한 다른 테스트가 이 세션을 재사용할 수 있도록 여기서 먼저 저장한다.
  await page.context().storageState({ path: 'e2e/.auth/qa-user.json' });

  // 가입 직후 로그인 전용 퀵 리플라이가 노출되는지 확인
  await expect(
    page.getByRole('button', { name: '요금제 가입하기' }),
  ).toBeVisible();

  // AI 추천 요청 -> 폼 제출 -> 추천 결과
  await page.getByRole('button', { name: '요금제 추천받기' }).click();
  const recommendButton = page.getByRole('button', { name: '추천 받기' });
  await expect(recommendButton).toBeVisible({ timeout: 20000 });
  await expect(recommendButton).toBeDisabled();
  await page.getByRole('button', { name: '20대' }).click();
  await page.getByRole('button', { name: '5GB 이하' }).click();
  await page.getByRole('button', { name: '5만원 이하' }).click();
  await expect(recommendButton).toBeEnabled();
  await recommendButton.click();

  const subscribeButton = page
    .getByRole('button', { name: '가입 하기' })
    .first();
  await expect(subscribeButton).toBeVisible({ timeout: 20000 });
  await subscribeButton.click();

  // 신규 계정의 첫 가입이므로 "신규 가입"으로 표시되어야 한다 (변경이 아님)
  await expect(page.getByText('신규 가입')).toBeVisible();

  await page.getByRole('button', { name: '다음' }).click(); // 유형 -> 배송
  await page.getByRole('button', { name: 'eSIM' }).click();
  await page.getByRole('button', { name: '다음' }).click(); // 배송 -> 약관

  await page.getByText('모두 동의합니다').click();
  await page.getByRole('button', { name: '신청 완료' }).click();

  // KNOWN BUG (QA_REPORT.md 참고): 방금 가입한 신규 계정의 첫 구독인데도
  // 완료 화면이 "요금제 변경이 완료되었어요"로 표시된다 — PlanSubscriptionSheet의
  // hasCurrentPlan이 'confirm' 단계에서는 정확히 false였다가('신규 가입' 위 assert 참고)
  // 'agreement' 단계 제출 시점에는 true로 뒤집힌다. 고쳐지기 전까지 이 assert는 실패한다.
  await expect(page.getByText('요금제 가입이 완료되었어요')).toBeVisible({
    timeout: 15000,
  });
});
