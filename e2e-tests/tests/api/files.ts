import { createHash } from 'node:crypto';
import { ApiClient } from './ApiClient';

export interface UploadResult {
  fileMd5: string;
  fileName: string;
}

/** GET /documents/accessible 返回的文件对象（后端 convertFilesToResponse）。 */
export interface UploadedDoc {
  fileMd5: string;
  fileName: string;
  totalSize: number;
  /** 后端序列化 file.getStatus()（int）：0=上传中 1=已完成 2=合并中。 */
  status: number;
  userId: string;
  orgTag: string;
  /** 后端同时输出 public 与 isPublic 两个字段，均为同一布尔值。 */
  public: boolean;
  isPublic: boolean;
  createdAt?: string;
  mergedAt?: string;
  estimatedEmbeddingTokens?: number;
  estimatedChunkCount?: number;
  actualEmbeddingTokens?: number;
  actualChunkCount?: number;
  orgTagName?: string;
}

export interface UploadFileParams {
  orgTag?: string;
  isPublic?: boolean;
}

/** 文件 API（需 USER/ADMIN）。 */
export class FileApi {
  constructor(private readonly client: ApiClient) {}

  /**
   * 上传单个小文件：单分片 multipart → merge 触发异步解析。
   * 返回由本地计算的 32 位 MD5，与后端/前端一致。
   */
  async upload(fileName: string, buffer: Buffer, params: UploadFileParams = {}): Promise<UploadResult> {
    const fileMd5 = createHash('md5').update(buffer).digest('hex');
    const totalSize = buffer.byteLength;

    // File 的 BlobPart 需要 ArrayBuffer（Buffer 底层可能是 SharedArrayBuffer），复制一份以兼容类型
    const bytes = new Uint8Array(buffer.byteLength);
    bytes.set(buffer);
    const formData = new FormData();
    formData.set('file', new File([bytes.buffer], fileName, { type: 'text/plain' }));
    formData.set('fileMd5', fileMd5);
    formData.set('chunkIndex', '0');
    formData.set('totalChunks', '1');
    formData.set('totalSize', String(totalSize));
    formData.set('fileName', fileName);
    formData.set('orgTag', params.orgTag || 'DEFAULT');
    formData.set('isPublic', String(params.isPublic ?? false));

    await this.client.post('/upload/chunk', undefined, { formData });
    // MergeRequest 仅接受 fileMd5/fileName
    await this.client.post('/upload/merge', { fileMd5, fileName });

    return { fileMd5, fileName };
  }

  delete(fileMd5: string) {
    return this.client.delete<unknown>(`/documents/${fileMd5}`);
  }

  uploads() {
    return this.client.get<UploadedDoc[]>('/documents/accessible');
  }
}
