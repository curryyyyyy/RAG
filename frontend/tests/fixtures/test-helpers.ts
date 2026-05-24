import { Page, expect } from '@playwright/test';

const TEST_USER = process.env.TEST_USER || 'admin';
const TEST_PASS = process.env.TEST_PASS || 'chengxi123456';

async function doLogin(page: Page, username: string, password: string) {
  await page.goto('/');
  await page.waitForURL('**/login', { timeout: 10000 });
  await page.getByPlaceholder('请输入用户名').fill(username);
  await page.getByPlaceholder('请输入密码').fill(password);
  await page.getByRole('button', { name: '登录账号' }).click();

  try {
    await page.waitForURL('**/chat', { timeout: 20000 });
  } catch {
    await page.waitForLoadState('networkidle');
  }
}

/**
 * 通过 UI 登录系统（带重试，应对并发时后端慢响应）。
 */
export async function loginViaUI(
  page: Page,
  username = TEST_USER,
  password = TEST_PASS,
) {
  // 最多重试 2 次
  for (let attempt = 0; attempt < 2; attempt++) {
    await doLogin(page, username, password);

    try {
      await expect(async () => {
        const token = await page.evaluate(() => localStorage.getItem('PaiSmart_token'));
        expect(token).toBeTruthy();
      }).toPass({ timeout: attempt === 0 ? 10000 : 20000 });
      return; // 登录成功
    } catch {
      if (attempt === 0) {
        // 清除可能残留的状态后重试
        await page.evaluate(() => localStorage.clear());
      }
    }
  }
  // 最后一次机会
  await expect(async () => {
    const token = await page.evaluate(() => localStorage.getItem('PaiSmart_token'));
    expect(token).toBeTruthy();
  }).toPass({ timeout: 25000 });
}

/**
 * 等待页面加载完成，消除常见 loading 状态。
 */
export async function waitForStable(page: Page) {
  await page.waitForLoadState('networkidle');
  const spinner = page.locator('.n-spin-container');
  if (await spinner.isVisible().catch(() => false)) {
    await spinner.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }
}

/**
 * 导航到指定菜单项。
 */
export async function navigateTo(page: Page, menuLabel: string) {
  await page.getByRole('menuitem', { name: menuLabel }).click();
  await waitForStable(page);
}

/**
 * 关闭当前打开的对话框。
 */
export async function closeDialog(page: Page) {
  const dialog = page.locator('[role="dialog"]');
  if (await dialog.isVisible().catch(() => false)) {
    await dialog.getByRole('button', { name: 'close' }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
  }
}
