import React from 'react';
import { useState } from 'react';
import {
  ArrowRight,
  ShoppingBag,
  Eye,
  EyeOff
} from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';

/**
 * 功能：认证页面组件
 * 提供登录和注册表单，对接 Supabase Auth
 */
export default function Auth() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * 功能：处理表单提交（登录或注册）
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, username || email.split('@')[0]);
      }
    } catch (err: any) {
      setError(err.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row bg-surface-container-lowest rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/10">
        {/* 左侧装饰区域 */}
        <div className="hidden lg:flex w-1/2 relative bg-surface-container-high overflow-hidden items-end p-12">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200"
              alt=""
              className="w-full h-full object-cover opacity-20 mix-blend-multiply"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-6 border border-white/20">
              <ShoppingBag className="text-white" size={32} />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-4 leading-none">Alittle</h2>
            <p className="text-white/80 font-bold text-xl max-w-xs uppercase tracking-widest text-sm">
              The intersection of social connectivity and financial precision.
            </p>
          </div>
        </div>

        {/* 右侧表单区域 */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <p className="text-on-surface-variant font-medium text-lg">
              {mode === 'login'
                ? '登录您的 Alittle 账户，继续您的交易之旅。'
                : '创建您的 Alittle 账户，加入高净值投资者社区。'}
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 注册时显示用户名字段 */}
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">用户名</label>
                <input
                  type="text"
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/20 transition-all font-bold"
                  placeholder="您的昵称"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">电子邮件</label>
              <input
                type="email"
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/20 transition-all font-bold"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/20 transition-all font-bold pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">确认密码</label>
                <input
                  type="password"
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/20 transition-all font-bold"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '处理中...' : (mode === 'login' ? '立即登录' : '创建账户')}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-outline-variant/10 flex justify-center">
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              {mode === 'login' ? '没有账户? 立即注册' : '已有账户? 返回登录'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
