/**
 * 通用 REST 客户端，对接 PaiSmart 后端 API。
 * 约定：
 * - 业务成功 = 响应体 `code === 200`（数字或字符串均可）
 * - 认证 = `Authorization: Bearer <token>`
 * - 无感刷新 = 响应头 `New-Token`（大小写不敏感）出现时更新内存 token
 */
export class ApiClient {
  readonly baseURL: string;
  private token = '';

  constructor(baseURL = process.env.API_BASE_URL || 'http://localhost:8081/api/v1') {
    this.baseURL = baseURL.replace(/\/+$/, '');
  }

  setToken(token: string) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  /** POST /users/login，登录成功自动缓存 token。 */
  async login(username: string, password: string) {
    const data = await this.post<{ token: string; refreshToken: string }>('/users/login', { username, password }, { skipAuth: true });
    this.token = data.token;
    return data;
  }

  async get<T>(path: string, opts: RequestOptions = {}) {
    return this.request<T>('GET', path, opts);
  }

  async post<T>(path: string, body?: unknown, opts: RequestOptions = {}) {
    return this.request<T>('POST', path, { ...opts, body });
  }

  async put<T>(path: string, body?: unknown, opts: RequestOptions = {}) {
    return this.request<T>('PUT', path, { ...opts, body });
  }

  async delete<T>(path: string, opts: RequestOptions = {}) {
    return this.request<T>('DELETE', path, opts);
  }

  async request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
    const url = new URL(path.startsWith('http') ? path : `${this.baseURL}${path}`);
    if (opts.params) {
      for (const [k, v] of Object.entries(opts.params)) {
        if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
      }
    }

    const headers: Record<string, string> = {};
    let body: BodyInit | undefined;
    if (opts.formData) {
      body = opts.formData;
    } else if (opts.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(opts.body);
    }
    if (!opts.skipAuth && this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const res = await fetch(url.toString(), { method, headers, body });

    // 无感刷新：响应头 New-Token 更新内存 token
    const newToken = res.headers.get('new-token');
    if (newToken) this.token = newToken;

    let json: ApiEnvelope<T> | undefined;
    try {
      json = (await res.json()) as ApiEnvelope<T>;
    } catch {
      if (!res.ok) throw new ApiError(`HTTP ${res.status} ${method} ${path}`, res.status);
      json = { code: res.status, message: res.statusText, data: undefined as T };
    }

    if (json && !isOk(json.code)) {
      throw new ApiError(json.message || `请求失败: ${method} ${path}`, json.code, json);
    }
    return json?.data as T;
  }
}

export interface ApiEnvelope<T = unknown> {
  code: number | string;
  message: string;
  data: T;
}

export interface RequestOptions {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  formData?: FormData;
  skipAuth?: boolean;
}

export function isOk(code: number | string | undefined): boolean {
  return code === 200 || code === '200' || code === '0' || code === 0;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number | string,
    readonly envelope?: ApiEnvelope,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
