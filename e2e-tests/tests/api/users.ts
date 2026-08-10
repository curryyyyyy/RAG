import { ApiClient } from './ApiClient';

export interface UserInfo {
  userId?: string | number;
  username: string;
  role?: string;
  orgTags?: string[];
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
    return this.client.get<UserInfo[]>('/admin/users');
  }

  assignOrgTags(userId: string | number, tagIds: string[]) {
    return this.client.post<unknown>(`/admin/users/${userId}/org-tags`, { tagIds });
  }
}
