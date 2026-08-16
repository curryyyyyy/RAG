import { ApiClient } from '../api/ApiClient';
import { OrgTagApi, CreateOrgTagParams } from '../api/org-tags';
import { FileApi, UploadFileParams } from '../api/files';

type CleanupFn = () => Promise<void>;

/**
 * 数据工厂：统一生成唯一测试数据并登记清理。
 * 通过 fixtures 以 test-scoped 注入 —— 每个用例独立一份清理清单，
 * 用例结束（含失败）时由 factory.cleanup() 统一删除，避免数据残留与相互冲突。
 *
 * 用法：
 *   const name = factory.uniqueName('e2e-tag');
 *   await factory.createTag({ tagId: name, name });
 *   // 无需手动删除，fixture teardown 自动清理（删除失败被吞掉，不阻塞用例）
 */
export class DataFactory {
  readonly orgTags: OrgTagApi;
  readonly files: FileApi;

  private cleanups: CleanupFn[] = [];

  constructor(client: ApiClient) {
    this.orgTags = new OrgTagApi(client);
    this.files = new FileApi(client);
  }

  /** 唯一后缀：tagId/name 可复用同一后缀保持一致。 */
  suffix() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  /** 生成带唯一后缀的名称。 */
  uniqueName(prefix: string) {
    return `${prefix}-${this.suffix()}`;
  }

  /** 创建组织标签（唯一 tagId），自动登记删除清理。 */
  async createTag(params: CreateOrgTagParams) {
    const tag = await this.orgTags.create(params);
    this.cleanups.push(async () => {
      await this.orgTags.delete(tag.tagId).catch(() => {});
    });
    return tag;
  }

  /** 上传唯一文件，自动登记删除清理。 */
  async uploadFile(fileName: string, buffer: Buffer, params?: UploadFileParams) {
    const { fileMd5, fileName: name } = await this.files.upload(fileName, buffer, params);
    this.cleanups.push(async () => {
      await this.files.delete(fileMd5).catch(() => {});
    });
    return { fileName: name, fileMd5 };
  }

  /**
   * 轮询 /documents/accessible，直到文档完成异步向量化 + ES 索引（actualChunkCount > 0）。
   * 用于「上传后需可搜索」的用例（如知识库关键字检索）。
   */
  async waitForDocIndexed(fileMd5: string, timeoutMs = 30_000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const doc = (await this.files.uploads()).find((d) => d.fileMd5 === fileMd5);
      if (doc && doc.actualChunkCount != null && doc.actualChunkCount > 0) return;
      await new Promise((r) => setTimeout(r, 1500));
    }
    throw new Error(`等待文档向量化/索引超时: ${fileMd5}`);
  }

  /** 逆序执行全部清理（后创建的先删，避免级联约束），并清空清单。 */
  async cleanup() {
    for (const fn of this.cleanups.splice(0).reverse()) {
      await fn();
    }
  }
}
