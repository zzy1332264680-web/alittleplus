/**
 * 功能：商品服务层
 * 直接通过 Supabase 访问闲置商品数据，以及图片上传到 Supabase Storage
 */
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
  return (async () => {
    const limit = params?.limit ?? 20;
    const page = params?.page ?? 1;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select('*, seller:profiles!seller_id(id, username, avatar_url)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    if (params?.category && params.category !== 'All Equipment') {
      query = query.eq('category', params.category);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { data: data || [], total: count || 0 };
  })();
}

/**
 * 功能：获取商品详情
 * 参数：
 *     id: 商品ID
 * 返回：商品详情（含卖家信息）
 */
export function fetchProduct(id: string): Promise<ProductWithSeller> {
  return (async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*, seller:profiles!seller_id(id, username, avatar_url)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  })();
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
  return (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        seller_id: user.id,
        name: data.name,
        description: data.description || '',
        price: Number(data.price),
        original_price: Number(data.original_price) || 0,
        category: data.category || '其他',
        condition: data.condition || '全新',
        location: data.location || '',
        images: data.images || [],
      })
      .select('*, seller:profiles!seller_id(id, username, avatar_url)')
      .single();

    if (error) throw new Error(error.message);
    return product;
  })();
}

/**
 * 功能：更新商品
 * 参数：
 *     id: 商品ID
 *     data: 更新数据
 * 返回：更新后的商品
 */
export function updateProduct(id: string, data: Partial<ProductWithSeller>): Promise<ProductWithSeller> {
  return (async () => {
    const { data: product, error } = await supabase
      .from('products')
      .update(data)
      .eq('id', id)
      .select('*, seller:profiles!seller_id(id, username, avatar_url)')
      .single();

    if (error) throw new Error(error.message);
    return product;
  })();
}

/**
 * 功能：删除商品
 * 参数：
 *     id: 商品ID
 */
export function deleteProduct(id: string): Promise<{ message: string }> {
  return (async () => {
    const { error } = await supabase.from('products').update({ status: 'removed' }).eq('id', id);
    if (error) throw new Error(error.message);
    return { message: '商品已删除' };
  })();
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
