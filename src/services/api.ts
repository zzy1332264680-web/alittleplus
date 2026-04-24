import { supabase } from '../lib/supabase';

// 使用相对路径，开发时交给 Vite 代理，局域网访问时也不会错误指向访问者自己的 localhost。
const API_BASE = '/api';
const REQUEST_TIMEOUT_MS = 10000;

/** 功能：发送 HTTP 请求到后端 API */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  /* 获取当前用户的会话令牌 */
  const { data: { session } } = await supabase.auth.getSession();
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  /* 自动附加认证令牌 */
  if (session?.access_token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${session.access_token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '请求失败' }));
      throw new Error(error.message || `请求失败 (${response.status})`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('请求超时，请检查前端地址、代理配置或后端服务是否正常');
    }
    if (error instanceof TypeError) {
      throw new Error('无法连接到后端服务，请检查开发服务器和接口代理是否正常');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
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
