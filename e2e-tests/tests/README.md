# PaiSmart E2E 自动化测试

基于 Playwright 的端到端浏览器自动化测试，独立于 `frontend` 应用目录存放，覆盖登录、知识库、聊天助手、用户管理、组织标签等核心流程。

## 技术栈

| 组件 | 版本 | 用途 |
|------|------|------|
| @playwright/test | ^1.59 | E2E 浏览器自动化 |
| Chromium | - | E2E 浏览器引擎 |
| pnpm | >=8.7 | 包管理 |

## 目录结构

```
PaiSmart/
├── frontend/                               # Vue 应用（含 Vitest 单元测试）
└── e2e-tests/                              # 本目录 — Playwright E2E 测试
    ├── package.json                        # 独立依赖与脚本
    ├── playwright.config.ts                # Playwright E2E 配置
    ├── tests/
    │   ├── README.md                       # 本文件
    │   ├── selectors/                      # 选择器集中层（DOM 结构变更只改这里）
    │   │   ├── common.selectors.ts         # 通用选择器（loading/弹窗/表格）
    │   │   ├── login.selectors.ts          # 登录模块选择器
    │   │   ├── chat.selectors.ts           # 聊天助手选择器
    │   │   ├── knowledge-base.selectors.ts # 知识库选择器
    │   │   ├── org-tag.selectors.ts        # 组织标签选择器
    │   │   └── user.selectors.ts           # 用户管理选择器
    │   ├── pages/                          # POM 页面对象层
    │   │   ├── BasePage.ts                 # 基类：公共导航/等待/弹窗操作
    │   │   ├── LoginPage.ts
    │   │   ├── ChatPage.ts
    │   │   ├── KnowledgeBasePage.ts
    │   │   ├── OrgTagPage.ts
    │   │   └── UserManagementPage.ts
    │   ├── fixtures/
    │   │   └── credentials.ts              # 测试凭据（TEST_USER/TEST_PASS）
    │   └── e2e/                            # E2E 用例（只使用 Page Object）
    │       ├── auth/
    │       │   ├── auth.setup.ts           # setup project：UI 登录一次并保存登录态
    │       │   └── login.spec.ts           # 登录模块 9 条
    │       ├── knowledge-base/
    │       │   └── knowledge-base.spec.ts  # 知识库模块 12 条
    │       ├── chat/
    │       │   └── chat.spec.ts            # 聊天助手模块 9 条
    │       ├── user/
    │       │   └── user-management.spec.ts # 用户管理 9 条
    │       └── org-tag/
    │           └── org-tag.spec.ts         # 组织标签 9 条
    ├── playwright-report/                  # E2E HTML 报告（生成）
    └── test-results/                       # E2E 测试产物（生成）
```

## 运行测试

```bash
cd e2e-tests

# 运行全部 E2E 用例 (headless)
pnpm test

# UI 交互模式 (推荐调试用)
pnpm test:ui

# 有头浏览器运行
pnpm test:headed

# 查看 HTML 报告
pnpm test:report
```

在 `frontend` 目录下同样可以通过 `pnpm test` / `pnpm test:ui` / `pnpm test:headed` / `pnpm test:report` 委托运行上述命令。

## 认证机制

采用 Playwright `setup project + storageState` 方案，登录只发生一次：

- **`tests/e2e/auth/auth.setup.ts`** — `setup` 项目，运行所有用例前通过 `LoginPage.loginViaUI()` 登录一次，把登录态（localStorage token）保存到 `auth/user.json`
- **`chromium` 项目** 默认加载 `auth/user.json`，其余模块用例直接以已登录状态启动，无需再走 UI 登录
- **`login.spec.ts`** 通过 `test.use({ storageState: { cookies: [], origins: [] } })` 覆盖为空，保证登录/重定向用例从未登录状态开始
- `auth/` 目录由运行时生成，已在 `.gitignore` 中忽略，不提交 token 到仓库

> 认证凭据（`TEST_USER`/`TEST_PASS`）定义在 `tests/fixtures/credentials.ts`，从环境变量读取，默认值仅用于本地开发，CI 通过 secrets 注入。

## 分层设计（POM + 选择器集中）

为控制可维护性，用例按三层组织，职责严格分离：

| 层 | 位置 | 职责 |
|----|------|------|
| **选择器层** | `tests/selectors/` | 只存放 DOM 文本/placeholder/role/URL。**前端 DOM 变化时只改这里** |
| **页面对象层** | `tests/pages/` | 封装各模块的 locator 与行为（打开弹窗、登录、导航等）。不写断言 |
| **用例层** | `tests/e2e/` | 只组合 Page Object + 断言，不再出现裸选择器字符串 |

约定：

- **选择器必须入库**：任何新用例里出现的定位文本/正则，先加到对应 `selectors/*.ts`
- **断言留在 spec**：Page Object 只暴露 locator 与动作，`expect` 断言写在 spec 中
- **公共操作进基类**：`goto` / `waitForStable` / `navigateTo` / `closeDialog` / `button` / `menuItem` 在 `BasePage`，子类继承
- **凭据不硬编码**：测试用户名/密码统一从 `fixtures/credentials.ts` 读取

## E2E 用例覆盖

### 登录模块 (`e2e/auth/login.spec.ts`)

| 编号 | 用例 | 类型 |
|------|------|------|
| TC-LOGIN-01 | 正常登录 — 成功跳转到聊天页面 | Happy Path |
| TC-LOGIN-02 | 密码错误 — 拒绝登录 | Error Path |
| TC-LOGIN-03 | 空用户名 — 前端校验 | Validation |
| TC-LOGIN-04 | 空密码 — 前端校验 | Validation |
| TC-LOGIN-05 | 都不填写直接提交 | Validation |
| TC-LOGIN-06 | 记住用户名密码 — 复选框存在且可点击 | Feature |
| TC-LOGIN-07 | Token 持久化 — localStorage 写入 | State |
| TC-LOGIN-08 | 退出登录 — 清除状态并跳回登录页 | Lifecycle |
| TC-LOGIN-09 | 未登录直接访问内部页面 — 重定向到登录 | Guard |

