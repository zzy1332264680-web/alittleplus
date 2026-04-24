/**
 * 功能：收藏服务层
 * 直接通过 Supabase 访问收藏数据
 */
import { supabase } from '../lib/supabase';

/**
 * 功能：获取收藏列表
 * 参数：
 *     type: 筛选类型（'post' | 'product'），留空则获取全部
 * 返回：收藏列表（含关联内容详情）
 */
export function fetchFavorites(type?: string): Promise<any[]> {
  return (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    let query = supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('target_type', type);
    }

    const { data: favorites, error } = await query;
    if (error) throw new Error(error.message);
    if (!favorites?.length) return [];

    const postIds = favorites.filter(f => f.target_type === 'post').map(f => f.target_id);
    const productIds = favorites.filter(f => f.target_type === 'product').map(f => f.target_id);

    const [{ data: posts, error: postError }, { data: products, error: productError }] = await Promise.all([
      postIds.length
        ? supabase.from('posts').select('*, author:profiles!author_id(id, username, avatar_url)').in('id', postIds)
        : Promise.resolve({ data: [], error: null }),
      productIds.length
        ? supabase.from('products').select('*, seller:profiles!seller_id(id, username, avatar_url)').in('id', productIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (postError) throw new Error(postError.message);
    if (productError) throw new Error(productError.message);

    return favorites.map(fav => ({
      ...fav,
      item: fav.target_type === 'post'
        ? (posts || []).find(post => post.id === fav.target_id)
        : (products || []).find(product => product.id === fav.target_id),
    }));
  })();
}

/**
 * 功能：添加收藏
 * 参数：
 *     targetType: 目标类型（'post' | 'product'）
 *     targetId: 目标ID
 * 返回：创建的收藏记录
 */
export function addFavorite(targetType: string, targetId: string): Promise<any> {
  return (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: user.id, target_type: targetType, target_id: targetId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  })();
}

/**
 * 功能：取消收藏
 * 参数：
 *     targetType: 目标类型
 *     targetId: 目标ID
 */
export function removeFavorite(targetType: string, targetId: string): Promise<{ message: string }> {
  return (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('target_type', targetType)
      .eq('target_id', targetId);

    if (error) throw new Error(error.message);
    return { message: '收藏已取消' };
  })();
}
