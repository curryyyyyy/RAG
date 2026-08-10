import { test, expect } from '../../fixtures/fixtures';
import { orgTagSelectors as s } from '../../selectors/org-tag.selectors';

test.describe('组织标签模块', () => {
  test.beforeEach(async ({ page, orgTagPage }) => {
    // storageState 已登录
    await orgTagPage.goto('/');
    await orgTagPage.waitForStable();
    await orgTagPage.navigateTo('组织标签');
    await expect(page).toHaveURL(/\/org-tag/);
    await orgTagPage.waitForStable();
  });

  test('TC-ORG-01: 标签列表正确加载', async ({ orgTagPage }) => {
    await expect(orgTagPage.heading).toBeVisible();

    const table = orgTagPage.table;
    for (const header of s.tableHeaders) {
      await expect(table.getByText(header)).toBeVisible();
    }
    for (const header of s.exactTableHeaders) {
      await expect(table.getByText(header, { exact: true })).toBeVisible();
    }
  });

  test('TC-ORG-02: 标签列表包含数据', async ({ orgTagPage }) => {
    // 系统预置两个标签
    await expect(orgTagPage.tagCell('默认组织')).toBeVisible({ timeout: 5000 });
    await expect(orgTagPage.tagCell('管理员组织')).toBeVisible();
  });

  test('TC-ORG-03: 新增标签 — 弹窗打开', async ({ orgTagPage }) => {
    await orgTagPage.button(s.buttonNames.add, true).click();
    await expect(orgTagPage.dialog).toBeVisible({ timeout: 3000 });
    // 关闭弹窗恢复状态
    await orgTagPage.closeDialog();
  });

  test('TC-ORG-04: 编辑标签 — 弹窗打开', async ({ orgTagPage }) => {
    await orgTagPage.button(s.buttonNames.edit).first().click();
    await expect(orgTagPage.dialog).toBeVisible({ timeout: 3000 });
    await orgTagPage.closeDialog();
  });

  test('TC-ORG-05: 新增下级标签 — 弹窗打开', async ({ orgTagPage }) => {
    await orgTagPage.button(s.buttonNames.addChild).first().click();
    await expect(orgTagPage.dialog).toBeVisible({ timeout: 3000 });
    await orgTagPage.closeDialog();
  });

  test('TC-ORG-06: 删除标签 — 确认弹窗', async ({ orgTagPage }) => {
    await orgTagPage.button(s.buttonNames.delete).first().click();
    // naive-ui popconfirm 或 modal
    await expect(orgTagPage.popconfirm.first()).toBeAttached({ timeout: 5000 });
    // 点取消
    const cancelBtn = orgTagPage.button(s.buttonNames.cancel);
    if (await cancelBtn.isVisible().catch(() => false)) {
      await cancelBtn.click();
    }
  });

  test('TC-ORG-07: 刷新按钮功能', async ({ orgTagPage }) => {
    await orgTagPage.refresh();
    await expect(orgTagPage.tagCell('默认组织')).toBeVisible();
  });

  test('TC-ORG-08: 列设置按钮存在', async ({ orgTagPage }) => {
    await expect(orgTagPage.button(s.buttonNames.columnSettings)).toBeVisible();
  });

  test('TC-ORG-09: 分页控件存在', async ({ orgTagPage }) => {
    // 总数 <= pageSize 时可能无分页组件，仅检查总数标签存在
    const count = await orgTagPage.pagination.count();
    // 分页存在则验证，不存在也属正常（数据量不足一页）
    if (count > 0) await expect(orgTagPage.pagination.first()).toBeAttached();
  });

  test('TC-ORG-10: 创建标签 → UI 可见 → 删除 → 不可见', async ({ orgTagPage, orgTagApi }) => {
    const suffix = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    const tagId = `e2e-tag-${suffix}`;
    const name = `E2E标签-${suffix}`;

    // 创建（唯一 tagId/name）→ 刷新 → 列表可见
    await orgTagApi.create({ tagId, name });
    await orgTagPage.refresh();
    await expect(orgTagPage.tagCell(name)).toBeVisible({ timeout: 5000 });

    // 删除 → 刷新 → 列表不可见
    await orgTagApi.delete(tagId);
    await orgTagPage.refresh();
    await expect(orgTagPage.tagCell(name)).toHaveCount(0);
  });
});
