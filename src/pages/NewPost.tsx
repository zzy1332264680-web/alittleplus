import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Send, Smile, ImageIcon, BarChart2, Globe, Lock, RefreshCw } from '../components/Icons';
import { createPost } from '../services/postService';

interface NewPostProps { onBack: () => void; }

export default function NewPost({ onBack }: NewPostProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('美食');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /** 功能：提交帖子 */
  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) { setError('标题和内容不能为空'); return; }
    setLoading(true);
    setError('');
    try {
      await createPost({ title, content, category, visibility });
      onBack();
    } catch (e: any) {
      setError(e.message || '发布失败');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-32">
      <header className="sticky top-0 bg-surface-container/80 backdrop-blur-md z-50 px-4 md:px-8 h-16 flex items-center justify-between border-b border-outline-variant/10">
        <button onClick={onBack} className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-bold text-sm"><X size={20} />取消发布</button>
        <h1 className="text-sm font-black text-on-surface uppercase tracking-widest">发布新动态</h1>
        <div className="w-20"></div>
      </header>

      <main className="max-w-4xl mx-auto w-full p-4 md:p-8 space-y-8">
        {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">{error}</div>}

        <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-10 shadow-sm border border-outline-variant/10 ring-1 ring-black/5">
          <input className="w-full bg-transparent border-none outline-none text-3xl md:text-5xl font-black text-on-surface placeholder:text-outline-variant focus:ring-0 p-0 tracking-tighter mb-8" placeholder="请输入标题" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea className="w-full min-h-[400px] bg-transparent border-none outline-none text-lg leading-relaxed text-on-surface placeholder:text-outline focus:ring-0 p-0 font-medium mb-8" placeholder="请输入内容..." value={content} onChange={e => setContent(e.target.value)} />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-outline-variant/10">
            <div className="flex flex-wrap gap-2">
              {['美食', '摄影', '旅行', '健身', '情感', '学习', '校园', '影音', '艺术', '体育', '游戏', '动漫', '科技'].map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${category === cat ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container/50 text-outline hover:bg-surface-container hover:text-on-surface'}`}>{cat}</button>
              ))}
            </div>
            <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-lg border border-outline-variant/10 w-fit">
              <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-container-lowest text-on-surface-variant hover:text-primary"><ImageIcon size={18} /></button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-container-lowest text-on-surface-variant hover:text-primary"><BarChart2 size={18} /></button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface-container-lowest text-on-surface-variant hover:text-primary"><Smile size={18} /></button>
            </div>
          </div>
        </div>

        <section className="bg-surface-container-low/50 rounded-2xl p-6 border border-outline-variant/10">
          <h3 className="text-[10px] font-black text-outline uppercase tracking-widest mb-4">发帖选项</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={() => setVisibility('public')} className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${visibility === 'public' ? 'bg-primary/5 border-primary' : 'bg-surface-container-lowest border-outline-variant/10 hover:border-primary/30'}`}>
              <div className="flex items-center gap-3"><Globe size={18} className="text-secondary" /><div><p className="text-sm font-bold text-on-surface">人人可见</p><p className="text-[10px] text-outline font-medium">所有人都可以查看和回复</p></div></div>
            </button>
            <button onClick={() => setVisibility('private')} className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${visibility === 'private' ? 'bg-primary/5 border-primary' : 'bg-surface-container-lowest border-outline-variant/10 hover:border-primary/30'}`}>
              <div className="flex items-center gap-3"><Lock size={18} className="text-outline" /><div><p className="text-sm font-bold text-on-surface">私密草案</p><p className="text-[10px] text-outline font-medium">仅保存为个人笔记</p></div></div>
            </button>
          </div>
        </section>
      </main>

      <div className="sticky bottom-0 left-0 w-full p-4 bg-background/95 backdrop-blur-xl border-t border-outline-variant/10 z-40 mt-auto">
        <div className="max-w-4xl mx-auto flex justify-between items-center px-4">
          <div className="hidden sm:flex items-center gap-2 text-outline font-bold text-[10px] uppercase tracking-widest"><RefreshCw size={14} /><span>自动保存</span></div>
          <div className="flex gap-4 w-full sm:w-auto">
            <button onClick={onBack} className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container transition-all">取消</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-[2] sm:flex-none px-12 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
              {loading ? '发布中...' : '发布新帖子'}<Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
