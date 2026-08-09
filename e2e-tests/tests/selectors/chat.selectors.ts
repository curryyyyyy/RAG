/**
 * 聊天助手模块选择器。
 */
export const chatSelectors = {
  // 页面结构
  pageHeading: 'RAG知识检索',
  connectionStatusLabel: '连接状态：',
  connectedRegex: /已连接|连接成功|Connected/i,
  messageInputPlaceholderRegex: /发送消息|给.*发送消息/i,
  historySenderRegex: /admin|派聪明/,
  dateFilterClassRegex: '[class*="date"]',
  // 侧边栏菜单
  menus: [
    '用户管理', '聊天助手', '聊天记录', '知识库',
    '组织标签', '模型配置', '邀请码管理', '用量监控',
    '个人中心', '余额充值', '充值管理',
  ] as const,
  // URL
  urlChatRegex: /\/chat/,
  urlChatHistoryRegex: /\/chat-history/,
  urlKnowledgeBaseRegex: /\/knowledge-base/,
} as const;
