import { test, expect } from '@playwright/test';
import { UserManagementPage } from '../../pages/UserManagementPage';
import { userSelectors as s } from '../../selectors/user.selectors';
import { TEST_USER } from '../../fixtures/credentials';

test.describe('用户管理模块', () => {
  let userPage: UserManagementPage;

  test.beforeEach(async ({ page }) => {
    // storageState 已登录
    userPage = new UserManagementPage(page);
    await userPage.goto('/');
    await userPage.waitForStable();
    await userPage.navigateTo('用户管理');
    await expect(page).toHaveURL(/\/user/);
    await userPage.waitForStable();
  });

  test('TC-USER-01: 用户列表正确加载', async () => {
    await expect(userPage.heading).toBeVisible();

    const table = userPage.table;
    for (const header of s.tableHeaders) {
      await expect(table.getByText(header)).toBeVisible();
    }
    for (const header of s.exactTableHeaders) {
      await expect(table.getByText(header, { exact: true })).toBeVisible();
    }
  });

  test('TC-USER-02: 用户列表包含数据行', async () => {
    // 等待表格数据行渲染完成（至少 1 行）
    await expect(userPage.rows).not.toHaveCount(0);
    // 测试用户在数据行中可见
    await expect(userPage.rows.getByText(TEST_USER).first()).toBeVisible();
  });

  test('TC-USER-03: 关键词搜索功能', async () => {
    await expect(userPage.searchInput).toBeVisible();
    await userPage.searchInput.fill(TEST_USER);
    // 搜索后表格应仍然可见
    await expect(userPage.table).toBeVisible();
  });

  test('TC-USER-04: 组织标签筛选控件存在', async () => {
    await expect(userPage.orgTagFilter).toBeVisible();
  });

  test('TC-USER-05: 启用状态筛选控件存在', async () => {
    await expect(userPage.statusFilter).toBeVisible();
  });

  test('TC-USER-06: LLM 和 Embedding 额度展示', async () => {
    // admin 用户的额度信息
    await expect(userPage.todayMessages).toBeVisible({ timeout: 3000 });
    // 额度格式: 数字 / 数字
    await expect(userPage.quota).toBeVisible();
  });

  test('TC-USER-07: 分配组织标签按钮存在', async () => {
    await expect(userPage.button(s.buttonNames.assignOrgTag).first()).toBeVisible();
  });

  test('TC-USER-08: 刷新按钮功能', async ({ page }) => {
    const refreshBtn = userPage.button(s.buttonNames.refresh);
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();
    await page.waitForLoadState('networkidle');
    await expect(userPage.heading).toBeVisible();
  });

  test('TC-USER-09: 分页控件存在', async () => {
    await expect(userPage.pagination.first()).toBeAttached({ timeout: 3000 });
  });
});
