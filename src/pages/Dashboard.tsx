import { Page } from '../types';
import { Package, MessageCircle } from '../components/Icons';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps { onNavigate: (page: Page) => void; }

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { profile } = useAuth();
  const displayName = profile?.username || '用户';

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-on-surface tracking-tight mb-2">欢迎回来，{displayName}</h2>
          <p className="text-on-surface-variant font-medium">您的 Alittle 账户已就绪。今天想探索什么？</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[220px]">
        {/* 闲置交易卡片 */}
        <motion.button
          whileHover={{ y: -4 }}
          onClick={() => onNavigate('market')}
          className="md:col-span-8 group relative overflow-hidden rounded-2xl bg-surface-container-lowest p-8 flex flex-col justify-end text-left shadow-sm border border-outline-variant/10 ring-1 ring-black/5"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-surface-container-lowest to-surface-container-low opacity-50 z-0"></div>
          <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl flex items-center justify-center mb-6 shadow-sm"><Package size={24} /></div>
            <h3 className="text-2xl font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">闲置交易 (Marketplace)</h3>
            <p className="text-sm text-on-surface-variant max-w-md">浏览精选闲置，发现高性价比专业装备，轻松出掉您的闲置资产。</p>
          </div>
        </motion.button>

        {/* 即时通讯卡片 */}
        <motion.button
          whileHover={{ y: -4 }}
          onClick={() => onNavigate('chat')}
          className="md:col-span-4 group relative overflow-hidden rounded-2xl bg-surface-container-lowest p-8 flex flex-col justify-end text-left shadow-sm border border-outline-variant/10 ring-1 ring-black/5"
        >
          <div className="relative z-10">
            <div className="w-12 h-12 bg-surface-container-high text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-colors"><MessageCircle size={24} /></div>
            <h3 className="text-xl font-bold text-on-surface mb-2">即时通讯</h3>
            <p className="text-sm text-on-surface-variant">与顾问和同行保持实时联系。</p>
          </div>
        </motion.button>

        {/* 社区论坛卡片 */}
        <motion.button
          whileHover={{ y: -4 }}
          onClick={() => onNavigate('forum')}
          className="md:col-span-12 group relative overflow-hidden rounded-2xl bg-surface-container-lowest p-8 flex flex-col md:flex-row md:items-center text-left shadow-sm border border-outline-variant/10 ring-1 ring-black/5"
        >
          <div className="flex-grow pr-8 border-r-0 md:border-r border-outline-variant/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-surface-container-high text-primary rounded-xl flex items-center justify-center"><MessageCircle size={24} /></div>
              <h3 className="text-xl font-bold text-on-surface">社区论坛 (Community Forum)</h3>
            </div>
            <p className="text-sm text-on-surface-variant max-w-2xl mb-6">加入深度讨论。发现市场洞察，分享策略，参与高净值投资者社群。</p>
            <div className="flex flex-wrap gap-2">
              {['# 科技股财报', '# 宏观经济分析', '# 交易心得'].map(tag => (
                <span key={tag} className="text-[10px] font-bold bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-full uppercase tracking-widest">{tag}</span>
              ))}
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center justify-center min-w-[180px] pl-8">
            <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-1">社区动态</p>
            <p className="text-4xl font-black text-on-surface">🚀</p>
            <p className="text-xs text-on-surface-variant font-medium">探索更多</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
