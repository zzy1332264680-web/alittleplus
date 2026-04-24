/**
 * 功能：认证相关路由
 * 提供用户注册、登录、登出、获取当前用户信息的 API
 */
import { Router, Request, Response } from 'express';
import { createAnonClient, createAuthenticatedClient } from '../supabaseClient.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/register
 * 功能：用户注册
 */
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: '邮箱和密码不能为空' });
    return;
  }

  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username || email.split('@')[0] },
      },
    });

    if (error) {
      res.status(400).json({ message: error.message });
      return;
    }

    res.json({
      user: data.user,
      session: data.session,
      message: '注册成功',
    });
  } catch (err) {
    res.status(500).json({ message: '注册过程中发生错误' });
  }
});

/**
 * POST /api/auth/login
 * 功能：用户登录
 */
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: '邮箱和密码不能为空' });
    return;
  }

  try {
    const supabase = createAnonClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({ message: error.message });
      return;
    }

    res.json({
      user: data.user,
      session: data.session,
      message: '登录成功',
    });
  } catch (err) {
    res.status(500).json({ message: '登录过程中发生错误' });
  }
});

/**
 * GET /api/auth/me
 * 功能：获取当前登录用户信息
 */
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.userId!)
      .single();

    if (error) {
      res.status(404).json({ message: '用户资料未找到' });
      return;
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: '获取用户信息时出错' });
  }
});

export default router;
