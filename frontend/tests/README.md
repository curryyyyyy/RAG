# PaiSmart E2E 测试

基于 Playwright 的端到端自动化测试，覆盖系统核心业务模块的全流程操作。

## 技术栈

| 组件 | 版本 | 用途 |
|------|------|------|
| @playwright/test | ^1.59 | 测试框架 |
| Chromium | - | 浏览器引擎 |
| pnpm | >=8.7 | 包管理 |

## 目录结构

```
tests/
├── playwright.config.ts          # Playwright 配置
├── fixtures/
│   └── test-helpers.ts           # 公共辅助函数
├── auth/
│   └── login.spec.ts             # 登录模块 (9 条用例)
├── knowledge-base/
│   └── knowledge-base.spec.ts    # 知识库模块 (12 条用例)
├── chat/
│   └── chat.spec.ts              # 聊天助手模块 (9 条用例)
└── README.md                     # 本文件
```

## 运行测试

```bash
cd frontend

# 运行全部用例 (headless)
pnpm test

# UI 交互模式 (推荐调试用)
pnpm test:ui

# 有头浏览器运行
pnpm test:headed

# 查看 HTML 报告
pnpm test:report
```

## 用例覆盖

### 登录模块 (`auth/login.spec.ts`)

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

### 知识库模块 (`knowledge-base/knowledge-base.spec.ts`)

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

### 聊天助手模块 (`chat/chat.spec.ts`)

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

**合计 30 条用例**，覆盖 Happy Path、Error Path、Validation、Render、Navigation、Data、State 等维度。

## 添加新用例

1. 在对应模块目录下创建或追加 `.spec.ts` 文件
2. 使用 `test.describe` 分组，用 `test.beforeEach` 完成登录后的初始状态
3. 从 `fixtures/test-helpers.ts` 引入 `loginViaUI`、`navigateTo` 等公共函数
4. 用例命名格式：`TC-{MODULE}-{序号}: {中文描述}`

```typescript
import { test, expect } from '@playwright/test';
import { loginViaUI, navigateTo } from '../fixtures/test-helpers';

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

## 配置说明

`playwright.config.ts` 关键配置：

- **baseURL**: `http://localhost:9527`
- **webServer**: 自动启动 `pnpm dev`，复用已运行的服务
- **timeout**: 30s (单个用例)
- **expect timeout**: 10s (单个断言)
- **screenshot**: 失败时自动截图
- **video**: 失败时保留视频回放
- **trace**: 首次重试时记录

## CI 集成

```yaml
# .github/workflows/test.yml
- name: Run E2E tests
  run: |
    cd frontend
    pnpm install
    pnpm exec playwright install chromium
    pnpm test
  env:
    CI: true
```
