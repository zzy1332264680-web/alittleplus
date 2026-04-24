/**
 * 功能：创建后端 Supabase 客户端工厂
 * 根据用户的 JWT 令牌创建已认证的 Supabase 客户端实例
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

/* 加载环境变量 */
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少 SUPABASE_URL 或 SUPABASE_ANON_KEY 环境变量');
}

/**
 * 功能：创建使用匿名密钥的 Supabase 客户端（无用户身份）
 * 返回：Supabase 客户端实例
 */
export function createAnonClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * 功能：创建带用户身份验证的 Supabase 客户端
 * 参数：
 *     accessToken: 用户的 JWT 访问令牌
 * 返回：已认证的 Supabase 客户端实例
 */
export function createAuthenticatedClient(accessToken: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}
