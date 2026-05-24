import { test, expect } from '@playwright/test';
import { loginViaUI, navigateTo, closeDialog, waitForStable } from '../../fixtures/test-helpers';

test.describe('知识库模块', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await navigateTo(page, '知识库');
  });

  test('TC-KB-01: 文件列表正确加载', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '文件列表', exact: true })).toBeVisible();

    // 表格列头 — 限定在 main 区域或 table 内
    const tableHeader = page.locator('main table').first();
    await expect(tableHeader.getByText('文件名')).toBeVisible();
    await expect(tableHeader.getByText('MD5')).toBeVisible();
    await expect(tableHeader.getByText('文件大小')).toBeVisible();
    await expect(tableHeader.getByText('上传状态')).toBeVisible();
    await expect(tableHeader.getByText('组织标签')).toBeVisible();
    await expect(tableHeader.getByText('上传时间')).toBeVisible();
  });

  test('TC-KB-02: 文件列表包含数据行', async ({ page }) => {
    // 存在已上传的 paismart.pdf
    const fileRow = page.getByText('paismart.pdf');
    await expect(fileRow.first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-KB-03: 新增按钮存在', async ({ page }) => {
    await expect(page.getByRole('button', { name: '新增' })).toBeVisible();
  });

  test('TC-KB-04: 刷新按钮功能', async ({ page }) => {
    const refreshBtn = page.getByRole('button', { name: '刷新' });
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    await page.waitForLoadState('networkidle');
    // 刷新后文件列表仍然可见
    await expect(page.getByRole('heading', { name: '文件列表', exact: true })).toBeVisible();
  });

  test('TC-KB-05: 检索知识库 — 弹窗打开', async ({ page }) => {
    await page.getByRole('button', { name: '检索知识库' }).click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 3000 });
    await expect(dialog.getByText('知识库检索')).toBeVisible();
    await expect(page.getByPlaceholder('请输入关键字')).toBeVisible();
    await expect(page.getByPlaceholder('请输入topK')).toBeVisible();
  });

  test('TC-KB-06: 检索知识库 — 关键字搜索返回结果', async ({ page }) => {
    await page.getByRole('button', { name: '检索知识库' }).click();
    await page.getByPlaceholder('请输入关键字').fill('RAG');
    await page.getByRole('button', { name: '搜索' }).click();
    await page.waitForTimeout(2000);

    // 应显示 Score 评分
    await expect(page.getByText(/Score:/).first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-KB-07: 检索知识库 — 重置搜索表单', async ({ page }) => {
    await page.getByRole('button', { name: '检索知识库' }).click();
    await page.getByPlaceholder('请输入关键字').fill('RAG');
    await page.getByRole('button', { name: '重置' }).click();
    // 关键字应被清空
    await expect(page.getByPlaceholder('请输入关键字')).toHaveValue('');
  });

  test('TC-KB-08: 检索知识库 — close 关闭弹窗', async ({ page }) => {
    await page.getByRole('button', { name: '检索知识库' }).click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'close' }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await expect(dialog).not.toBeVisible();
  });

  test('TC-KB-09: 文件预览 — 打开预览面板', async ({ page }) => {
    await page.getByRole('button', { name: '预览' }).first().click();
    await page.waitForTimeout(1500);

    // 应出现 PDF 预览区域
    const previewPanel = page.locator('text=第').first();
    await expect(previewPanel).toBeVisible({ timeout: 5000 });
  });

  test('TC-KB-10: 文件预览 — 关闭预览', async ({ page }) => {
    await page.getByRole('button', { name: '预览' }).first().click();
    await page.waitForTimeout(1000);

    const closeBtn = page.getByRole('button', { name: '关闭' });
    await closeBtn.click();
    // 应回到只有主内容的视图
    await expect(page.getByText('paismart.pdf').first()).toBeVisible();
  });

  test('TC-KB-11: 列设置按钮存在', async ({ page }) => {
    await expect(page.getByRole('button', { name: '列设置' })).toBeVisible();
  });

  test('TC-KB-12: MD5 值可复制', async ({ page }) => {
    // 在表格内定位 MD5 文本
    const md5Cell = page.locator('main table').getByText('3b97a00d').first();
    await expect(md5Cell).toBeVisible();
    await md5Cell.click();
    // 应有复制成功反馈（naive-ui toast/message，也可能用 text 显示）
    const copied = page.getByText(/复制成功|已复制|Copied/i).first();
    await expect(copied).toBeVisible({ timeout: 5000 });
  });
});
