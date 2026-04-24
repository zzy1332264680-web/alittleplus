/**
 * 功能：用户资料相关路由
 * 提供用户资料的查询和更新功能
 */
import { Router, Request, Response } from 'express';
import { createAuthenticatedClient } from '../supabaseClient.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/profile
 * 功能：获取当前登录用户的完整资料
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.userId!)
      .single();

    if (error) {
      res.status(404).json({ message: '用户资料未找到' });
      return;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: '获取用户资料时出错' });
  }
});

/**
 * PUT /api/profile
 * 功能：更新当前用户资料
 */
router.put('/', authMiddleware, async (req: Request, res: Response) => {
  const { username, bio, avatar_url } = req.body;

  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const updates: Record<string, string> = {};

    if (username !== undefined) updates.username = username;
    if (bio !== undefined) updates.bio = bio;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.userId!)
      .select()
      .single();

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: '更新用户资料时出错' });
  }
});

/**
 * GET /api/profile/:id
 * 功能：获取其他用户的公开资料
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, bio, created_at')
      .eq('id', req.params.id)
      .single();

    if (error) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: '获取用户资料时出错' });
  }
});

/**
 * GET /api/profile/posts/my
 * 功能：获取当前用户发布的帖子
 */
router.get('/posts/my', authMiddleware, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles!author_id(id, username, avatar_url)')
      .eq('author_id', req.userId!)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: '获取用户帖子时出错' });
  }
});

/**
 * GET /api/profile/products/my
 * 功能：获取当前用户发布的商品
 */
router.get('/products/my', authMiddleware, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const { data, error } = await supabase
      .from('products')
      .select('*, seller:profiles!seller_id(id, username, avatar_url)')
      .eq('seller_id', req.userId!)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.json(data || []);
  } catch (err) {
    res.status(500).json({ message: '获取用户商品时出错' });
  }
});

export default router;
