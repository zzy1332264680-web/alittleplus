import { supabase } from '../lib/supabase';

// 修复：明确指向后端 3001 端口
const API_BASE = 'http://localhost:3001/api';

/** 功能：发送 HTTP 请求到后端 API */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  /* 获取当前用户的会话令牌 */
  const { data: { session } } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  /* 自动附加认证令牌 */
  if (session?.access_token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(error.message || `请求失败 (${response.status})`);
  }

  return response.json();
}

/** GET 请求 */
export function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

/** POST 请求 */
export function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** PUT 请求 */
export function put<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/** DELETE 请求 */
export function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}