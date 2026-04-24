/**
 * 功能：JWT 认证中间件
 * 验证请求头中的 Supabase 访问令牌，并将用户信息注入请求对象
 */
import { Request, Response, NextFunction } from 'express';
import { createAnonClient } from '../supabaseClient.js';

/** 扩展 Express Request 类型，添加用户信息 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      accessToken?: string;
    }
  }
}

/**
 * 功能：验证用户身份的中间件
 * 参数：
 *     req: Express 请求对象
 *     res: Express 响应对象
 *     next: 下一个中间件函数
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: '未提供认证令牌' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    /* 使用匿名客户端验证 JWT 令牌 */
    const supabase = createAnonClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ message: '认证令牌无效或已过期' });
      return;
    }

    /* 将用户信息注入请求对象供后续路由使用 */
    req.userId = user.id;
    req.accessToken = token;
    next();
  } catch (err) {
    res.status(500).json({ message: '认证验证过程出错' });
  }
}
