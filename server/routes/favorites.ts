/**
 * 功能：收藏相关路由
 * 提供帖子和商品的收藏管理功能
 */
import { Router, Request, Response } from 'express';
import { createAuthenticatedClient } from '../supabaseClient.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/favorites
 * 功能：获取当前用户的收藏列表，可按类型筛选
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const { type = '' } = req.query;

  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    let query = supabase
      .from('favorites')
      .select('*')
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('target_type', type);
    }

    const { data: favorites, error } = await query;

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    if (!favorites?.length) {
      res.json([]);
      return;
    }

    /* 根据类型分别获取关联的帖子或商品详情 */
    const postIds = favorites.filter(f => f.target_type === 'post').map(f => f.target_id);
    const productIds = favorites.filter(f => f.target_type === 'product').map(f => f.target_id);

    let posts: any[] = [];
    let products: any[] = [];

    if (postIds.length) {
      const { data } = await supabase
        .from('posts')
        .select('*, author:profiles!author_id(id, username, avatar_url)')
        .in('id', postIds);
      posts = data || [];
    }

    if (productIds.length) {
      const { data } = await supabase
        .from('products')
        .select('*, seller:profiles!seller_id(id, username, avatar_url)')
        .in('id', productIds);
      products = data || [];
    }

    /* 将收藏记录与具体内容合并 */
    const result = favorites.map(fav => {
      if (fav.target_type === 'post') {
        return { ...fav, item: posts.find(p => p.id === fav.target_id) };
      }
      return { ...fav, item: products.find(p => p.id === fav.target_id) };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: '获取收藏列表时出错' });
  }
});

/**
 * POST /api/favorites
 * 功能：添加收藏
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { target_type, target_id } = req.body;

  if (!target_type || !target_id) {
    res.status(400).json({ message: '缺少收藏目标参数' });
    return;
  }

  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: req.userId,
        target_type,
        target_id,
      })
      .select()
      .single();

    if (error) {
      /* 唯一约束冲突说明已经收藏过 */
      if (error.code === '23505') {
        res.status(409).json({ message: '已经收藏过此内容' });
        return;
      }
      res.status(500).json({ message: error.message });
      return;
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: '添加收藏时出错' });
  }
});

/**
 * DELETE /api/favorites/:targetType/:targetId
 * 功能：取消收藏
 */
router.delete('/:targetType/:targetId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', req.userId!)
      .eq('target_type', req.params.targetType)
      .eq('target_id', req.params.targetId);

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.json({ message: '收藏已取消' });
  } catch (err) {
    res.status(500).json({ message: '取消收藏时出错' });
  }
});

export default router;
