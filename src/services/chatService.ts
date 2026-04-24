/**
 * 功能：聊天服务层
 * 封装会话和消息的 API 调用，以及 Supabase Realtime 订阅
 */
import { get, post } from './api';
import { supabase } from '../lib/supabase';
import { ConversationItem, MessageWithSender } from '../types';

/**
 * 功能：获取当前用户的会话列表
 * 返回：会话列表（含对方用户信息和最后消息）
 */
export function fetchConversations(): Promise<ConversationItem[]> {
  return get('/conversations');
}

/**
 * 功能：获取指定会话的消息历史
 * 参数：
 *     conversationId: 会话ID
 *     limit: 消息数量限制
 * 返回：消息列表
 */
export function fetchMessages(conversationId: string, limit = 50): Promise<MessageWithSender[]> {
  return get(`/conversations/${conversationId}/messages?limit=${limit}`);
}

/**
 * 功能：发送消息
 * 参数：
 *     conversationId: 会话ID
 *     content: 消息内容
 * 返回：创建的消息
 */
export function sendMessage(conversationId: string, content: string): Promise<MessageWithSender> {
  return post(`/conversations/${conversationId}/messages`, { content });
}

/**
 * 功能：创建新会话
 * 参数：
 *     participantId: 对方用户ID
 * 返回：会话ID及是否为已有会话
 */
export function createConversation(participantId: string): Promise<{ id: string; existing: boolean }> {
  return post('/conversations', { participantId });
}

/**
 * 功能：订阅会话的实时消息
 * 利用 Supabase Realtime 监听 messages 表的新插入记录
 * 参数：
 *     conversationId: 会话ID
 *     onNewMessage: 收到新消息时的回调函数
 * 返回：取消订阅的函数
 */
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: any) => void
): () => void {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onNewMessage(payload.new);
      }
    )
    .subscribe();

  /* 返回取消订阅的清理函数 */
  return () => {
    supabase.removeChannel(channel);
  };
}
