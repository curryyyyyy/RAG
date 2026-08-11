import { ApiClient } from './ApiClient';

/** GET /users/me 返回的当前用户信息（orgTags 为数组）。 */
export interface UserInfo {
  id: number;
  username: string;
  role: 'USER' | 'ADMIN';
  orgTags: string[];
  primaryOrg: string;
  createdAt?: string;
  updatedAt?: string;
}

/** GET /admin/users 返回的管理员视角用户（直接序列化 User 实体，orgTags 为逗号分隔字符串）。 */
export interface AdminUser {
  id: number;
  username: string;
  role: 'USER' | 'ADMIN';
  orgTags: string;
  primaryOrg: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 用户 API。
 * 注意：后端无删除用户端点，且注册默认 INVITE_ONLY（需邀请码），
 * 故本类仅作构件/查询用途，不用于测试用户种子。
 */
export class UserApi {
  constructor(private readonly client: ApiClient) {}

  login(username: string, password: string) {
    return this.client.login(username, password);
  }

  me() {
    return this.client.get<UserInfo>('/users/me');
  }

  list() {
    return this.client.get<AdminUser[]>('/admin/users');
  }

  /** PUT /admin/users/{userId}/org-tags，body 为 { orgTags }。 */
  assignOrgTags(userId: number | string, orgTags: string[]) {
    return this.client.put<unknown>(`/admin/users/${userId}/org-tags`, { orgTags });
  }
}
