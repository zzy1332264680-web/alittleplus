/**
 * 功能：认证上下文
 * 管理用户登录/注册/登出状态，基于 Supabase Auth
 * 监听 auth 状态变化并自动刷新用户资料
 */
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { ProfileData } from '../types';

interface AuthContextType {
  /** 当前 Supabase 用户 */
  user: User | null;
  /** 当前会话 */
  session: Session | null;
  /** 用户资料数据 */
  profile: ProfileData | null;
  /** 是否正在加载 */
  loading: boolean;
  /**
   * 功能：用户登录
   * 参数：
   *     email: 邮箱
   *     password: 密码
   */
  login: (email: string, password: string) => Promise<void>;
  /**
   * 功能：用户注册
   * 参数：
   *     email: 邮箱
   *     password: 密码
   *     username: 用户名
   */
  register: (email: string, password: string, username: string) => Promise<void>;
  /** 功能：用户登出 */
  logout: () => Promise<void>;
  /** 功能：刷新用户资料 */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 功能：根据用户ID获取资料数据
   * 参数：
   *     userId: 用户ID
   *     token: 访问令牌
   */
  const fetchProfile = useCallback(async (userId: string, token: string) => {
    try {
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (err) {
      console.error('获取用户资料失败:', err);
    }
  }, []);

  /* 初始化：检查现有会话并监听认证状态变化 */
  useEffect(() => {
    /* 获取当前会话 */
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id, currentSession.access_token);
      }
      setLoading(false);
    });

    /* 监听认证状态变化 */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          /* 延迟获取资料，等待数据库触发器创建 profile */
          setTimeout(() => {
            fetchProfile(newSession.user.id, newSession.access_token);
          }, 500);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  /**
   * 功能：用户登录
   */
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  /**
   * 功能：用户注册
   */
  const register = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });
    if (error) throw error;
  };

  /**
   * 功能：用户登出
   */
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  /**
   * 功能：刷新用户资料
   */
  const refreshProfile = async () => {
    if (user && session) {
      await fetchProfile(user.id, session.access_token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 功能：获取认证上下文的 Hook
 * 返回：认证上下文数据和方法
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内使用');
  }
  return context;
}
