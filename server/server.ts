/**
 * 功能：Express 后端服务器入口
 * 挂载所有路由模块，配置中间件，启动 HTTP 服务
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import postRoutes from './routes/posts.js';
import productRoutes from './routes/products.js';
import chatRoutes from './routes/chat.js';
import profileRoutes from './routes/profile.js';
import favoriteRoutes from './routes/favorites.js';

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

/* 中间件配置 */
// 🔥 修复跨域：开发环境允许所有来源，不用再手动加IP/端口
app.use(cors({
  origin: true, // 允许所有前端地址访问
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

/* 路由挂载 */
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/products', productRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/favorites', favoriteRoutes);

/* 健康检查端点 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/* 全局错误处理 */
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('服务器错误:', err.message);
  res.status(500).json({ message: '服务器内部错误' });
});

/* 启动服务器 */
app.listen(PORT, () => {
  console.log(`✅ AlittlePlus 后端服务器已启动: http://localhost:${PORT}`);
  console.log(`📡 API 端点: http://localhost:${PORT}/api`);
});

export default app;