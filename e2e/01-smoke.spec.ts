import { test, expect } from '@playwright/test';

// 비로그인 상태에서 앱 진입 시 기본 화면과 로그인 실패 처리를 확인하는 스모크 테스트.
test.describe('guest experience', () => {
  test('welcome message and guest quick replies render', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('AI 요금제 도우미 해리에요')).toBeVisible();

    const expectedReplies = [
      '회원 가입하기',
      '요금제 추천받기',
      '요금제 비교하기',
      '기타 상담',
    ];
    for (const reply of expectedReplies) {
      await expect(page.getByRole('button', { name: reply })).toBeVisible();
    }

    // 비로그인 사용자에게는 노출되면 안 되는 회원 전용 메뉴
    await expect(
      page.getByRole('button', { name: '게임 하기' }),
    ).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: '출석체크' }),
    ).not.toBeVisible();
  });

  test('login with wrong credentials shows an error', async ({ page }) => {
    await page.goto('/');
    await page.locator('svg.lucide-astroid').click();
    await page
      .getByPlaceholder('이메일을 입력하세요')
      .fill('nobody@example.com');
    await page.getByPlaceholder('비밀번호를 입력하세요').fill('wrong-password');
    await page.getByRole('button', { name: '로그인' }).click();

    await expect(page.getByText('Invalid login credentials')).toBeVisible({
      timeout: 10000,
    });
  });

  test('chat input is locked behind login for guests', async ({ page }) => {
    await page.goto('/');
    const input = page.getByPlaceholder('로그인 후 질문할 수 있습니다');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute('readonly', '');
  });
});
