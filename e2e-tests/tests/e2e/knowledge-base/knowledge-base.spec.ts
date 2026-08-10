import { test as base, expect } from '../../fixtures/fixtures';
import { knowledgeBaseSelectors as s } from '../../selectors/knowledge-base.selectors';

interface SeededFile {
  fileName: string;
  fileMd5: string;
}

/**
 * 测试级种子文件：用 fileApi 上传唯一 .txt → use → teardown 删除。
 * 消除对预置 paismart.pdf 的依赖（TC-KB-02 / TC-KB-12 自给自足）。
 */
const test = base.extend<{ seededFile: SeededFile }>({
  seededFile: async ({ fileApi }, use) => {
    const fileName = `e2e-seed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.txt`;
    const buffer = Buffer.from(`PaiSmart E2E 种子内容 ${Date.now()}`, 'utf8');
    const { fileMd5 } = await fileApi.upload(fileName, buffer);
    await use({ fileName, fileMd5 });
    await fileApi.delete(fileMd5).catch(() => {});
  },
});

test.describe('知识库模块', () => {
  test.beforeEach(async ({ kbPage }) => {
    // storageState 已登录
    await kbPage.goto('/');
    await kbPage.waitForStable();
    await kbPage.navigateTo('知识库');
  });

  test('TC-KB-01: 文件列表正确加载', async ({ kbPage }) => {
    await expect(kbPage.heading).toBeVisible();

    // 表格列头 — 限定在 main 区域或 table 内
    for (const header of s.tableHeaders) {
      await expect(kbPage.table.getByText(header)).toBeVisible();
    }
  });

  test('TC-KB-02: 文件列表包含数据行', async ({ kbPage, seededFile }) => {
    // 使用 API 种子的唯一文件，不依赖预置 paismart.pdf
    await expect(kbPage.fileRow(seededFile.fileName)).toBeVisible({ timeout: 5000 });
  });

  test('TC-KB-03: 新增按钮存在', async ({ kbPage }) => {
    await expect(kbPage.button(s.buttonNames.add)).toBeVisible();
  });

  test('TC-KB-04: 刷新按钮功能', async ({ kbPage }) => {
    await expect(kbPage.button(s.buttonNames.refresh)).toBeVisible();
    await kbPage.refresh();
    // 刷新后文件列表仍然可见
    await expect(kbPage.heading).toBeVisible();
  });

  test('TC-KB-05: 检索知识库 — 弹窗打开', async ({ kbPage }) => {
    await kbPage.openSearchDialog();
    await expect(kbPage.dialog).toBeVisible({ timeout: 3000 });
    await expect(kbPage.dialog.getByText(s.searchDialogTitle)).toBeVisible();
    await expect(kbPage.keywordInput).toBeVisible();
    await expect(kbPage.topKInput).toBeVisible();
  });

  test('TC-KB-06: 检索知识库 — 关键字搜索返回结果', async ({ page, kbPage }) => {
    await kbPage.openSearchDialog();
    await kbPage.keywordInput.fill('RAG');
    await kbPage.button(s.buttonNames.search).click();
    await page.waitForTimeout(2000);

    // 应显示 Score 评分
    await expect(page.getByText(s.scoreRegex).first()).toBeVisible({ timeout: 8000 });
  });

  test('TC-KB-07: 检索知识库 — 重置搜索表单', async ({ kbPage }) => {
    await kbPage.openSearchDialog();
    await kbPage.keywordInput.fill('RAG');
    await kbPage.button(s.buttonNames.reset).click();
    // 关键字应被清空
    await expect(kbPage.keywordInput).toHaveValue('');
  });

  test('TC-KB-08: 检索知识库 — close 关闭弹窗', async ({ kbPage }) => {
    await kbPage.openSearchDialog();
    await expect(kbPage.dialog).toBeVisible();

    await kbPage.closeSearchDialog();
    await expect(kbPage.dialog).not.toBeVisible();
  });

  test('TC-KB-09: 文件预览 — 打开预览面板', async ({ page, kbPage }) => {
    // 预览需 PDF（“第 N 页”指示器），仍依赖预置 paismart.pdf（已知限制，同 TC-KB-06）
    await kbPage.filePreviewButton(s.knownFile).click();
    await page.waitForTimeout(1500);

    // 应出现 PDF 预览区域
    const previewPanel = page.locator(`text=${s.previewPageText}`).first();
    await expect(previewPanel).toBeVisible({ timeout: 5000 });
  });

  test('TC-KB-10: 文件预览 — 关闭预览', async ({ page, kbPage }) => {
    await kbPage.filePreviewButton(s.knownFile).click();
    await page.waitForTimeout(1000);

    await kbPage.button(s.buttonNames.close).click();
    // 应回到只有主内容的视图
    await expect(kbPage.fileRow(s.knownFile)).toBeVisible();
  });

  test('TC-KB-11: 列设置按钮存在', async ({ kbPage }) => {
    await expect(kbPage.button(s.buttonNames.columnSettings)).toBeVisible();
  });

  test('TC-KB-12: MD5 值可复制', async ({ page, kbPage, seededFile }) => {
    // 用种子文件的本地 MD5 前 8 位断言，不依赖硬编码 3b97a00d
    const md5Cell = kbPage.table.getByText(seededFile.fileMd5.slice(0, 8)).first();
    await expect(md5Cell).toBeVisible();
    await md5Cell.click();
    // 应有复制成功反馈（naive-ui toast/message，也可能用 text 显示）
    const copied = page.getByText(s.copiedRegex).first();
    await expect(copied).toBeVisible({ timeout: 5000 });
  });
});
