import { test, expect } from '@playwright/test';

const ts = Date.now();
const QA_EMAIL = `qa.playwright.${ts}@example.com`;
const QA_PASSWORD = 'TestPassword123!';

test('complete signup flow and persist session', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '회원 가입하기' }).click();

  // basic-info step
  await page.getByPlaceholder('이름').fill('QA테스터');
  await page.getByPlaceholder('생년월일 6자리 (YYMMDD)').fill('990101');
  await page.getByPlaceholder('전화번호').fill('01099998888');
  await page.getByRole('button', { name: '다음 >' }).click();

  // verify-code step (mocked — any code passes)
  await page.getByPlaceholder('인증번호').fill('123456');
  await page.getByRole('button', { name: '확인' }).click();

  // credentials step
  await page.getByPlaceholder('이메일').fill(QA_EMAIL);
  await page.getByPlaceholder('비밀번호 (8자 이상)').fill(QA_PASSWORD);
  await page.getByPlaceholder('비밀번호 확인').fill(QA_PASSWORD);
  await page.getByRole('button', { name: '다음 >' }).click();

  // review step
  await page.locator('input[type=checkbox]').check();
  await page.getByRole('button', { name: '가입 완료하기' }).click();

  await expect(page.getByText('회원가입이 완료되었어요')).toBeVisible({
    timeout: 15000,
  });
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: 'e2e/.artifacts/signup-complete.png',
    fullPage: true,
  });
  await page.context().storageState({ path: 'e2e/.auth/qa-user.json' });

  console.log('QA_ACCOUNT_EMAIL=' + QA_EMAIL);
});
