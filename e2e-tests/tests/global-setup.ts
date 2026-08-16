import { ApiClient } from './api/ApiClient';
import { OrgTagApi } from './api/org-tags';
import { FileApi } from './api/files';
import { TEST_USER, TEST_PASS } from './fixtures/credentials';

/**
 * 全量测试启动前的数据卫生：清扫上一次中断运行残留的 e2e-* 数据，
 * 保证测试可反复重跑、全局列表断言不被历史数据污染。
 *
 * 只清理 e2e- 前缀的资源，绝不触碰真实数据；全程 best-effort，
 * 后端不可用时跳过（打警告），任何失败都不阻断测试运行。
 */
export default async function globalSetup() {
  const client = new ApiClient();
  try {
    await client.login(TEST_USER, TEST_PASS);
  } catch (e) {
    console.warn(`[globalSetup] 无法登录后端，跳过残留数据清理：${(e as Error).message}`);
    return;
  }

  await cleanupOrgTags(new OrgTagApi(client));
  await cleanupFiles(new FileApi(client));
}

async function cleanupOrgTags(orgTags: OrgTagApi) {
  try {
    const tags = await orgTags.list();
    const stale = tags.filter((t) => t.tagId.startsWith('e2e-tag-'));
    for (const t of stale) {
      await orgTags.delete(t.tagId).catch(() => {});
    }
    if (stale.length) {
      console.log(`[globalSetup] 已清理残留组织标签 ${stale.length} 个`);
    }
  } catch (e) {
    console.warn(`[globalSetup] 清理组织标签失败：${(e as Error).message}`);
  }
}

async function cleanupFiles(files: FileApi) {
  try {
    const docs = await files.uploads();
    const stale = docs.filter((d) => d.fileName.startsWith('e2e-seed-') || d.fileName.startsWith('e2e-pdf-'));
    for (const d of stale) {
      await files.delete(d.fileMd5).catch(() => {});
    }
    if (stale.length) {
      console.log(`[globalSetup] 已清理残留文件 ${stale.length} 个`);
    }
  } catch (e) {
    console.warn(`[globalSetup] 清理文件失败：${(e as Error).message}`);
  }
}
