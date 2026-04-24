import { useState, useEffect, useRef } from 'react';
import { ConversationItem, MessageWithSender } from '../types';
import { fetchConversations, fetchMessages, sendMessage, subscribeToMessages } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import { Search, MoreVertical, Send, Paperclip, CheckCheck, MessageSquare } from '../components/Icons';

/** 功能：格式化消息时间 */
function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

export default function Chat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConv, setSelectedConv] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* 加载会话列表 */
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try { setConversations(await fetchConversations()); }
    catch (e) { console.error('加载会话失败:', e); }
    finally { setLoading(false); }
  };

  /* 选中会话时加载消息并订阅实时更新 */
  useEffect(() => {
    if (!selectedConv) return;
    let unsubscribe: (() => void) | undefined;

    const init = async () => {
      try {
        const msgs = await fetchMessages(selectedConv.id);
        setMessages(msgs || []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      } catch {}

      /* 订阅 Supabase Realtime 实时消息 */
      unsubscribe = subscribeToMessages(selectedConv.id, (newMsg) => {
        if (newMsg.sender_id !== user?.id) {
          setMessages(prev => [...prev, newMsg]);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      });
    };

    init();
    return () => { unsubscribe?.(); };
  }, [selectedConv?.id, user?.id]);

  /* 发送消息 */
  const handleSend = async () => {
    if (!messageText.trim() || !selectedConv) return;
    const text = messageText;
    setMessageText('');
    try {
      const msg = await sendMessage(selectedConv.id, text);
      setMessages(prev => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch { setMessageText(text); }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* 联系人列表 */}
      <aside className="hidden md:flex flex-col w-80 bg-surface-container-low border-r border-outline-variant/10 h-full flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-black text-on-surface mb-4">消息</h2>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
            <input className="w-full bg-surface border-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary/15 rounded-lg py-2 pl-10 pr-3 text-xs font-medium transition-all" placeholder="搜索联系人..." />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1">
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />)}</div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-outline text-sm">暂无会话</div>
          ) : conversations.map(conv => (
            <button key={conv.id} onClick={() => setSelectedConv(conv)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${selectedConv?.id === conv.id ? 'bg-surface-container-lowest shadow-sm ring-1 ring-black/5' : 'hover:bg-surface'}`}>
              <div className="relative flex-shrink-0">
                <img src={conv.participant?.avatar_url || ''} alt="" className="w-12 h-12 rounded-full object-cover bg-surface-container" />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface-container-low bg-green-500" />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-bold text-sm text-on-surface truncate">{conv.participant?.username}</h3>
                  <span className="text-[10px] text-outline font-bold">{formatTime(conv.last_message_time)}</span>
                </div>
                <p className="text-xs truncate text-on-surface-variant">{conv.last_message}</p>
              </div>
              {conv.unread_count > 0 && <div className="bg-primary text-on-primary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">{conv.unread_count}</div>}
            </button>
          ))}
        </div>
      </aside>

      {/* 聊天窗口 */}
      <section className="flex-1 flex flex-col bg-background">
        {selectedConv ? (
          <>
            <header className="h-16 bg-surface-container-lowest flex items-center px-6 border-b border-outline-variant/10 justify-between">
              <div className="flex items-center gap-4">
                <img src={selectedConv.participant?.avatar_url || ''} alt="" className="w-10 h-10 rounded-full object-cover bg-surface-container" />
                <div>
                  <h2 className="font-bold text-on-surface text-sm">{selectedConv.participant?.username}</h2>
                  <p className="text-[10px] text-on-surface-variant font-bold flex items-center gap-1 uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />在线</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-outline hover:text-primary"><Search size={20} /></button>
                <button className="p-2 text-outline hover:text-primary"><MoreVertical size={20} /></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map(msg => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end ml-auto' : 'items-start'} max-w-[80%]`}>
                    <div className={`p-4 rounded-2xl ${isMe ? 'bg-primary text-on-primary rounded-br-sm shadow-md shadow-primary/10' : 'bg-surface-container-lowest text-on-surface rounded-bl-sm shadow-sm border border-outline-variant/10'}`}>
                      <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                    </div>
                    <div className={`text-[10px] font-bold mt-1.5 flex items-center gap-1 uppercase tracking-widest text-outline ${isMe ? 'mr-1' : 'ml-1'}`}>
                      {formatTime(msg.created_at)}{isMe && <CheckCheck size={12} className="text-primary" />}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/10">
              <div className="flex items-end gap-2 bg-surface-container-low rounded-xl p-2 border border-transparent focus-within:border-primary/20 focus-within:bg-surface-container-lowest transition-all">
                <button className="p-2 text-outline hover:text-primary"><Paperclip size={20} /></button>
                <textarea className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium placeholder:text-outline p-2 min-h-[40px] max-h-32 resize-none" placeholder="输入消息..." rows={1} value={messageText} onChange={e => setMessageText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}} />
                <button onClick={handleSend} className="p-2 bg-primary text-on-primary rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all"><Send size={18} /></button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-outline gap-4">
            <MessageSquare size={64} className="opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">选择一个联系人开始聊天</p>
          </div>
        )}
      </section>
    </div>
  );
}
