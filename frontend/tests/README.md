# PaiSmart 自动化测试

基于 Playwright + Vitest 的前端自动化测试体系，覆盖 E2E 全流程和单元测试。

## 技术栈

| 组件 | 版本 | 用途 |
|------|------|------|
| @playwright/test | ^1.59 | E2E 浏览器自动化 |
| vitest | ^4.1 | 单元测试 / 组件测试 |
| @vitest/coverage-v8 | ^4.1 | 代码覆盖率 |
| jsdom | ^29.1 | 单元测试 DOM 环境 |
| Chromium | - | E2E 浏览器引擎 |
| pnpm | >=8.7 | 包管理 |

## 目录结构

```
frontend/
├── playwright.config.ts                   # Playwright E2E 配置
├── vitest.config.ts                       # Vitest 单元测试配置
├── tests/
│   ├── README.md                          # 本文件
│   ├── fixtures/
│   │   └── test-helpers.ts                # E2E 公共辅助函数
│   ├── e2e/                               # E2E 测试（覆盖全部流程）
│   │   ├── auth/
│   │   │   └── login.spec.ts              # 登录模块 9 条
│   │   ├── knowledge-base/
│   │   │   └── knowledge-base.spec.ts     # 知识库模块 12 条
│   │   ├── chat/
│   │   │   └── chat.spec.ts               # 聊天助手模块 9 条
│   │   ├── user/                          # 用户管理（待编写）
│   │   └── org-tag/                       # 组织标签（待编写）
│   └── unit/                              # 单元测试（待编写）
├── .github/workflows/
│   └── test.yml                           # CI 自动化测试流水线
├── playwright-report/                     # E2E HTML 报告（生成）
├── test-results/                          # E2E 测试产物（生成）
└── coverage/                              # 覆盖率报告（生成）
```

## 运行测试

```bash
cd frontend

# === E2E 测试 ===

# 运行全部 E2E 用例 (headless)
pnpm test

# UI 交互模式 (推荐调试用)
pnpm test:ui

# 有头浏览器运行
pnpm test:headed

# 查看 HTML 报告
pnpm test:report

# === 单元测试 ===

# 运行全部单元测试
pnpm test:unit

# 运行单元测试 + 覆盖率
pnpm test:unit:coverage

# === 全量测试 ===

# E2E + 单元测试
pnpm test:all
```

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

**合计 30 条 E2E 用例**，覆盖 Happy Path、Error Path、Validation、Render、Navigation、Data、State、Network 等维度。

## 添加新用例

### E2E 用例

```typescript
import { test, expect } from '@playwright/test';
import { loginViaUI, navigateTo } from '../../fixtures/test-helpers';

test.describe('新模块', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaUI(page);
    await navigateTo(page, '目标菜单');
  });

  test('TC-XX-01: 简要描述', async ({ page }) => {
    // arrange — 准备数据
    // act — 执行操作
    // assert — 验证结果
  });
});
```

### 单元测试

```typescript
import { describe, it, expect } from 'vitest';

describe('功能模块', () => {
  it('应返回正确结果', () => {
    expect(1 + 1).toBe(2);
  });
});
```

## Playwright 配置说明

`playwright.config.ts` 关键配置：

- **baseURL**: `http://localhost:9527`
- **webServer**: 自动启动 `pnpm dev`，复用已运行的服务
- **timeout**: 30s (单个用例)
- **expect timeout**: 10s (单个断言)
- **screenshot**: 失败时自动截图
- **video**: 失败时保留视频回放
- **trace**: 首次重试时记录

## Vitest 配置说明

`vitest.config.ts` 关键配置：

- **environment**: `jsdom` (模拟浏览器 DOM)
- **include**: `tests/unit/**/*.test.ts`
- **coverage**: v8 provider，输出 text + html
- **alias**: `@` → `./src`
