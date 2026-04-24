/**
 * 功能：论坛帖子相关路由
 * 提供帖子的增删改查、点赞、评论功能
 */
import { Router, Request, Response } from 'express';
import { createAuthenticatedClient } from '../supabaseClient.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/posts
 * 功能：获取帖子列表，支持分页和搜索
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const { page = '1', limit = '20', search = '', category = '' } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    let query = supabase
      .from('posts')
      .select('*, author:profiles!author_id(id, username, email, avatar_url)', { count: 'exact' })
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.json({ data, total: count });
  } catch (err) {
    res.status(500).json({ message: '获取帖子列表时出错' });
  }
});

/**
 * GET /api/posts/:id
 * 功能：获取帖子详情，并自增浏览量
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthenticatedClient(req.accessToken!);

    /* 获取帖子详情及作者信息 */
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles!author_id(id, username, email, avatar_url)')
      .eq('id', req.params.id)
      .single();

    if (error) {
      res.status(404).json({ message: '帖子不存在' });
      return;
    }

    /* 自增浏览量（不阻塞响应） */
    supabase
      .from('posts')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', req.params.id)
      .then();

    /* 检查当前用户是否已点赞 */
    const { data: likeData } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', req.params.id)
      .eq('user_id', req.userId!)
      .maybeSingle();

    res.json({ ...data, is_liked: !!likeData });
  } catch (err) {
    res.status(500).json({ message: '获取帖子详情时出错' });
  }
});

/**
 * POST /api/posts
 * 功能：创建新帖子
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { title, content, excerpt, category, visibility } = req.body;

  if (!title || !content) {
    res.status(400).json({ message: '标题和内容不能为空' });
    return;
  }

  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    /* 如果没有提供摘要，自动从正文截取前100字 */
    const autoExcerpt = excerpt || content.substring(0, 100) + (content.length > 100 ? '...' : '');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: req.userId,
        title,
        content,
        excerpt: autoExcerpt,
        category: category || '其他',
        visibility: visibility || 'public',
      })
      .select('*, author:profiles!author_id(id, username, email, avatar_url)')
      .single();

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: '创建帖子时出错' });
  }
});

/**
 * PUT /api/posts/:id
 * 功能：更新帖子
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  const { title, content, excerpt, category, visibility } = req.body;

  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const { data, error } = await supabase
      .from('posts')
      .update({ title, content, excerpt, category, visibility })
      .eq('id', req.params.id)
      .eq('author_id', req.userId!)
      .select()
      .single();

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: '更新帖子时出错' });
  }
});

/**
 * DELETE /api/posts/:id
 * 功能：删除帖子
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', req.params.id)
      .eq('author_id', req.userId!);

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.json({ message: '帖子已删除' });
  } catch (err) {
    res.status(500).json({ message: '删除帖子时出错' });
  }
});

/**
 * POST /api/posts/:id/like
 * 功能：切换帖子的点赞状态
 */
router.post('/:id/like', authMiddleware, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthenticatedClient(req.accessToken!);

    /* 检查是否已点赞 */
    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', req.params.id)
      .eq('user_id', req.userId!)
      .maybeSingle();

    if (existing) {
      /* 已点赞则取消 */
      await supabase.from('post_likes').delete().eq('id', existing.id);
      res.json({ liked: false });
    } else {
      /* 未点赞则新增 */
      await supabase.from('post_likes').insert({
        post_id: req.params.id,
        user_id: req.userId,
      });
      res.json({ liked: true });
    }
  } catch (err) {
    res.status(500).json({ message: '操作点赞时出错' });
  }
});

/**
 * GET /api/posts/:id/comments
 * 功能：获取帖子的评论列表
 */
router.get('/:id/comments', authMiddleware, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const { data, error } = await supabase
      .from('post_comments')
      .select('*, author:profiles!author_id(id, username, avatar_url)')
      .eq('post_id', req.params.id)
      .order('created_at', { ascending: true });

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: '获取评论时出错' });
  }
});

/**
 * POST /api/posts/:id/comments
 * 功能：发表评论
 */
router.post('/:id/comments', authMiddleware, async (req: Request, res: Response) => {
  const { content } = req.body;

  if (!content) {
    res.status(400).json({ message: '评论内容不能为空' });
    return;
  }

  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: req.params.id,
        author_id: req.userId,
        content,
      })
      .select('*, author:profiles!author_id(id, username, avatar_url)')
      .single();

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: '发表评论时出错' });
  }
});

export default router;
