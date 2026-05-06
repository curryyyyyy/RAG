import { Page, expect } from '@playwright/test';

const TEST_USER = process.env.TEST_USER || 'admin';
const TEST_PASS = process.env.TEST_PASS || 'chengxi123456';

/**
 * 通过 UI 登录系统。要求当前页面为登录页。
 */
export async function loginViaUI(
  page: Page,
  username = TEST_USER,
  password = TEST_PASS,
) {
  await page.goto('/');
  await page.waitForURL('**/login', { timeout: 10000 });
  await page.getByPlaceholder('请输入用户名').fill(username);
  await page.getByPlaceholder('请输入密码').fill(password);
  await page.getByRole('button', { name: '登录账号' }).click();
  await page.waitForURL('**/chat', { timeout: 10000 });
  await expect(page.getByText('登录成功')).toBeVisible({ timeout: 5000 });
}

/**
 * 等待页面加载完成，消除常见 loading 状态。
 */
export async function waitForStable(page: Page) {
  await page.waitForLoadState('networkidle');
  // 等待 naive-ui 的 loading spinner 消失
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
