/**
 * 组织标签模块选择器。
 */
export const orgTagSelectors = {
  // 页面结构
  pageHeading: '组织标签',
  tableHeaders: ['标签名称', '描述', '操作'],
  exactTableHeaders: ['非Admin上传上限'],
  defaultTags: ['默认组织', '管理员组织'],
  // 弹窗 / 分页
  popconfirmSelector: '.n-popconfirm, .n-modal, [role="dialog"]',
  paginationSelector: '.n-pagination, [class*="pagination"], [class*="data-table__pagination"]',
  // 按钮
  buttonNames: {
    add: '新增',
    edit: '编辑',
    addChild: '新增下级',
    delete: '删除',
    refresh: '刷新',
    columnSettings: '列设置',
    cancel: /取\s*消/i,
  } as const,
} as const;
