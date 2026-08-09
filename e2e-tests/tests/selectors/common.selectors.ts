/**
 * 跨模块通用选择器：loading、弹窗、表格等全局 UI 约定。
 * DOM 结构变更时只需改这里，Page Object 与用例零改动。
 */
export const commonSelectors = {
  spinner: '.n-spin-container',
  dialog: '[role="dialog"]',
  closeIconButton: 'close',
  mainRegion: 'main',
  mainTable: 'main table',
} as const;
