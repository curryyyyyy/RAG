import { test, expect } from '@playwright/test';
import { loginViaUI, navigateTo, waitForStable } from '../../fixtures/test-helpers';

test.describe('用户管理模块', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await navigateTo(page, '用户管理');
    await expect(page).toHaveURL(/\/user/);
    await waitForStable(page);
  });

  test('TC-USER-01: 用户列表正确加载', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '用户列表', exact: true })).toBeVisible();

    // 表格列头
    const table = page.locator('main table').first();
    await expect(table.getByText('用户名')).toBeVisible();
    await expect(table.getByText('标签')).toBeVisible();
    await expect(table.getByText('是否启用')).toBeVisible();
    await expect(table.getByText('创建时间')).toBeVisible();
    await expect(table.getByText('聊天次数')).toBeVisible();
    await expect(table.getByText('LLM额度', { exact: true })).toBeVisible();
    await expect(table.getByText('Embedding额度', { exact: true })).toBeVisible();
  });

  test('TC-USER-02: 用户列表包含数据行', async ({ page }) => {
    await expect(page.getByText('admin').first()).toBeVisible({ timeout: 5000 });
    // 表格中应该有多个用户
    const rows = page.locator('main table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('TC-USER-03: 关键词搜索功能', async ({ page }) => {
    const searchInput = page.getByPlaceholder('请输入关键词');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('admin');
    // 搜索后表格应仍然可见
    await expect(page.locator('main table')).toBeVisible();
  });

  test('TC-USER-04: 组织标签筛选控件存在', async ({ page }) => {
    const orgTagSelect = page.getByText('组织标签').first();
    await expect(orgTagSelect).toBeVisible();
  });

  test('TC-USER-05: 启用状态筛选控件存在', async ({ page }) => {
    const statusSelect = page.getByText('启用状态').first();
    await expect(statusSelect).toBeVisible();
  });

  test('TC-USER-06: LLM 和 Embedding 额度展示', async ({ page }) => {
    // admin 用户的额度信息
    await expect(page.getByText('今日消息数')).first().toBeVisible({ timeout: 3000 });
    // 额度格式: 数字 / 数字
    await expect(page.getByText(/\d[\d,]*\s*\/\s*\d[\d,]*/).first()).toBeVisible();
  });

  test('TC-USER-07: 分配组织标签按钮存在', async ({ page }) => {
    const assignBtn = page.getByRole('button', { name: '分配组织标签' });
    await expect(assignBtn.first()).toBeVisible();
  });

  test('TC-USER-08: 刷新按钮功能', async ({ page }) => {
    const refreshBtn = page.getByRole('button', { name: '刷新' });
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: '用户列表', exact: true })).toBeVisible();
  });

  test('TC-USER-09: 分页控件存在', async ({ page }) => {
    await expect(page.getByText(/页/).first()).toBeVisible({ timeout: 3000 });
  });
});
