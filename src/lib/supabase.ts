/**
 * 功能：初始化 Supabase 前端客户端
 * 用于认证（Auth）、实时通信（Realtime）、文件存储（Storage）
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少 Supabase 环境变量配置，请检查 .env.local 文件');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    /* 使用 localStorage 持久化会话 */
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      /* 启用所有 Realtime 事件类型 */
      eventsPerSecond: 10,
    },
  },
});
