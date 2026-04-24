import React, { useState, useRef } from 'react';
import { X, Camera, Tag, MapPin, Package, ChevronRight, ArrowRight } from '../components/Icons';
import { createProduct, uploadProductImage } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';

interface NewMarketPostProps {
  onBack: () => void;
}

export default function NewMarketPost({ onBack }: NewMarketPostProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<{ file?: File; url: string }[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('数码产品');
  const [condition, setCondition] = useState('全新');
  const [location, setLocation] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isConditionOpen, setIsConditionOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['数码产品', '穿搭', '食品', '家具', '家电', '图书音像', '居家日用', '其他'];
  const conditions = ['全新', '轻微使用', '正常使用', '重度使用'];

  /** 功能：处理图片选择 */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 修复：明确声明文件类型，解决最后一个报错
    const files: File[] = Array.from(e.target.files || []);
    const newImages = files.slice(0, 9 - images.length).map(file => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  /** 功能：提交商品 */
  const handleSubmit = async () => {
    if (!name.trim()) { setError('商品名称不能为空'); return; }
    if (!price) { setError('价格不能为空'); return; }
    setLoading(true);
    setError('');
    try {
      /* 上传所有图片到 Supabase Storage */
      const imageUrls: string[] = [];
      for (const img of images) {
        if (img.file) {
          const url = await uploadProductImage(img.file, user!.id);
          imageUrls.push(url);
        }
      }
      await createProduct({
        name, description, price: Number(price),
        original_price: Number(originalPrice) || 0,
        category, condition, location,
        images: imageUrls,
      });
      onBack();
    } catch (e: any) {
      setError(e.message || '发布失败');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-32">
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
      <header className="sticky top-0 bg-surface-container/80 backdrop-blur-md z-50 px-4 md:px-8 h-16 flex items-center justify-between border-b border-outline-variant/10">
        <button onClick={onBack} className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-bold text-sm"><X size={20} />取消发布</button>
        <h1 className="text-sm font-black text-on-surface uppercase tracking-widest">发布闲置</h1>
        <div className="w-20"></div>
      </header>

      <main className="max-w-2xl mx-auto w-full p-4 md:p-8 space-y-8">
        {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">{error}</div>}

        {/* 图片上传 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-outline uppercase tracking-widest">上传图片 (最多9张)</h2>
            <span className="text-[10px] font-bold text-primary">{images.length}/9</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="aspect-square relative rounded-xl overflow-hidden bg-surface-container shadow-sm border border-outline-variant/10">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"><X size={12} /></button>
              </div>
            ))}
            {images.length < 9 && (
              <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-2 text-outline hover:border-primary hover:text-primary transition-all group">
                <Camera size={24} className="group-hover:scale-110 transition-transform" /><span className="text-[10px] font-bold uppercase">添加图片</span>
              </button>
            )}
          </div>
        </section>

        {/* 表单 */}
        <section className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">商品标题</label>
            <input className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-4 text-on-surface focus:ring-1 focus:ring-primary/20 transition-all font-bold" placeholder="品牌型号，如：Sony A7M4 99新国行" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">详细描述</label>
            <textarea className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-4 text-on-surface focus:ring-1 focus:ring-primary/20 transition-all font-medium min-h-[150px] resize-none" placeholder="商品的使用时间、成色、配件情况等..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">价格</label>
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">¥</span><input type="number" className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl pl-8 pr-4 py-4 text-on-surface focus:ring-1 focus:ring-primary/20 font-black text-lg" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-outline uppercase tracking-widest ml-1">原价</label>
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline font-bold">¥</span><input type="number" className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl pl-8 pr-4 py-4 text-on-surface focus:ring-1 focus:ring-primary/20 font-bold text-lg text-outline" placeholder="0.00" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} /></div>
            </div>
          </div>
        </section>

        {/* 选项 */}
        <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
          <div className="relative">
            <button onClick={() => setIsCategoryOpen(!isCategoryOpen)} className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors border-b border-outline-variant/5">
              <div className="flex items-center gap-3"><Package size={18} className="text-primary" /><span className="text-sm font-bold text-on-surface">分类</span></div>
              <div className="flex items-center gap-2"><span className="text-xs font-medium text-outline">{category}</span><ChevronRight size={16} className={`text-outline transition-transform ${isCategoryOpen ? 'rotate-90' : ''}`} /></div>
            </button>
            {isCategoryOpen && <div className="bg-surface-container-high/30 p-2 grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-outline-variant/5">{categories.map(cat => <button key={cat} onClick={() => { setCategory(cat); setIsCategoryOpen(false); }} className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${category === cat ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-primary/10'}`}>{cat}</button>)}</div>}
          </div>
          <div className="relative">
            <button onClick={() => setIsConditionOpen(!isConditionOpen)} className="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors border-b border-outline-variant/5">
              <div className="flex items-center gap-3"><Tag size={18} className="text-tertiary" /><span className="text-sm font-bold text-on-surface">成色</span></div>
              <div className="flex items-center gap-2"><span className="text-xs font-medium text-outline">{condition}</span><ChevronRight size={16} className={`text-outline transition-transform ${isConditionOpen ? 'rotate-90' : ''}`} /></div>
            </button>
            {isConditionOpen && <div className="bg-surface-container-high/30 p-2 grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-outline-variant/5">{conditions.map(c => <button key={c} onClick={() => { setCondition(c); setIsConditionOpen(false); }} className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all ${condition === c ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-primary/10'}`}>{c}</button>)}</div>}
          </div>
          <div className="w-full flex items-center gap-3 p-4">
            <MapPin size={18} className="text-secondary shrink-0" /><span className="text-sm font-bold text-on-surface shrink-0">所在地</span>
            <input value={location} onChange={e => setLocation(e.target.value)} className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-on-surface-variant text-right p-0" placeholder="请输入所在城市" />
          </div>
        </section>
      </main>

      <div className="sticky bottom-0 left-0 w-full p-4 bg-background/95 backdrop-blur-xl border-t border-outline-variant/10 z-40 mt-auto">
        <div className="max-w-2xl mx-auto flex gap-4">
          <button onClick={onBack} className="flex-1 px-6 py-4 rounded-xl font-bold text-primary hover:bg-surface-container transition-all">取消</button>
          <button onClick={handleSubmit} disabled={loading} className="flex-[2] bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex justify-center items-center gap-2 disabled:opacity-50">
            {loading ? '发布中...' : '确认发布'}<ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}