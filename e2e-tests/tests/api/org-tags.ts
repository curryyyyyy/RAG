import { ApiClient } from './ApiClient';

/**
 * 组织标签（POST/GET /admin/org-tags 的 data 结构，即后端 OrganizationTag 实体序列化）。
 * 注意：响应字段是 uploadMaxSizeBytes（字节）；uploadMaxSizeMb 仅用于创建请求，见 CreateOrgTagParams。
 */
export interface OrgTag {
  tagId: string;
  name: string;
  description: string | null;
  parentTag: string | null;
  uploadMaxSizeBytes: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrgTagParams {
  tagId: string;
  name: string;
  description?: string;
  parentTag?: string;
  uploadMaxSizeMb?: number;
}

/** 组织标签 API（需 ADMIN）。 */
export class OrgTagApi {
  constructor(private readonly client: ApiClient) {}

  create(params: CreateOrgTagParams) {
    return this.client.post<OrgTag>('/admin/org-tags', params);
  }

  delete(tagId: string) {
    return this.client.delete<unknown>(`/admin/org-tags/${tagId}`);
  }

  list() {
    return this.client.get<OrgTag[]>('/admin/org-tags');
  }
}
