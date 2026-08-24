import { test, expect } from '../../fixtures/fixtures';
import { chatSelectors as s } from '../../selectors/chat.selectors';

test.describe('聊天助手模块', () => {
  test.beforeEach(async ({ chatPage }) => {
    // storageState 已登录，进入默认页 /chat
    await chatPage.gotoChat();
  });

  test('TC-CHAT-01: 聊天页面正确加载', async ({ chatPage }) => {
    await expect(chatPage.heading).toBeVisible();
    // 侧边栏菜单
    await expect(chatPage.menuItem('聊天助手')).toBeVisible();
    // 连接状态
    await expect(chatPage.connectionStatus).toBeVisible();
  });

  test('TC-CHAT-02: 侧边栏全部菜单项存在', async ({ chatPage }) => {
    for (const menu of s.menus) {
      await expect(chatPage.menuItem(menu)).toBeVisible();
    }
  });

  test('TC-CHAT-03: WebSocket 连接状态显示', async ({ chatPage }) => {
    await expect(chatPage.connectedStatus).toBeVisible({ timeout: 8000 });
  });

  test('TC-CHAT-04: 消息输入框存在', async ({ chatPage }) => {
    await expect(chatPage.messageInput).toBeVisible();
    await expect(chatPage.messageInput).toBeEnabled();
  });

  test('TC-CHAT-05: 发送空消息 — 按钮 disabled', async ({ chatPage }) => {
    await chatPage.messageInput.fill('');
    // 空输入时发送按钮应处于 disabled 状态（naive-ui 的 sendDisabled 计算属性）
    await expect(chatPage.sendButton).toBeDisabled();
  });

  test('TC-CHAT-06: 对话区域正确渲染', async ({ chatPage }) => {
    // 对话主区域（含消息列表与输入框）应当可见
    await expect(chatPage.mainRegion).toBeVisible();
  });

  test('TC-CHAT-07: 导航到聊天记录页面', async ({ page, chatPage }) => {
    await chatPage.navigateTo('聊天记录');
    await expect(page).toHaveURL(s.urlChatHistoryRegex);
  });

  test('TC-CHAT-08: 日期筛选控件存在', async ({ chatPage }) => {
    // 在 banner 区域检查日期选择器
    await expect(chatPage.dateFilter).toBeVisible({ timeout: 3000 });
  });

  test('TC-CHAT-09: 从其他页面切换回聊天助手', async ({ page, chatPage }) => {
    // 先导航到知识库
    await chatPage.navigateTo('知识库');
    await expect(page).toHaveURL(s.urlKnowledgeBaseRegex);

    // 切回聊天
    await chatPage.navigateTo('聊天助手');
    await expect(page).toHaveURL(s.urlChatRegex);
    await expect(chatPage.connectionStatus).toBeVisible();
  });
});
