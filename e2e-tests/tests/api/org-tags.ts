import { ApiClient } from './ApiClient';

export interface OrgTag {
  tagId: string;
  name: string;
  description?: string;
  parentTag?: string;
  uploadMaxSizeMb?: number;
}

export interface CreateOrgTagParams {
  tagId?: string;
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
