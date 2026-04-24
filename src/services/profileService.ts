/**
 * 功能：用户资料服务层
 * 直接通过 Supabase 访问资料数据，以及头像上传功能
 */
import { supabase } from '../lib/supabase';
import { ProfileData } from '../types';

/**
 * 功能：获取当前用户资料
 * 返回：用户资料数据
 */
export function fetchMyProfile(): Promise<ProfileData> {
  return (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) throw new Error(error.message);
    return data;
  })();
}

/**
 * 功能：更新当前用户资料
 * 参数：
 *     data: 更新数据
 * 返回：更新后的用户资料
 */
export function updateProfile(data: { username?: string; bio?: string; avatar_url?: string }): Promise<ProfileData> {
  return (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return profile;
  })();
}

/**
 * 功能：获取当前用户发布的帖子
 * 返回：帖子列表
 */
export function fetchMyPosts(): Promise<any[]> {
  return (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles!author_id(id, username, avatar_url)')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  })();
}

/**
 * 功能：获取当前用户发布的商品
 * 返回：商品列表
 */
export function fetchMyProducts(): Promise<any[]> {
  return (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    const { data, error } = await supabase
      .from('products')
      .select('*, seller:profiles!seller_id(id, username, avatar_url)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  })();
}

/**
 * 功能：上传用户头像到 Supabase Storage
 * 参数：
 *     file: 图片文件
 *     userId: 用户ID
 * 返回：头像的公开访问 URL
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  const { error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`头像上传失败: ${error.message}`);
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  /* 追加时间戳避免缓存 */
  return `${data.publicUrl}?t=${Date.now()}`;
}
