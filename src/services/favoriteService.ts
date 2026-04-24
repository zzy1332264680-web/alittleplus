/**
 * 功能：收藏服务层
 * 封装收藏相关的 API 调用
 */
import { get, post, del } from './api';

/**
 * 功能：获取收藏列表
 * 参数：
 *     type: 筛选类型（'post' | 'product'），留空则获取全部
 * 返回：收藏列表（含关联内容详情）
 */
export function fetchFavorites(type?: string): Promise<any[]> {
  const query = type ? `?type=${type}` : '';
  return get(`/favorites${query}`);
}

/**
 * 功能：添加收藏
 * 参数：
 *     targetType: 目标类型（'post' | 'product'）
 *     targetId: 目标ID
 * 返回：创建的收藏记录
 */
export function addFavorite(targetType: string, targetId: string): Promise<any> {
  return post('/favorites', { target_type: targetType, target_id: targetId });
}

/**
 * 功能：取消收藏
 * 参数：
 *     targetType: 目标类型
 *     targetId: 目标ID
 */
export function removeFavorite(targetType: string, targetId: string): Promise<{ message: string }> {
  return del(`/favorites/${targetType}/${targetId}`);
}
