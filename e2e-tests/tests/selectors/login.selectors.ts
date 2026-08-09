/**
 * 登录模块选择器。
 */
export const loginSelectors = {
  // URL
  urlLoginRegex: /\/login/,
  urlChat: '**/chat',
  // 表单
  usernamePlaceholder: '请输入用户名',
  passwordPlaceholder: '请输入密码',
  loginButtonName: '登录账号',
  rememberCheckboxName: '记住用户名和密码',
  // 文案与按钮
  loginSuccessText: '登录成功',
  welcomePrefix: '欢迎回来',
  logoutButtonRegex: /退出|注销|登出/i,
  profileMenuItemName: '个人中心',
  // 存储与 API
  tokenStorageKey: 'PaiSmart_token',
  loginApiPath: '/users/login',
} as const;
