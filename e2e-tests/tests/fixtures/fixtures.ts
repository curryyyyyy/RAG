import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ChatPage } from '../pages/ChatPage';
import { KnowledgeBasePage } from '../pages/KnowledgeBasePage';
import { OrgTagPage } from '../pages/OrgTagPage';
import { UserManagementPage } from '../pages/UserManagementPage';
import { ApiClient } from '../api/ApiClient';
import { OrgTagApi } from '../api/org-tags';
import { FileApi } from '../api/files';
import { UserApi } from '../api/users';
import { TEST_USER, TEST_PASS } from './credentials';

type Fixtures = {
  // 页面对象（test-scoped，随每个测试创建）
  loginPage: LoginPage;
  chatPage: ChatPage;
  kbPage: KnowledgeBasePage;
  orgTagPage: OrgTagPage;
  userPage: UserManagementPage;
  // API（worker-scoped，每 worker 登录一次，token 含无感刷新）
  adminApi: ApiClient;
  orgTagApi: OrgTagApi;
  fileApi: FileApi;
  userApi: UserApi;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  chatPage: async ({ page }, use) => {
    await use(new ChatPage(page));
  },
  kbPage: async ({ page }, use) => {
    await use(new KnowledgeBasePage(page));
  },
  orgTagPage: async ({ page }, use) => {
    await use(new OrgTagPage(page));
  },
  userPage: async ({ page }, use) => {
    await use(new UserManagementPage(page));
  },

  // worker-scoped：每 worker 用管理员凭证登录一次
  adminApi: async ({}, use) => {
    const client = new ApiClient();
    await client.login(TEST_USER, TEST_PASS);
    await use(client);
  },
  orgTagApi: async ({ adminApi }, use) => {
    await use(new OrgTagApi(adminApi));
  },
  fileApi: async ({ adminApi }, use) => {
    await use(new FileApi(adminApi));
  },
  userApi: async ({ adminApi }, use) => {
    await use(new UserApi(adminApi));
  },
});

export { expect };
