import { test, expect } from '@playwright/test';
import { KnowledgeBasePage } from '../../pages/KnowledgeBasePage';
import { knowledgeBaseSelectors as s } from '../../selectors/knowledge-base.selectors';

test.describe('知识库模块', () => {
  let kbPage: KnowledgeBasePage;

  test.beforeEach(async ({ page }) => {
    // storageState 已登录
    kbPage = new KnowledgeBasePage(page);
    await kbPage.goto('/');
    await kbPage.waitForStable();
    await kbPage.navigateTo('知识库');
  });

  test('TC-KB-01: 文件列表正确加载', async () => {
    await expect(kbPage.heading).toBeVisible();

    // 表格列头 — 限定在 main 区域或 table 内
    for (const header of s.tableHeaders) {
      await expect(kbPage.table.getByText(header)).toBeVisible();
    }
  });

  test('TC-KB-02: 文件列表包含数据行', async () => {
    // 存在已上传的 paismart.pdf
    await expect(kbPage.fileRow.first()).toBeVisible({ timeout: 5000 });
  });

  test('TC-KB-03: 新增按钮存在', async () => {
    await expect(kbPage.button(s.buttonNames.add)).toBeVisible();
  });

  test('TC-KB-04: 刷新按钮功能', async ({ page }) => {
    const refreshBtn = kbPage.button(s.buttonNames.refresh);
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    await page.waitForLoadState('networkidle');
    // 刷新后文件列表仍然可见
    await expect(kbPage.heading).toBeVisible();
  });

  test('TC-KB-05: 检索知识库 — 弹窗打开', async () => {
    await kbPage.openSearchDialog();
    await expect(kbPage.dialog).toBeVisible({ timeout: 3000 });
    await expect(kbPage.dialog.getByText(s.searchDialogTitle)).toBeVisible();
    await expect(kbPage.keywordInput).toBeVisible();
    await expect(kbPage.topKInput).toBeVisible();
  });

  test('TC-KB-06: 检索知识库 — 关键字搜索返回结果', async ({ page }) => {
    await kbPage.openSearchDialog();
    await kbPage.keywordInput.fill('RAG');
    await kbPage.button(s.buttonNames.search).click();
    await page.waitForTimeout(2000);

    // 应显示 Score 评分
    await expect(page.getByText(s.scoreRegex).first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-KB-07: 检索知识库 — 重置搜索表单', async () => {
    await kbPage.openSearchDialog();
    await kbPage.keywordInput.fill('RAG');
    await kbPage.button(s.buttonNames.reset).click();
    // 关键字应被清空
    await expect(kbPage.keywordInput).toHaveValue('');
  });

  test('TC-KB-08: 检索知识库 — close 关闭弹窗', async () => {
    await kbPage.openSearchDialog();
    await expect(kbPage.dialog).toBeVisible();

    await kbPage.closeSearchDialog();
    await expect(kbPage.dialog).not.toBeVisible();
  });

  test('TC-KB-09: 文件预览 — 打开预览面板', async ({ page }) => {
    await kbPage.button(s.buttonNames.preview).first().click();
    await page.waitForTimeout(1500);

    // 应出现 PDF 预览区域
    const previewPanel = page.locator(`text=${s.previewPageText}`).first();
    await expect(previewPanel).toBeVisible({ timeout: 5000 });
  });

  test('TC-KB-10: 文件预览 — 关闭预览', async ({ page }) => {
    await kbPage.button(s.buttonNames.preview).first().click();
    await page.waitForTimeout(1000);

    await kbPage.button(s.buttonNames.close).click();
    // 应回到只有主内容的视图
    await expect(kbPage.fileRow.first()).toBeVisible();
  });

  test('TC-KB-11: 列设置按钮存在', async () => {
    await expect(kbPage.button(s.buttonNames.columnSettings)).toBeVisible();
  });

  test('TC-KB-12: MD5 值可复制', async ({ page }) => {
    // 在表格内定位 MD5 文本
    const md5Cell = kbPage.table.getByText(s.md5Prefix).first();
    await expect(md5Cell).toBeVisible();
    await md5Cell.click();
    // 应有复制成功反馈（naive-ui toast/message，也可能用 text 显示）
    const copied = page.getByText(s.copiedRegex).first();
    await expect(copied).toBeVisible({ timeout: 5000 });
  });
});
