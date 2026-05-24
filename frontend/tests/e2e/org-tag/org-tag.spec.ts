import { test, expect } from '@playwright/test';
import { loginViaUI, navigateTo, waitForStable, closeDialog } from '../../fixtures/test-helpers';

test.describe('组织标签模块', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await navigateTo(page, '组织标签');
    await expect(page).toHaveURL(/\/org-tag/);
    await waitForStable(page);
  });

  test('TC-ORG-01: 标签列表正确加载', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '组织标签', exact: true })).toBeVisible();

    const table = page.locator('main table').first();
    await expect(table.getByText('标签名称')).toBeVisible();
    await expect(table.getByText('描述')).toBeVisible();
    await expect(table.getByText('非Admin上传上限', { exact: true })).toBeVisible();
    await expect(table.getByText('操作')).toBeVisible();
  });

  test('TC-ORG-02: 标签列表包含数据', async ({ page }) => {
    // 系统预置两个标签
    await expect(page.getByText('默认组织').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('管理员组织').first()).toBeVisible();
  });

  test('TC-ORG-03: 新增标签 — 弹窗打开', async ({ page }) => {
    await page.getByRole('button', { name: '新增' }).click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 3000 });
    // 关闭弹窗恢复状态
    await closeDialog(page);
  });

  test('TC-ORG-04: 编辑标签 — 弹窗打开', async ({ page }) => {
    await page.getByRole('button', { name: '编辑' }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 3000 });
    await closeDialog(page);
  });

  test('TC-ORG-05: 新增下级标签 — 弹窗打开', async ({ page }) => {
    await page.getByRole('button', { name: '新增下级' }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 3000 });
    await closeDialog(page);
  });

  test('TC-ORG-06: 删除标签 — 确认弹窗', async ({ page }) => {
    await page.getByRole('button', { name: '删除' }).first().click();
    // naive-ui 可能出现 confirm dialog
    const confirmDialog = page.locator('[role="dialog"], .n-modal');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    // 取消删除
    await page.getByRole('button', { name: /取消|取 消/i }).click();
    await expect(confirmDialog).not.toBeVisible({ timeout: 3000 });
  });

  test('TC-ORG-07: 刷新按钮功能', async ({ page }) => {
    const refreshBtn = page.getByRole('button', { name: '刷新' });
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('默认组织').first()).toBeVisible();
  });

  test('TC-ORG-08: 列设置按钮存在', async ({ page }) => {
    await expect(page.getByRole('button', { name: '列设置' })).toBeVisible();
  });

  test('TC-ORG-09: 分页控件存在', async ({ page }) => {
    await expect(page.getByText(/页/).first()).toBeVisible({ timeout: 3000 });
  });
});
