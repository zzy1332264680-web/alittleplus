import React, { useState } from 'react';
import { 
  Shield, 
  Bell, 
  Lock, 
  Smartphone, 
  Paintbrush, 
  Languages, 
  Info, 
  ChevronRight, 
  ArrowLeft,
  X,
  RefreshCw,
  HelpCircle,
  CircleCheck,
  CheckCheck
} from '../components/Icons';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Language } from '../translations';

interface SettingsProps {
  onBack: () => void;
  onLogout: () => void;
}

type ModalType = 'language' | 'darkMode' | 'account' | 'privacy' | 'storage' | 'about' | 'logout' | null;

export default function Settings({ onBack, onLogout }: SettingsProps) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [notifications, setNotifications] = useState(true);

  const settingsGroups = [
    {
      title: t.settings.account,
      items: [
        { id: 'account', icon: Shield, label: t.settings.accountSecurity, sublabel: t.settings.protected, color: 'text-blue-500' },
      ]
    },
    {
      title: t.settings.general,
      items: [
        { id: 'notifications', icon: Bell, label: t.settings.notifications, color: 'text-green-500', isToggle: true, value: notifications, onToggle: () => setNotifications(!notifications) },
        { id: 'darkMode', icon: Paintbrush, label: t.settings.darkMode, sublabel: theme === 'system' ? t.settings.systemDefault : theme === 'light' ? '浅色' : '深色', color: 'text-purple-500' },
        { id: 'language', icon: Languages, label: t.settings.language, sublabel: language === 'zh' ? '简体中文' : language === 'ru' ? '俄语' : 'English', color: 'text-indigo-500' },
      ]
    },
    {
      title: t.settings.system,
      items: [
        { id: 'storage', icon: Smartphone, label: t.settings.storage, color: 'text-gray-500' },
        { id: 'about', icon: Info, label: t.settings.about, sublabel: t.settings.version, color: 'text-primary' },
        { id: 'help', icon: HelpCircle, label: t.settings.help, color: 'text-teal-500' },
      ]
    }
  ];

  const Modal = ({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="bg-surface-container-lowest w-full max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between bg-surface-container-low/50">
          <h3 className="text-sm font-black text-on-surface uppercase tracking-widest">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );

  const renderModalContent = () => {
    switch (activeModal) {
      case 'language':
        return (
          <div className="space-y-4">
            {(['zh', 'ru', 'en'] as Language[]).map((lang) => (
              <button 
                key={lang}
                onClick={() => { setLanguage(lang); setActiveModal(null); }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  language === lang 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-outline-variant/10 bg-surface-container-low text-on-surface hover:border-primary/30'
                }`}
              >
                <span className="font-bold">
                  {lang === 'zh' ? '简体中文' : lang === 'ru' ? '俄语' : 'English'}
                </span>
                {language === lang && <CheckCheck size={20} />}
              </button>
            ))}
          </div>
        );
      case 'darkMode':
        return (
          <div className="space-y-4">
            {(['system', 'light', 'dark'] as const).map((mode) => (
              <button 
                key={mode}
                onClick={() => { setTheme(mode); setActiveModal(null); }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  theme === mode 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-outline-variant/10 bg-surface-container-low text-on-surface hover:border-primary/30'
                }`}
              >
                <span className="font-bold">
                  {mode === 'system' ? t.settings.systemDefault : mode === 'light' ? '浅色' : '深色'}
                </span>
                {theme === mode && <CheckCheck size={20} />}
              </button>
            ))}
          </div>
        );
      case 'storage':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-outline uppercase">总空间</span>
                <span className="text-xs font-black text-on-surface uppercase">256 GB</span>
              </div>
              <div className="h-4 bg-surface-container rounded-full overflow-hidden flex shadow-inner">
                <div className="h-full bg-primary" style={{ width: '45%' }}></div>
                <div className="h-full bg-secondary" style={{ width: '15%' }}></div>
                <div className="h-full bg-tertiary" style={{ width: '10%' }}></div>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-[10px] font-bold text-outline">应用 (115GB)</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    <span className="text-[10px] font-bold text-outline">图片 (38GB)</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                    <span className="text-[10px] font-bold text-outline">缓存 (25GB)</span>
                 </div>
              </div>
            </div>
            <button className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold hover:opacity-90 transition-opacity">
              立即清理缓存
            </button>
          </div>
        );
      case 'about':
        return (
          <div className="flex flex-col items-center text-center space-y-6 py-4">
            <div className="w-20 h-20 rounded-3xl bg-primary-container flex items-center justify-center text-on-primary font-black text-2xl uppercase shadow-xl ring-4 ring-primary/5">
              AL
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-black text-on-surface">Alittle Financial</h4>
              <p className="text-sm font-bold text-outline uppercase tracking-widest">{t.settings.version}</p>
            </div>
            <p className="text-sm text-outline font-medium leading-relaxed">
              Alittle 致力于为您提供最极致的数字资产管理体验。每一行代码都承载着我们对完美的追求。
            </p>
            <div className="w-full space-y-2 pt-4">
              <button className="w-full p-4 bg-surface-container-low rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container transition-colors">服务协议</button>
              <button className="w-full p-4 bg-surface-container-low rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container transition-colors">隐私政策</button>
            </div>
          </div>
        );
      case 'logout':
        return (
          <div className="space-y-6">
            <p className="text-lg font-bold text-on-surface text-center">
              {t.settings.confirmLogout}
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveModal(null)}
                className="flex-1 py-4 bg-surface-container rounded-xl font-bold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                {t.settings.cancel}
              </button>
              <button 
                onClick={onLogout}
                className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                {t.settings.confirm}
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <RefreshCw size={32} className="text-primary animate-spin-slow" />
            <p className="text-sm font-bold text-outline">正在为您准备设置项...</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <header className="sticky top-0 bg-surface-container/80 backdrop-blur-md z-30 px-4 md:px-8 h-16 flex items-center justify-between border-b border-outline-variant/10">
        <button 
          onClick={onBack}
          className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 font-bold text-sm"
        >
          <ArrowLeft size={18} />
          {t.settings.back}
        </button>
        <h1 className="text-sm font-black text-on-surface uppercase tracking-widest">{t.settings.title}</h1>
        <div className="w-18"></div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {settingsGroups.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <h2 className="text-[10px] font-black text-outline uppercase tracking-widest px-4">{group.title}</h2>
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
              {group.items.map((item, itemIdx) => (
                <button 
                  key={itemIdx}
                  onClick={item.isToggle ? item.onToggle : () => setActiveModal(item.id as ModalType)}
                  className={`w-full flex items-center gap-4 p-4 hover:bg-surface-container-low transition-colors group ${
                    itemIdx !== group.items.length - 1 ? 'border-b border-outline-variant/5' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center ${item.color}`}>
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-on-surface">{item.label}</p>
                    {item.sublabel && (
                      <p className="text-[10px] text-outline font-black uppercase tracking-widest">{item.sublabel}</p>
                    )}
                  </div>
                  
                  {item.isToggle ? (
                    <div className="flex items-center">
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                        item.value ? 'bg-primary' : 'bg-surface-container-high'
                      }`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          item.value ? 'translate-x-6' : 'translate-x-0'
                        }`}></div>
                      </div>
                    </div>
                  ) : (
                    <ChevronRight size={18} className="text-outline group-hover:text-primary transition-colors" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4">
          <button 
            onClick={() => setActiveModal('logout')}
            className="w-full bg-surface-container-lowest text-red-500 font-bold py-4 rounded-2xl border border-outline-variant/10 shadow-sm hover:bg-red-50 transition-colors"
          >
            {t.settings.logout}
          </button>
        </div>

        <div className="flex flex-col items-center gap-2 py-8 grayscale opacity-50">
          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary font-black text-xs uppercase">
            AL
          </div>
          <p className="text-[10px] text-outline font-black uppercase tracking-widest">Alittle Financial</p>
        </div>
      </main>

      <AnimatePresence>
        {activeModal && (
          <Modal 
            title={
              activeModal === 'logout' ? t.settings.logout : 
              settingsGroups.flatMap(g => g.items).find(i => i.id === activeModal)?.label || ''
            }
            onClose={() => setActiveModal(null)}
          >
            {renderModalContent()}
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
