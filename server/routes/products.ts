/**
 * 功能：闲置商品相关路由
 * 提供商品的增删改查、搜索筛选功能
 */
import { Router, Request, Response } from 'express';
import { createAuthenticatedClient } from '../supabaseClient.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/products
 * 功能：获取商品列表，支持分页、搜索和分类筛选
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const { page = '1', limit = '20', search = '', category = '' } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    let query = supabase
      .from('products')
      .select('*, seller:profiles!seller_id(id, username, avatar_url)', { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (category && category !== 'All Equipment') {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.json({ data, total: count });
  } catch (err) {
    res.status(500).json({ message: '获取商品列表时出错' });
  }
});

/**
 * GET /api/products/:id
 * 功能：获取商品详情
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const { data, error } = await supabase
      .from('products')
      .select('*, seller:profiles!seller_id(id, username, avatar_url)')
      .eq('id', req.params.id)
      .single();

    if (error) {
      res.status(404).json({ message: '商品不存在' });
      return;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: '获取商品详情时出错' });
  }
});

/**
 * POST /api/products
 * 功能：发布新商品
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { name, description, price, original_price, category, condition, location, images } = req.body;

  if (!name || price === undefined) {
    res.status(400).json({ message: '商品名称和价格不能为空' });
    return;
  }

  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const { data, error } = await supabase
      .from('products')
      .insert({
        seller_id: req.userId,
        name,
        description: description || '',
        price: Number(price),
        original_price: Number(original_price) || 0,
        category: category || '其他',
        condition: condition || '全新',
        location: location || '',
        images: images || [],
      })
      .select('*, seller:profiles!seller_id(id, username, avatar_url)')
      .single();

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: '发布商品时出错' });
  }
});

/**
 * PUT /api/products/:id
 * 功能：更新商品信息
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  const updates = req.body;

  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .eq('seller_id', req.userId!)
      .select()
      .single();

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: '更新商品时出错' });
  }
});

/**
 * DELETE /api/products/:id
 * 功能：删除商品（标记为已移除）
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const { error } = await supabase
      .from('products')
      .update({ status: 'removed' })
      .eq('id', req.params.id)
      .eq('seller_id', req.userId!);

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.json({ message: '商品已删除' });
  } catch (err) {
    res.status(500).json({ message: '删除商品时出错' });
  }
});

export default router;
