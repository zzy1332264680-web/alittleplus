import { useState, useEffect } from 'react';
import { Page, ProductWithSeller } from '../types';
import { fetchProducts } from '../services/productService';
import { Search, ArrowLeft, MoreHorizontal, Bookmark, Share2, Plus, MapPin, Star, ChevronRight, Heart, MessageSquare } from '../components/Icons';
import { motion } from 'motion/react';

interface MarketProps { onNavigate: (page: Page) => void; }

/** 功能：格式化时间 */
function formatTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hr = Math.floor(diff / 3600000);
  if (hr < 1) return '刚刚发布';
  if (hr < 24) return `${hr}小时前发布`;
  const day = Math.floor(hr / 24);
  return `${day}天前发布`;
}

export default function Market({ onNavigate }: MarketProps) {
  const [products, setProducts] = useState<ProductWithSeller[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithSeller | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // 🔥 修复：正确的 useState 调用
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async (search?: string) => {
    setLoading(true);
    setLoadError('');
    try { const r = await fetchProducts({ search }); setProducts(r.data || []); }
    catch (e) {
      console.error('加载商品失败:', e);
      setLoadError(e instanceof Error ? e.message : '加载商品失败');
    }
    finally { setLoading(false); }
  };

  /* 商品详情 */
  if (selectedProduct) {
    const p = selectedProduct;
    return (
      <div className="bg-background min-h-screen">
        <header className="sticky top-0 bg-surface-container/80 backdrop-blur-md z-30 px-4 md:px-8 h-16 flex items-center justify-between border-b border-outline-variant/10">
          <button onClick={() => setSelectedProduct(null)} className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-bold text-sm"><ArrowLeft size={18} />市场 / 商品详情</button>
          <MoreHorizontal size={20} className="text-on-surface-variant" />
        </header>
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <div className="aspect-square bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 relative group">
                <img src={p.images?.[0] || 'https://placehold.co/600x600/png'} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {p.images?.length > 1 && <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest">1 / {p.images.length}</div>}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10 mb-6 flex-1">
                <div className="flex flex-wrap gap-2 mb-6">
                  {[p.condition, p.location, formatTime(p.created_at)].filter(Boolean).map(tag => (
                    <span key={tag} className="bg-surface-container-low text-on-surface-variant px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">{tag}</span>
                  ))}
                </div>
                <h1 className="text-3xl font-black text-on-surface mb-4 leading-tight">{p.name}</h1>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-lg font-bold text-primary">¥</span>
                  <span className="text-5xl font-black text-primary tracking-tighter">{p.price.toLocaleString()}</span>
                  {p.original_price > 0 && <span className="text-sm text-outline ml-2 line-through">¥{p.original_price.toLocaleString()}</span>}
                </div>
                <div className="mb-10">
                  <h3 className="text-[10px] font-bold text-on-surface mb-3 uppercase tracking-widest">商品描述</h3>
                  <p className="text-on-surface-variant leading-relaxed font-medium">{p.description}</p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-5 flex items-center justify-between hover:bg-surface-container-highest transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <img src={p.seller?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${p.seller?.username || 'User'}`} alt="" className="w-12 h-12 rounded-full object-cover bg-surface-container-highest" />
                    <div>
                      <h4 className="font-bold text-on-surface">{p.seller?.username}</h4>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-outline" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex flex-col items-center justify-center p-3 text-on-surface-variant hover:text-primary"><Heart size={24} /><span className="text-[10px] font-bold mt-1 uppercase tracking-widest">收藏</span></button>
                <button className="flex-1 bg-surface-container shadow-sm text-primary font-bold py-4 rounded-xl hover:opacity-90 transition-all">留言</button>
                <button className="flex-[2] bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex justify-center items-center gap-2"><MessageSquare size={20} />立即沟通</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* 商品列表 */
  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
      <aside className="w-64 shrink-0 space-y-8 hidden lg:block">
        <div><h2 className="text-3xl font-black text-on-surface tracking-tight mb-2">等闲易趣</h2><p className="text-sm text-on-surface-variant font-medium">发现高品质的闲置好物。</p></div>
      </aside>
      <div className="flex-1">
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-start md:items-center">
          <div className="flex-1 relative group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={20} />
            <input className="w-full bg-surface-container-low border-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/15 rounded-xl py-4 pl-12 pr-4 text-sm font-medium transition-all shadow-sm" placeholder="搜索商品..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadProducts(searchQuery)} />
          </div>
          <button onClick={() => onNavigate('new-market-post')} className="whitespace-nowrap bg-primary text-on-primary px-6 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto"><Plus size={18} />发布闲置</button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">{[1, 2, 3].map(i => <div key={i} className="bg-surface-container-lowest rounded-2xl overflow-hidden animate-pulse"><div className="aspect-square bg-surface-container" /><div className="p-5"><div className="h-4 bg-surface-container rounded w-1/3 mb-4" /><div className="h-6 bg-surface-container rounded w-2/3 mb-3" /><div className="h-4 bg-surface-container rounded w-full" /></div></div>)}</div>
        ) : loadError ? (
          <div className="bg-surface-container-lowest border border-red-200 rounded-2xl p-10 text-center">
            <p className="font-bold text-red-600 mb-2">闲置列表加载失败</p>
            <p className="text-sm text-outline mb-6">{loadError}</p>
            <button onClick={() => loadProducts(searchQuery)} className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-all">
              重试加载
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-outline"><MapPin size={48} className="mx-auto mb-4 opacity-30" /><p className="font-bold">暂无商品</p><p className="text-sm mt-2">快来发布您的第一件闲置吧！</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map(product => (
              <motion.article key={product.id} whileHover={{ y: -4 }} onClick={() => setSelectedProduct(product)} className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10 ring-1 ring-black/5 flex flex-col group cursor-pointer">
                <div className="aspect-square relative overflow-hidden bg-surface-container-low">
                  <img src={product.images?.[0] || 'https://placehold.co/400x400/png'} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-primary uppercase tracking-widest">{product.condition}</span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-sm font-black text-on-surface mb-1 line-clamp-2">{product.name}</h3>
                  <div className="text-lg font-black text-primary mb-4 mt-auto">¥{product.price.toLocaleString()}</div>
                  <div className="flex items-center gap-6 pt-4 border-t border-outline-variant/10 font-bold text-[10px] uppercase tracking-widest text-outline">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"><MapPin size={12} /> {product.location}</div>
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{formatTime(product.created_at)}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
