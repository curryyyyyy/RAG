/**
 * 测试凭据：从环境变量读取，默认值仅用于本地开发，CI 通过 secrets 注入。
 */
export const TEST_USER = process.env.TEST_USER || 'admin';
export const TEST_PASS = process.env.TEST_PASS || 'chengxi123456';
