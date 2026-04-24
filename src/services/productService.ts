/**
 * 功能：商品服务层
 * 封装闲置商品相关的所有 API 调用，以及图片上传到 Supabase Storage
 */
import { get, post, put, del } from './api';
import { ProductWithSeller } from '../types';
import { supabase } from '../lib/supabase';

interface ProductListResponse {
  data: ProductWithSeller[];
  total: number;
}

/**
 * 功能：获取商品列表
 * 参数：
 *     params: 分页、搜索和分类筛选参数
 * 返回：商品列表和总数
 */
export function fetchProducts(params?: { page?: number; limit?: number; search?: string; category?: string }): Promise<ProductListResponse> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);
  return get(`/products?${query.toString()}`);
}

/**
 * 功能：获取商品详情
 * 参数：
 *     id: 商品ID
 * 返回：商品详情（含卖家信息）
 */
export function fetchProduct(id: string): Promise<ProductWithSeller> {
  return get(`/products/${id}`);
}

/**
 * 功能：发布新商品
 * 参数：
 *     data: 商品数据
 * 返回：创建的商品
 */
export function createProduct(data: {
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category?: string;
  condition?: string;
  location?: string;
  images?: string[];
}): Promise<ProductWithSeller> {
  return post('/products', data);
}

/**
 * 功能：更新商品
 * 参数：
 *     id: 商品ID
 *     data: 更新数据
 * 返回：更新后的商品
 */
export function updateProduct(id: string, data: Partial<ProductWithSeller>): Promise<ProductWithSeller> {
  return put(`/products/${id}`, data);
}

/**
 * 功能：删除商品
 * 参数：
 *     id: 商品ID
 */
export function deleteProduct(id: string): Promise<{ message: string }> {
  return del(`/products/${id}`);
}

/**
 * 功能：上传商品图片到 Supabase Storage
 * 参数：
 *     file: 图片文件
 *     userId: 用户ID（用于文件路径隔离）
 * 返回：图片的公开访问 URL
 */
export async function uploadProductImage(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`图片上传失败: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
