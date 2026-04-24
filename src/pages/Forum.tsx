import { useState, useEffect } from 'react';
import { Page, PostWithAuthor, CommentWithAuthor } from '../types';
import { fetchPosts, fetchComments, createComment, toggleLike } from '../services/postService';
import { ArrowLeft, Bookmark, Share2, ThumbsUp, MessageCircle, Eye, Plus, MoreHorizontal, Smile, ImageIcon, Send, Search } from '../components/Icons';
import { motion } from 'motion/react';

interface ForumProps { onNavigate: (page: Page) => void; }

/** 功能：计算阅读时长 */
function getReadTime(content: string): string {
  return `${Math.max(1, Math.ceil(content.length / 500))} 分钟阅读`;
}

/** 功能：格式化时间戳 */
function formatDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min}分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}小时前`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}天前`;
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Forum({ onNavigate }: ForumProps) {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [commentText, setCommentText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => { loadPosts(); }, []);

  const loadPosts = async (search?: string) => {
    setLoading(true);
    setLoadError('');
    try { const r = await fetchPosts({ search }); setPosts(r.data || []); }
    catch (e) {
      console.error('加载帖子失败:', e);
      setLoadError(e instanceof Error ? e.message : '加载帖子失败');
    }
    finally { setLoading(false); }
  };

  const handleSelectPost = async (post: PostWithAuthor) => {
    setSelectedPost(post);
    try { setComments(await fetchComments(post.id) || []); } catch { }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !selectedPost) return;
    setSubmitting(true);
    try {
      const c = await createComment(selectedPost.id, commentText);
      setComments(prev => [...prev, c]);
      setCommentText('');
      setSelectedPost(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null);
    } catch { } finally { setSubmitting(false); }
  };

  const handleLike = async (postId: string) => {
    try {
      const r = await toggleLike(postId);
      const update = (p: PostWithAuthor) => p.id === postId ? { ...p, likes_count: r.liked ? p.likes_count + 1 : p.likes_count - 1, is_liked: r.liked } : p;
      setPosts(prev => prev.map(update));
      if (selectedPost?.id === postId) setSelectedPost(prev => prev ? update(prev) : null);
    } catch { }
  };

  /* 帖子详情视图 */
  if (selectedPost) {
    return (
      <div className="bg-background min-h-screen">
        <header className="sticky top-0 bg-surface-container/80 backdrop-blur-md z-30 px-4 md:px-8 h-16 flex items-center justify-between border-b border-outline-variant/10">
          <button onClick={() => setSelectedPost(null)} className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-bold text-sm"><ArrowLeft size={18} />返回论坛</button>
          <div className="flex items-center gap-4 text-on-surface-variant"><Bookmark size={20} /><MoreHorizontal size={20} /></div>
        </header>
        <article className="max-w-3xl mx-auto px-4 py-12 md:py-16">
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">{selectedPost.category}</span>
              <span className="text-on-surface-variant text-sm font-medium">{getReadTime(selectedPost.content)}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-on-surface leading-tight tracking-tight mb-8">{selectedPost.title}</h1>
            <div className="flex items-center gap-4">
              {/* 修复：替换空字符串为默认头像 */}
              <img
                src={selectedPost.author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedPost.author?.username || 'User'}`}
                alt=""
                className="w-12 h-12 rounded-full object-cover bg-surface-container"
              />
              <div>
                <div className="font-bold text-on-surface">{selectedPost.author?.username}</div>
                <div className="text-xs text-on-surface-variant">{formatDate(selectedPost.created_at)}</div>
              </div>
            </div>
          </header>
          <div className="prose max-w-none text-on-surface text-lg leading-relaxed space-y-8 mb-16 whitespace-pre-wrap">{selectedPost.content}</div>
          <div className="flex items-center gap-6 py-6 mb-12 border-t border-b border-outline-variant/10">
            <button onClick={() => handleLike(selectedPost.id)} className={`flex items-center gap-2 font-bold text-sm ${selectedPost.is_liked ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
              <ThumbsUp size={18} className={selectedPost.is_liked ? 'fill-primary' : ''} /><span>{selectedPost.likes_count}</span>
            </button>
            <div className="flex items-center gap-2 text-on-surface-variant font-bold text-sm"><MessageCircle size={18} /><span>{selectedPost.comments_count}</span></div>
            <div className="flex items-center gap-2 text-on-surface-variant font-bold text-sm ml-auto"><Eye size={18} /><span>{selectedPost.views_count}</span></div>
          </div>
          <section>
            <h2 className="text-2xl font-black text-on-surface mb-8">讨论区 ({comments.length})</h2>
            <div className="space-y-6 mb-8">
              {comments.map(c => (
                <div key={c.id} className="flex gap-4">
                  {/* 修复：替换空字符串为默认头像 */}
                  <img
                    src={c.author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${c.author?.username || 'CommentUser'}`}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover bg-surface-container flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-on-surface">{c.author?.username}</span>
                      <span className="text-[10px] text-outline">{formatDate(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-surface-container-low rounded-xl p-4">
              <textarea className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-outline p-0 mb-4" placeholder="分享您的观点..." rows={3} value={commentText} onChange={e => setCommentText(e.target.value)} />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button className="p-2 text-on-surface-variant hover:text-primary"><Smile size={20} /></button>
                  <button className="p-2 text-on-surface-variant hover:text-primary"><ImageIcon size={20} /></button>
                </div>
                <button onClick={handleComment} disabled={submitting || !commentText.trim()} className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold text-sm shadow-sm hover:opacity-90 disabled:opacity-50">
                  {submitting ? '发布中...' : '发布评论'}
                </button>
              </div>
            </div>
          </section>
        </article>
      </div>
    );
  }

  /* 帖子列表视图 */
  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 mb-10 items-start md:items-center">
        <div className="flex-1 relative group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={20} />
          <input className="w-full bg-surface-container-low border-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/15 rounded-xl py-4 pl-12 pr-4 text-sm font-medium transition-all shadow-sm" placeholder="搜索帖子..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadPosts(searchQuery)} />
        </div>
        <button onClick={() => onNavigate('new-post')} className="whitespace-nowrap bg-primary text-on-primary px-6 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all w-full md:w-auto"><Plus size={18} />发布内容</button>
      </div>
      {loading ? (
        <div className="space-y-6">{[1, 2, 3].map(i => <div key={i} className="bg-surface-container-lowest p-8 rounded-2xl animate-pulse"><div className="h-4 bg-surface-container rounded w-1/3 mb-4" /><div className="h-6 bg-surface-container rounded w-2/3 mb-3" /><div className="h-4 bg-surface-container rounded w-full" /></div>)}</div>
      ) : loadError ? (
        <div className="bg-surface-container-lowest border border-red-200 rounded-2xl p-10 text-center">
          <p className="font-bold text-red-600 mb-2">论坛内容加载失败</p>
          <p className="text-sm text-outline mb-6">{loadError}</p>
          <button onClick={() => loadPosts(searchQuery)} className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-all">
            重试加载
          </button>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-outline"><MessageCircle size={48} className="mx-auto mb-4 opacity-30" /><p className="font-bold">暂无帖子</p><p className="text-sm mt-2">快来发布第一篇帖子吧！</p></div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <motion.article key={post.id} whileHover={{ y: -2 }} onClick={() => handleSelectPost(post)} className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10 ring-1 ring-black/5 cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {/* 修复：替换空字符串为默认头像 */}
                  <img
                    src={post.author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.username || 'PostUser'}`}
                    alt=""
                    className="w-8 h-8 rounded-full bg-surface-container"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">{post.author?.username}</h4>
                    <p className="text-[10px] text-outline font-bold uppercase tracking-widest">{formatDate(post.created_at)}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{getReadTime(post.content)}</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center gap-6 pt-4 border-t border-outline-variant/10 font-bold text-[10px] uppercase tracking-widest text-outline">
                <div className="flex items-center gap-2"><ThumbsUp size={14} /> {post.likes_count}</div>
                <div className="flex items-center gap-2"><MessageCircle size={14} /> {post.comments_count}</div>
                <div className="ml-auto"><Bookmark size={14} /></div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
