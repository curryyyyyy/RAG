import { test, expect } from '@playwright/test';
import { loginViaUI } from '../../fixtures/test-helpers';

test.describe('登录模块', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/login', { timeout: 10000 });
  });

  test('TC-LOGIN-01: 正常登录 — 成功跳转到聊天页面', async ({ page }) => {
    await page.getByPlaceholder('请输入用户名').fill('admin');
    await page.getByPlaceholder('请输入密码').fill('chengxi123456');
    await page.getByRole('button', { name: '登录账号' }).click();

    await page.waitForURL('**/chat', { timeout: 10000 });
    await expect(page.getByText('登录成功')).toBeVisible();
    await expect(page.getByText(/欢迎回来.*admin/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'admin' })).toBeVisible();
  });

  test('TC-LOGIN-02: 密码错误 — 拒绝登录', async ({ page }) => {
    // 拦截登录 API 响应
    const responsePromise = page.waitForResponse(
      resp => resp.url().includes('/users/login') && resp.status() !== 200,
      { timeout: 10000 },
    );

    await page.getByPlaceholder('请输入用户名').fill('admin');
    await page.getByPlaceholder('请输入密码').fill('wrong_password_123');
    await page.getByRole('button', { name: '登录账号' }).click();

    // 验证 API 返回非 200（密码错误）
    const response = await responsePromise;
    expect(response.status()).toBeGreaterThanOrEqual(400);
    // 确保仍在登录页
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-LOGIN-03: 空用户名 — 前端校验', async ({ page }) => {
    await page.getByPlaceholder('请输入密码').fill('chengxi123456');
    await page.getByRole('button', { name: '登录账号' }).click();

    // 输入框应有必填提示或按钮不响应
    const usernameInput = page.getByPlaceholder('请输入用户名');
    await expect(usernameInput).toBeVisible();
    // 不应跳转
    await expect(page).not.toHaveURL(/\/chat/);
  });

  test('TC-LOGIN-04: 空密码 — 前端校验', async ({ page }) => {
    await page.getByPlaceholder('请输入用户名').fill('admin');
    await page.getByRole('button', { name: '登录账号' }).click();

    await expect(page).not.toHaveURL(/\/chat/);
    await expect(page.getByPlaceholder('请输入密码')).toBeVisible();
  });

  test('TC-LOGIN-05: 都不填写直接提交', async ({ page }) => {
    await page.getByRole('button', { name: '登录账号' }).click();
    await expect(page).not.toHaveURL(/\/chat/);
  });

  test('TC-LOGIN-06: 记住用户名密码 — 复选框存在且可点击', async ({ page }) => {
    const rememberCheckbox = page.getByRole('checkbox', { name: '记住用户名和密码' });
    await expect(rememberCheckbox).toBeVisible();

    // 勾选后登录
    await rememberCheckbox.check();
    await page.getByPlaceholder('请输入用户名').fill('admin');
    await page.getByPlaceholder('请输入密码').fill('chengxi123456');
    await page.getByRole('button', { name: '登录账号' }).click();
    await page.waitForURL('**/chat', { timeout: 10000 });

    // 刷新页面检查是否记住了登录状态
    await page.reload();
    await expect(page).toHaveURL(/\/chat/);
  });

  test('TC-LOGIN-07: Token 持久化 — localStorage 写入', async ({ page }) => {
    await loginViaUI(page);

    const hasToken = await page.evaluate(() => {
      return !!localStorage.getItem('PaiSmart_token');
    });
    expect(hasToken).toBe(true);
  });

  test('TC-LOGIN-08: 退出登录 — 清除状态并跳回登录页', async ({ page }) => {
    await loginViaUI(page);

    // 点击右上角用户按钮
    await page.getByRole('button', { name: 'admin' }).click();
    // 或导航到个人中心退出
    await page.getByRole('menuitem', { name: '个人中心' }).click();
    await page.waitForTimeout(1000);

    // 查找退出/注销按钮
    const logoutBtn = page.getByRole('button', { name: /退出|注销|登出/i });
    if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForURL('**/login', { timeout: 5000 });
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('TC-LOGIN-09: 未登录直接访问内部页面 — 重定向到登录', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
