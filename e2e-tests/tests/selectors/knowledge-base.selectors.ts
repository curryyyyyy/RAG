/**
 * 知识库模块选择器。
 */
export const knowledgeBaseSelectors = {
  // 页面结构
  pageHeading: '文件列表',
  tableHeaders: ['文件名', 'MD5', '文件大小', '上传状态', '组织标签', '上传时间'],
  knownFile: 'paismart.pdf',
  // 检索弹窗
  searchDialogTitle: '知识库检索',
  keywordPlaceholder: '请输入关键字',
  topKPlaceholder: '请输入topK',
  scoreRegex: /Score:/,
  // 文案反馈
  copiedRegex: /复制成功|已复制|Copied/i,
  previewPageText: '第',
  // 按钮
  buttonNames: {
    add: '新增',
    refresh: '刷新',
    searchKnowledge: '检索知识库',
    search: '搜索',
    reset: '重置',
    preview: '预览',
    close: '关闭',
    columnSettings: '列设置',
  } as const,
} as const;
