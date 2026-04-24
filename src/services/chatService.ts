/**
 * 功能：聊天服务层
 * 直接通过 Supabase 访问会话和消息数据，并使用 Realtime 订阅
 */
import { supabase } from '../lib/supabase';
import { ConversationItem, MessageWithSender } from '../types';

/**
 * 功能：获取当前用户的会话列表
 * 返回：会话列表（含对方用户信息和最后消息）
 */
export function fetchConversations(): Promise<ConversationItem[]> {
  return (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    const { data: participations, error: partError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', user.id);

    if (partError) throw new Error(partError.message);
    if (!participations?.length) return [];

    const conversationIds = participations.map(item => item.conversation_id);
    const { data: otherParticipants, error: otherError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user:profiles!user_id(id, username, avatar_url)')
      .in('conversation_id', conversationIds)
      .neq('user_id', user.id);

    if (otherError) throw new Error(otherError.message);

    const conversations = await Promise.all(conversationIds.map(async (conversationId) => {
      const [{ data: lastMsg, error: lastError }, { count: unreadCount, error: unreadError }] = await Promise.all([
        supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id)
          .gt('created_at', participations.find(item => item.conversation_id === conversationId)?.last_read_at || '1970-01-01'),
      ]);

      if (lastError) throw new Error(lastError.message);
      if (unreadError) throw new Error(unreadError.message);

      const participantData = otherParticipants?.find(item => item.conversation_id === conversationId)?.user;
      const participant = Array.isArray(participantData) ? participantData[0] : participantData;

      return {
        id: conversationId,
        participant: participant || { id: '', username: '未知用户', avatar_url: '' },
        last_message: lastMsg?.content || '',
        last_message_time: lastMsg?.created_at || '',
        unread_count: unreadCount || 0,
      };
    }));

    conversations.sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());
    return conversations;
  })();
}

/**
 * 功能：获取指定会话的消息历史
 * 参数：
 *     conversationId: 会话ID
 *     limit: 消息数量限制
 * 返回：消息列表
 */
export function fetchMessages(conversationId: string, limit = 50): Promise<MessageWithSender[]> {
  return (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!sender_id(id, username, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw new Error(error.message);

    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);

    return data || [];
  })();
}

/**
 * 功能：发送消息
 * 参数：
 *     conversationId: 会话ID
 *     content: 消息内容
 * 返回：创建的消息
 */
export function sendMessage(conversationId: string, content: string): Promise<MessageWithSender> {
  return (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: user.id, content })
      .select('*, sender:profiles!sender_id(id, username, avatar_url)')
      .single();

    if (error) throw new Error(error.message);
    return data;
  })();
}

/**
 * 功能：创建新会话
 * 参数：
 *     participantId: 对方用户ID
 * 返回：会话ID及是否为已有会话
 */
export function createConversation(participantId: string): Promise<{ id: string; existing: boolean }> {
  return (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    const { data: myParticipations, error: myError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (myError) throw new Error(myError.message);

    if (myParticipations?.length) {
      const conversationIds = myParticipations.map(item => item.conversation_id);
      const { data: existing, error: existingError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', participantId)
        .in('conversation_id', conversationIds)
        .maybeSingle();

      if (existingError) throw new Error(existingError.message);
      if (existing) return { id: existing.conversation_id, existing: true };
    }

    const { data: conversation, error: convError } = await supabase.from('conversations').insert({}).select().single();
    if (convError) throw new Error(convError.message);

    const { error: partError } = await supabase.from('conversation_participants').insert([
      { conversation_id: conversation.id, user_id: user.id },
      { conversation_id: conversation.id, user_id: participantId },
    ]);

    if (partError) throw new Error(partError.message);
    return { id: conversation.id, existing: false };
  })();
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
