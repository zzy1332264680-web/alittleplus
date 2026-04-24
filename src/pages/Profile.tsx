import React, { useState, useEffect, useRef } from 'react';
import { Page, PostWithAuthor, ProductWithSeller } from '../types';
import { Camera, ThumbsUp, MessageCircle, Bookmark, MapPin, Clock, Star } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { fetchMyProfile, updateProfile, fetchMyPosts, fetchMyProducts, uploadAvatar } from '../services/profileService';
import { fetchFavorites } from '../services/favoriteService';
import { motion } from 'motion/react';

interface ProfileProps {
  onNavigate: (page: Page) => void;
  isEditing?: boolean;
}

/** 功能：格式化时间 */
function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Profile({ onNavigate, isEditing }: ProfileProps) {
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'market' | 'post-favorites' | 'market-favorites'>('posts');
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [favPosts, setFavPosts] = useState<any[]>([]);
  const [favProducts, setFavProducts] = useState<any[]>([]);
  const [editUsername, setEditUsername] = useState(profile?.username || '');
  const [editBio, setEditBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEditUsername(profile?.username || '');
    setEditBio(profile?.bio || '');
  }, [profile]);

  useEffect(() => { loadTabData(); }, [activeTab]);

  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'posts') { setMyPosts(await fetchMyPosts()); }
      else if (activeTab === 'market') { setMyProducts(await fetchMyProducts()); }
      else if (activeTab === 'post-favorites') {
        const favs = await fetchFavorites('post');
        setFavPosts(favs.filter(f => f.item).map(f => f.item));
      } else if (activeTab === 'market-favorites') {
        const favs = await fetchFavorites('product');
        setFavProducts(favs.filter(f => f.item).map(f => f.item));
      }
    } catch { } finally { setLoading(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const url = await uploadAvatar(file, user.id);
      await updateProfile({ avatar_url: url });
      await refreshProfile();
    } catch (err) { console.error('头像上传失败:', err); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ username: editUsername, bio: editBio });
      await refreshProfile();
      onNavigate('profile');
    } catch { } finally { setSaving(false); }
  };

  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.username || 'U'}`;

  /* 编辑资料视图 */
  if (isEditing) {
    return (
      <div className="p-6 md:p-12 max-w-3xl mx-auto">
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        <div className="bg-surface-container-lowest rounded-2xl p-8 md:p-12 shadow-sm border border-outline-variant/10">
          <div className="mb-12 border-b border-outline-variant/10 pb-6">
            <h1 className="text-3xl font-black text-on-surface tracking-tight">编辑个人资料</h1>
            <p className="text-on-surface-variant font-medium mt-2">更新您的公众形象和联系方式。</p>
          </div>
          <form className="space-y-10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-28 h-28 rounded-full bg-surface-container-high overflow-hidden group cursor-pointer border-4 border-surface-container-lowest shadow-sm" onClick={() => fileInputRef.current?.click()}>
                <img className="w-full h-full object-cover" src={avatarUrl} alt="" />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"><Camera size={28} className="text-white" /></div>
              </div>
              <div className="flex flex-col gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-surface-container-high text-primary px-5 py-2 rounded-lg font-bold text-sm hover:bg-surface-container-low transition-colors inline-flex w-fit">上传新头像</button>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">推荐尺寸: 400x400px. 最大文件: 2MB.</p>
              </div>
            </div>
            <div className="space-y-8">
              <div><label className="block text-[10px] font-black text-outline uppercase tracking-widest mb-2">昵称</label><input className="w-full bg-surface-container-low text-on-surface p-4 rounded-xl border-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all font-bold text-lg" value={editUsername} onChange={e => setEditUsername(e.target.value)} /></div>
              <div className="relative opacity-70"><label className="block text-[10px] font-black text-outline uppercase tracking-widest mb-2">注册邮箱 (不可更改)</label><input className="w-full bg-surface-container-high text-on-surface p-4 rounded-xl border-none cursor-not-allowed font-semibold text-lg" readOnly value={profile?.email || ''} /></div>
              <div><label className="block text-[10px] font-black text-outline uppercase tracking-widest mb-2">个人简介</label><textarea className="w-full bg-surface-container-low text-on-surface p-4 rounded-xl border-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all font-medium text-base resize-none" rows={4} value={editBio} onChange={e => setEditBio(e.target.value)} /></div>
            </div>
            <div className="pt-8 mt-8 border-t border-outline-variant/10 flex justify-end gap-4">
              <button type="button" onClick={() => onNavigate('profile')} className="px-6 py-3 rounded-xl font-bold text-primary hover:bg-surface-container-low transition-colors underline decoration-2 underline-offset-4">取消</button>
              <button type="button" onClick={handleSave} disabled={saving} className="px-8 py-3 rounded-xl font-bold text-on-primary bg-gradient-to-r from-primary to-primary-container shadow-md hover:shadow-lg transition-all disabled:opacity-50">{saving ? '保存中...' : '保存更改'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* 个人资料视图 */
  const tabItems = (activeTab === 'posts' ? myPosts : activeTab === 'market' ? myProducts : activeTab === 'post-favorites' ? favPosts : favProducts);
  const isPostTab = activeTab === 'posts' || activeTab === 'post-favorites';

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="relative mb-6 group cursor-pointer" onClick={() => onNavigate('edit-profile')}>
          <img src={avatarUrl} alt="头像" className="w-32 h-32 rounded-full object-cover ring-4 ring-surface-container-high p-1 shadow-xl transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={24} className="text-white" /></div>
        </div>
        <h1 onClick={() => onNavigate('edit-profile')} className="text-3xl font-black text-on-surface mb-2 tracking-tight cursor-pointer hover:text-primary transition-colors">{profile?.username || '用户'}</h1>
        <p onClick={() => onNavigate('edit-profile')} className="text-on-surface-variant font-medium max-w-lg text-lg mb-6 cursor-pointer hover:text-on-surface transition-colors">{profile?.bio || '点击编辑个人简介'}</p>
        <div className="flex gap-4">
          <button onClick={() => onNavigate('edit-profile')} className="bg-primary text-on-primary px-8 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-primary/20 hover:scale-105 transition-all">编辑个人资料</button>
          <button className="bg-surface-container-high text-primary px-8 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all">分享名片</button>
        </div>
      </div>

      <div className="flex justify-center flex-wrap gap-4 md:gap-12 mb-12 border-b border-outline-variant/10">
        {[{ id: 'posts', label: '发帖内容' }, { id: 'market', label: '发布闲置' }, { id: 'post-favorites', label: '帖子收藏' }, { id: 'market-favorites', label: '闲置收藏' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`font-black pb-4 px-2 text-sm uppercase tracking-widest transition-all ${activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-outline hover:text-on-surface'}`}>{tab.label}</button>
        ))}
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">{[1, 2].map(i => <div key={i} className="bg-surface-container-lowest p-8 rounded-2xl animate-pulse"><div className="h-6 bg-surface-container rounded w-2/3 mb-3" /><div className="h-4 bg-surface-container rounded w-full" /></div>)}</div>
        ) : tabItems.length === 0 ? (
          <div className="bg-surface-container-lowest/50 rounded-3xl p-20 border border-dashed border-outline-variant/20 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4"><Star size={32} /></div>
            <p className="text-sm font-bold text-outline uppercase tracking-widest">暂无内容</p>
          </div>
        ) : isPostTab ? tabItems.map((post: any) => (
          <article key={post.id} className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10 cursor-pointer hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-on-surface hover:text-primary transition-colors">{post.title}</h2>
              <span className="text-[10px] font-bold text-outline whitespace-nowrap ml-4 uppercase tracking-widest">{formatDate(post.created_at)}</span>
            </div>
            <p className="text-on-surface-variant text-sm font-medium leading-relaxed mb-6 line-clamp-2">{post.excerpt}</p>
            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-outline">
              <div className="flex items-center gap-2"><ThumbsUp size={14} /> {post.likes_count}</div>
              <div className="flex items-center gap-2"><MessageCircle size={14} /> {post.comments_count}</div>
              <div className="ml-auto"><Bookmark size={14} /></div>
            </div>
          </article>
        )) : tabItems.map((product: any) => (
          <div key={product.id} className="bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-outline-variant/10 flex gap-6 cursor-pointer hover:border-primary/20 transition-all">
            <div className="w-40 h-40 rounded-xl overflow-hidden flex-shrink-0"><img src={product.images?.[0] || 'https://via.placeholder.com/160'} alt={product.name} className="w-full h-full object-cover" /></div>
            <div className="flex-1 flex flex-col py-2">
              <div className="flex justify-between items-start mb-2"><h3 className="text-lg font-bold text-on-surface">{product.name}</h3><span className="text-xl font-black text-primary">¥{product.price?.toLocaleString()}</span></div>
              <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 font-medium">{product.description}</p>
              <div className="mt-auto flex items-center gap-4 text-[10px] font-bold text-outline uppercase tracking-widest">
                <div className="flex items-center gap-1.5"><MapPin size={12} /> {product.location}</div>
                <div className="flex items-center gap-1.5"><Clock size={12} /> {formatDate(product.created_at)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}