### 知识库模块 (`e2e/knowledge-base/knowledge-base.spec.ts`)

| 编号 | 用例 | 类型 |
|------|------|------|
| TC-KB-01 | 文件列表正确加载 | Render |
| TC-KB-02 | 文件列表包含数据行 | Data |
| TC-KB-03 | 新增按钮存在 | Render |
| TC-KB-04 | 刷新按钮功能 | Feature |
| TC-KB-05 | 检索知识库 — 弹窗打开 | Dialog |
| TC-KB-06 | 检索知识库 — 关键字搜索返回结果 | Search |
| TC-KB-07 | 检索知识库 — 重置搜索表单 | Reset |
| TC-KB-08 | 检索知识库 — close 关闭弹窗 | Dialog |
| TC-KB-09 | 文件预览 — 打开预览面板 | Preview |
| TC-KB-10 | 文件预览 — 关闭预览 | Preview |
| TC-KB-11 | 列设置按钮存在 | Render |
| TC-KB-12 | MD5 值可复制 | Feature |

### 聊天助手模块 (`e2e/chat/chat.spec.ts`)

| 编号 | 用例 | 类型 |
|------|------|------|
| TC-CHAT-01 | 聊天页面正确加载 | Render |
| TC-CHAT-02 | 侧边栏全部菜单项存在 | Render |
| TC-CHAT-03 | WebSocket 连接状态显示 | Network |
| TC-CHAT-04 | 消息输入框存在 | Render |
| TC-CHAT-05 | 发送空消息 — 按钮 disabled | Validation |
| TC-CHAT-06 | 对话历史可见 | Data |
| TC-CHAT-07 | 导航到聊天记录页面 | Navigation |
| TC-CHAT-08 | 日期筛选控件存在 | Render |
| TC-CHAT-09 | 从其他页面切换回聊天助手 | Navigation |

### 用户管理模块 (`e2e/user/user-management.spec.ts`)

| 编号 | 用例 | 类型 |
|------|------|------|
| TC-USER-01 | 用户列表正确加载 | Render |
| TC-USER-02 | 用户列表包含数据行 | Data |
| TC-USER-03 | 关键词搜索功能 | Search |
| TC-USER-04 | 组织标签筛选控件存在 | Render |
| TC-USER-05 | 启用状态筛选控件存在 | Render |
| TC-USER-06 | LLM 和 Embedding 额度展示 | Data |
| TC-USER-07 | 分配组织标签按钮存在 | Feature |
| TC-USER-08 | 刷新按钮功能 | Feature |
| TC-USER-09 | 分页控件存在 | Render |

### 组织标签模块 (`e2e/org-tag/org-tag.spec.ts`)

| 编号 | 用例 | 类型 |
|------|------|------|
| TC-ORG-01 | 标签列表正确加载 | Render |
| TC-ORG-02 | 标签列表包含数据 | Data |
| TC-ORG-03 | 新增标签 — 弹窗打开 | Dialog |
| TC-ORG-04 | 编辑标签 — 弹窗打开 | Dialog |
| TC-ORG-05 | 新增下级标签 — 弹窗打开 | Dialog |
| TC-ORG-06 | 删除标签 — 确认弹窗 | Dialog |
| TC-ORG-07 | 刷新按钮功能 | Feature |
| TC-ORG-08 | 列设置按钮存在 | Render |
| TC-ORG-09 | 分页控件存在 | Render |

**合计 48 条 E2E 用例**，覆盖 Happy Path、Error Path、Validation、Render、Navigation、Data、State、Network、Dialog 等维度。

## 添加新用例

先在 `selectors/` 注册定位文本，再到 `pages/` 添加页面对象，最后在 `tests/e2e/` 编写用例：

```typescript
// 1. selectors/foo.selectors.ts — 集中新增选择器
export const fooSelectors = {
  pageHeading: '某列表',
  buttonNames: { add: '新增' } as const,
} as const;

// 2. pages/FooPage.ts — 封装 locator 与行为
import { BasePage } from './BasePage';
import { fooSelectors as s } from '../selectors/foo.selectors';

export class FooPage extends BasePage {
  readonly heading = this.page.getByRole('heading', { name: s.pageHeading });
  async openAddDialog() {
    await this.button(s.buttonNames.add).click();
  }
}

// 3. e2e/foo/foo.spec.ts — 只组合 Page Object + 断言
import { test, expect } from '@playwright/test';
import { FooPage } from '../../pages/FooPage';

test.describe('新模块', () => {
  let fooPage: FooPage;

  test.beforeEach(async ({ page }) => {
    fooPage = new FooPage(page);
    await fooPage.goto('/');
    await fooPage.waitForStable();
    await fooPage.navigateTo('目标菜单');
  });

  test('TC-XX-01: 简要描述', async () => {
    // arrange — 准备数据
    // act — 执行操作
    await fooPage.openAddDialog();
    // assert — 验证结果
    await expect(fooPage.heading).toBeVisible();
  });
});
```

## Playwright 配置说明

`playwright.config.ts` 关键配置：

- **baseURL**: `http://localhost:9527`
- **webServer**: 自动在 `../frontend` 目录启动 `pnpm dev`，复用已运行的服务
- **timeout**: 45s (单个用例)
- **expect timeout**: 10s (单个断言)
- **screenshot**: 失败时自动截图
- **video**: 失败时保留视频回放
- **trace**: 首次重试时记录
