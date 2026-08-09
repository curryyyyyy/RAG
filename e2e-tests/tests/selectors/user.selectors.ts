/**
 * 用户管理模块选择器。
 */
export const userSelectors = {
  // 页面结构
  pageHeading: '用户列表',
  tableHeaders: ['用户名', '标签', '是否启用', '创建时间', '聊天次数'],
  exactTableHeaders: ['LLM额度', 'Embedding额度'],
  // 筛选与搜索
  searchPlaceholder: '请输入关键词',
  orgTagFilterText: '组织标签',
  statusFilterText: '启用状态',
  // 额度展示
  todayMessagesText: '今日消息数',
  quotaRegex: /\d[\d,]*\s*\/\s*\d[\d,]*/,
  // 分页
  paginationSelector: '.n-pagination, [class*="pagination"]',
  // 按钮
  buttonNames: {
    assignOrgTag: '分配组织标签',
    refresh: '刷新',
  } as const,
} as const;
