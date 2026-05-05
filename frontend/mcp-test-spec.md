# Chrome DevTools MCP 自动化测试规范

## 使用方法

在 Claude Code 中，用自然语言描述测试意图，Claude 会自动调用 chrome-devtools MCP 工具执行。

格式：`测试 <页面> 的 <功能>，并截图保存`

## MCP 核心命令速查

| 命令 | 用途 |
|------|------|
| `new_page(url)` | 打开新页面 |
| `navigate_page(url)` | 导航到 URL |
| `take_snapshot(verbose)` | 获取页面 a11y 树（类似 DOM） |
| `take_screenshot(filePath)` | 截图保存 |
| `click(uid)` | 点击元素 |
| `fill(uid, value)` | 填写输入框 |
| `fill_form(elements)` | 批量填写表单 |
| `type_text(text)` | 键盘输入 |
| `press_key(key)` | 按键（支持 Ctrl+S 等组合） |
| `hover(uid)` | 悬浮元素 |
| `evaluate_script(function)` | 执行 JS 并返回结果 |
| `emulate(viewport)` | 模拟设备/网络/色域 |
| `list_console_messages` | 检查控制台日志 |
| `list_network_requests` | 检查网络请求 |
| `performance_start_trace` | 开始性能追踪 |
| `performance_stop_trace` | 停止并分析性能 |
| `resize_page(w, h)` | 调整窗口大小 |

---

## 测试场景 1: 登录页 UI 验证

**Claude Code 提示词**：
```
打开 http://localhost:9527/#/login，获取页面快照和全页截图，保存到 test-screenshots/login.png
然后填写用户名和密码，勾选记住密码，截图保存到 test-screenshots/login-filled.png
```

**预期结果**：
- 页面标题: "登录"
- 存在: 用户名输入框、密码输入框、记住密码复选框、登录按钮、注册按钮
- 无控制台错误

---

## 测试场景 2: 注册页 UI 验证

**Claude Code 提示词**：
```
导航到 http://localhost:9527/#/login/register，获取页面快照和截图
检查是否有邀请码输入框和注册按钮
截图保存到 test-screenshots/register.png
```

**预期结果**：
- 存在邀请码相关说明（公众号二维码）
- 存在: 用户名、密码、确认密码、邀请码输入框
- 存在注册按钮和返回按钮
- 存在用户协议和隐私政策链接

---

## 测试场景 3: 注册表单验证（空值提交）

**Claude Code 提示词**：
```
导航到 http://localhost:9527/#/login/register
不填写任何字段，直接点击注册按钮
检查是否有表单验证提示
截图保存到 test-screenshots/register-validation.png
同时检查控制台是否有错误日志
```

---

## 测试场景 4: 移动端响应式

**Claude Code 提示词**：
```
导航到 http://localhost:9527/#/login
模拟 iPhone 14 (375x812, 2x)，截图保存到 test-screenshots/login-mobile.png
再模拟 iPad (768x1024, 2x, touch)，截图保存到 test-screenshots/login-tablet.png
恢复桌面视口
```

---

## 测试场景 5: 错误页面

**Claude Code 提示词**：
```
分别导航到：
- http://localhost:9527/#/404 → 截图 test-screenshots/404.png
- http://localhost:9527/#/403 → 截图 test-screenshots/403.png
- http://localhost:9527/#/500 → 截图 test-screenshots/500.png
检查每个页面是否有返回首页按钮
```

---

## 测试场景 6: 性能分析

**Claude Code 提示词**：
```
导航到 http://localhost:9527/#/login
开启性能追踪，重新加载页面，停止追踪
分析 LCP、CLS、INP 等 Core Web Vitals 指标
```

---

## 测试场景 7: 网络请求检查

**Claude Code 提示词**：
```
打开 http://localhost:9527/#/login
列出所有 XHR/Fetch 网络请求
检查是否有失败的请求（4xx/5xx）
```

---

## 测试场景 8: JS 脚本注入验证

**Claude Code 提示词**：
```
导航到 http://localhost:9527/#/login/register
用 evaluate_script 执行 JS，检查：
1. 所有 input 元素的 required 属性
2. 注册按钮的 disabled 状态
3. localStorage 中是否有残留 token
返回结构化 JSON 结果
```

---

## 测试场景 9: 键盘操作

**Claude Code 提示词**：
```
导航到 http://localhost:9527/#/login
聚焦用户名输入框，用 type_text 输入 "testuser"
按 Tab 切换到密码框，输入 "password123"
按 Enter 提交表单
截图保存提交后的页面状态
```

---

## 批量运行（全量回归）

**Claude Code 提示词**：
```
对以下页面逐一进行 UI 截图 + 控制台错误检查：
1. /login (密码登录)
2. /login/code-login (验证码登录)
3. /login/register (注册)
4. /login/reset-pwd (重置密码)
5. /404
6. /403
7. /500
所有截图保存到 test-screenshots/regression/，命名格式: {页面名}-{日期}.png
最后汇总所有发现的错误
```

---

## 截图保存目录

```
frontend/test-screenshots/
├── login-page.png
├── login-form-filled.png
├── register-page.png
├── register-mobile.png
├── 404-page.png
└── ...
```

---

## 技巧

1. **先 snapshot 后 click/fill** — snapshot 会给出所有元素的 uid，必须用 uid 进行交互
2. **交互后再 snapshot** — 验证操作后的状态变化
3. **截图命名规范** — `{页面}-{状态}-{视口}.png`
4. **每次操作后检查控制台** — `list_console_messages` 带 `types: ["error"]`
5. **性能追踪要 reload** — `performance_start_trace(reload: true)` 才能获取页面加载性能
