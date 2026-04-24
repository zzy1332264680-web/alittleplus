import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  User, 
  Settings as SettingsIcon, 
  LogOut, 
  MessageCircle,
  Menu,
  X,
  Home,
  Package,
} from './components/Icons';
import { Page } from './types';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';

/* 导入页面组件 */
import Dashboard from './pages/Dashboard';
import Forum from './pages/Forum';
import Market from './pages/Market';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import NewPost from './pages/NewPost';
import NewMarketPost from './pages/NewMarketPost';
import Settings from './pages/Settings';

export default function App() {
  const { t } = useLanguage();
  const { user, profile, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* 加载中显示骨架屏 */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-container animate-pulse" />
          <p className="text-sm text-outline font-bold">加载中...</p>
        </div>
      </div>
    );
  }

  /* 未登录显示认证页面 */
  if (!user) {
    return <Auth />;
  }

  /* 当前用户的显示信息 */
  const displayName = profile?.username || user.email?.split('@')[0] || '用户';
  const displayEmail = profile?.email || user.email || '';
  const displayAvatar = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`;

  const PageContent = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'forum': return <Forum onNavigate={setCurrentPage} />;
      case 'market': return <Market onNavigate={setCurrentPage} />;
      case 'chat': return <Chat />;
      case 'profile': return <Profile onNavigate={setCurrentPage} />;
      case 'settings': return <Settings onBack={() => setCurrentPage('dashboard')} onLogout={logout} />;
      case 'new-post': return <NewPost onBack={() => setCurrentPage('forum')} />;
      case 'new-market-post': return <NewMarketPost onBack={() => setCurrentPage('market')} />;
      case 'edit-profile': return <Profile onNavigate={setCurrentPage} isEditing />;
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: Home, label: t.nav.dashboard },
    { id: 'market', icon: Package, label: t.nav.market },
    { id: 'forum', icon: MessageCircle, label: t.nav.forum },
    { id: 'chat', icon: MessageSquare, label: t.nav.chat },
    { id: 'profile', icon: User, label: t.nav.profile },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* 侧边栏 - 桌面端 */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-container border-r border-transparent p-4 z-40 h-full overflow-y-auto">
        <div className="mb-8 px-2 flex items-center gap-4">
          <div className="relative">
            <img src={displayAvatar} alt="用户头像" className="w-12 h-12 rounded-full object-cover border-2 border-primary/10 shadow-sm" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-surface-container rounded-full"></div>
          </div>
          <div className="flex-1 overflow-hidden">
            <h1 className="text-sm font-bold text-on-surface truncate">{displayName}</h1>
            <p className="text-[10px] text-outline font-medium truncate">{displayEmail}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id as Page)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                currentPage === item.id 
                  ? 'bg-surface-container-lowest text-primary shadow-sm ring-1 ring-black/5' 
                  : 'text-outline hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <item.icon size={20} className={currentPage === item.id ? 'fill-primary/10' : ''} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-outline-variant/10 space-y-2">
          <button 
            onClick={() => setCurrentPage('settings')}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-outline rounded-lg hover:bg-surface-container-high hover:text-on-surface transition-all"
          >
            <SettingsIcon size={20} />
            {t.nav.settings}
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-outline rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={20} />
            {t.nav.logout}
          </button>
        </div>
      </aside>

      {/* 移动端顶部栏 */}
      <header className="md:hidden fixed top-0 w-full h-16 bg-surface-container/80 backdrop-blur-md flex items-center justify-between px-4 z-50 border-b border-outline-variant/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-on-primary font-bold text-xs uppercase">
            AL
          </div>
          <span className="font-bold text-sm tracking-tight text-primary">Alittle</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-on-surface-variant"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* 移动端菜单 */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 bg-background z-40 md:hidden pt-16"
          >
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id as Page);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-4 text-base font-semibold rounded-xl ${
                    currentPage === item.id 
                      ? 'bg-primary-container/10 text-primary' 
                      : 'text-outline'
                  }`}
                >
                  <item.icon size={24} />
                  {item.label}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-outline-variant/10">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-4 px-4 py-4 text-base font-semibold text-outline"
                >
                  <LogOut size={24} />
                  {t.nav.logout}
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto relative pt-16 md:pt-0">
        <PageContent />
      </main>
    </div>
  );
}
