import { readFileSync } from 'node:fs';
import { test as base, expect } from '../../fixtures/fixtures';
import { knowledgeBaseSelectors as s } from '../../selectors/knowledge-base.selectors';

interface SeededFile {
  fileName: string;
  fileMd5: string;
}

/**
 * 测试级种子文件：用 factory 上传唯一文件，teardown 由 factory.cleanup() 统一清理。
 * 消除对预置 paismart.pdf 与已向量化文档的依赖（TC-KB-02/06/09/10/12 自给自足）。
 */
const test = base.extend<{
  seededFile: SeededFile;
  seededPdf: SeededFile;
  seededSearchable: SeededFile;
}>({
  // 说明：Playwright 惰性初始化 fixture，测试体里的 seeded* 在上传时 beforeEach 已完成导航、
  // 页面挂载时抓取过一次列表。故种子上传后必须 kbPage.refresh() 重新拉取，否则表格是 stale 的。
  // 清理由 factory.cleanup() 统一完成（含用例失败时）。
  seededFile: async ({ factory, kbPage }, use) => {
    const fileName = factory.uniqueName('e2e-seed') + '.txt';
    const buffer = Buffer.from(`PaiSmart E2E 种子内容 ${Date.now()}`, 'utf8');
    const { fileMd5 } = await factory.uploadFile(fileName, buffer);
    await kbPage.refresh();
    await use({ fileName, fileMd5 });
  },
  // 可预览 PDF 种子：合并即完成即可用（预览走 MinIO），无需等向量化。
  // 静态 sample.pdf 内容相同 → fileMd5 相同，并行时后端按 fileMd5 去重会报「已合并」，
  // 故在 %%EOF 后追加唯一 PDF 注释改变字节（不破坏 xref 偏移）。
  seededPdf: async ({ factory, kbPage }, use) => {
    const fileName = factory.uniqueName('e2e-pdf') + '.pdf';
    const base = readFileSync(new URL('../../fixtures/sample.pdf', import.meta.url));
    const buffer = Buffer.concat([base, Buffer.from(`\n% ${fileName}\n`, 'utf8')]);
    const { fileMd5 } = await factory.uploadFile(fileName, buffer);
    await kbPage.refresh();
    await use({ fileName, fileMd5 });
  },
  // 可搜索种子：需等文档向量化 + ES 索引完成后才可被检索（供 TC-KB-06）
  seededSearchable: async ({ factory, kbPage }, use) => {
    const fileName = factory.uniqueName('e2e-seed-search') + '.txt';
    const buffer = Buffer.from(`PaiSmart RAG 检索种子内容 ${Date.now()}`, 'utf8');
    const { fileMd5 } = await factory.uploadFile(fileName, buffer);
    await factory.waitForDocIndexed(fileMd5);
    await kbPage.refresh();
    await use({ fileName, fileMd5 });
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

  test('TC-KB-06: 检索知识库 — 关键字搜索返回结果', async ({ page, kbPage, seededSearchable }) => {
    // seededSearchable 已向量化 + 入 ES，搜索 RAG 应命中其内容（自动重试断言，无需硬编码等待）
    await kbPage.openSearchDialog();
    await kbPage.keywordInput.fill('RAG');
    await kbPage.button(s.buttonNames.search).click();

    // 应显示 Score 评分（确认含数字非空，排除 "Score: -" 等占位）
    await expect(page.getByText(s.scoreNumericRegex).first()).toBeVisible({ timeout: 8000 });
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

  test('TC-KB-09: 文件预览 — 打开预览面板', async ({ page, kbPage, seededPdf }) => {
    // 用工厂种子 PDF 自给自足
    await kbPage.filePreviewButton(seededPdf.fileName).click();

    // 预览面板标题应展示种子文件名（h2.preview-title），而非仅依赖单字”第”避免误命中
    await expect(page.locator(s.previewTitleClass).filter({ hasText: seededPdf.fileName })).toBeVisible({ timeout: 8000 });
  });

  test('TC-KB-10: 文件预览 — 关闭预览', async ({ kbPage, seededPdf }) => {
    await kbPage.filePreviewButton(seededPdf.fileName).click();

    await kbPage.button(s.buttonNames.close).click();
    // 应回到只有主内容的视图
    await expect(kbPage.fileRow(seededPdf.fileName)).toBeVisible();
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
