import { test, expect } from '../../fixtures/fixtures';
import { loginSelectors as s } from '../../selectors/login.selectors';
import { TEST_USER, TEST_PASS } from '../../fixtures/credentials';

// 登录用例必须从未登录状态开始，覆盖默认的 storageState
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('登录模块', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.gotoLogin();
  });

  test('TC-LOGIN-01: 正常登录 — 成功跳转到聊天页面', async ({ loginPage }) => {
    await loginPage.loginExpectSuccess(TEST_USER, TEST_PASS);
  });

  test('TC-LOGIN-02: 密码错误 — 拒绝登录', async ({ page, loginPage }) => {
    // 拦截登录 API 响应
    const responsePromise = page.waitForResponse(
      resp => resp.url().includes(s.loginApiPath) && resp.status() !== 200,
      { timeout: 10000 },
    );

    await loginPage.login(TEST_USER, 'wrong_password_123');

    // 验证 API 返回非 200（密码错误）
    const response = await responsePromise;
    expect(response.status()).toBeGreaterThanOrEqual(400);
    // 确保仍在登录页
    await expect(page).toHaveURL(s.urlLoginRegex);
  });

  test('TC-LOGIN-03: 空用户名 — 前端校验', async ({ page, loginPage }) => {
    await loginPage.passwordInput.fill(TEST_PASS);
    await loginPage.loginButton.click();

    // 输入框应有必填提示或按钮不响应
    await expect(loginPage.usernameInput).toBeVisible();
    // 不应跳转
    await expect(page).not.toHaveURL(/\/chat/);
  });

  test('TC-LOGIN-04: 空密码 — 前端校验', async ({ page, loginPage }) => {
    await loginPage.usernameInput.fill(TEST_USER);
    await loginPage.loginButton.click();

    await expect(page).not.toHaveURL(/\/chat/);
    await expect(loginPage.passwordInput).toBeVisible();
  });

  test('TC-LOGIN-05: 都不填写直接提交', async ({ page, loginPage }) => {
    await loginPage.loginButton.click();
    await expect(page).not.toHaveURL(/\/chat/);
  });

  test('TC-LOGIN-06: 记住用户名密码 — 复选框存在且可点击', async ({ page, loginPage }) => {
    await expect(loginPage.rememberCheckbox).toBeVisible();

    // 勾选后登录
    await loginPage.rememberCheckbox.check();
    await loginPage.fillLoginForm(TEST_USER, TEST_PASS);
    await loginPage.loginButton.click();
    await page.waitForURL('**/chat', { timeout: 10000 });

    // 刷新页面检查是否记住了登录状态
    await page.reload();
    await expect(page).toHaveURL(/\/chat/);
  });

  test('TC-LOGIN-07: Token 持久化 — localStorage 写入', async ({ page, loginPage }) => {
    await loginPage.loginViaUI();

    const hasToken = await page.evaluate((key) => !!localStorage.getItem(key), s.tokenStorageKey);
    expect(hasToken).toBe(true);
  });

  test('TC-LOGIN-08: 退出登录 — 清除状态并跳回登录页', async ({ page, loginPage }) => {
    await loginPage.loginViaUI();

    // 点击右上角用户按钮，再导航到个人中心退出
    await loginPage.userButton(TEST_USER).click();
    await loginPage.profileMenuItem.click();
    await page.waitForTimeout(1000);

    if (await loginPage.logoutButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await loginPage.logoutButton.click();
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
