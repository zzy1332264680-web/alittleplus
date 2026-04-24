/**
 * 功能：聊天相关路由
 * 提供会话管理和消息发送功能
 */
import { Router, Request, Response } from 'express';
import { createAuthenticatedClient } from '../supabaseClient.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/conversations
 * 功能：获取当前用户的所有会话列表，包含对方用户信息和最后一条消息
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthenticatedClient(req.accessToken!);

    /* 获取当前用户参与的所有会话ID */
    const { data: participations, error: pError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', req.userId!);

    if (pError || !participations?.length) {
      res.json([]);
      return;
    }

    const conversationIds = participations.map(p => p.conversation_id);

    /* 获取会话中对方的信息 */
    const { data: otherParticipants } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user:profiles!user_id(id, username, avatar_url)')
      .in('conversation_id', conversationIds)
      .neq('user_id', req.userId!);

    /* 获取每个会话的最新消息 */
    const conversations = await Promise.all(
      conversationIds.map(async (convId) => {
        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        /* 统计未读消息数 */
        const participation = participations.find(p => p.conversation_id === convId);
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', convId)
          .neq('sender_id', req.userId!)
          .gt('created_at', participation?.last_read_at || '1970-01-01');

        const otherUser = otherParticipants?.find(p => p.conversation_id === convId);

        return {
          id: convId,
          participant: otherUser?.user || { id: '', username: '未知用户', avatar_url: '' },
          last_message: lastMsg?.content || '',
          last_message_time: lastMsg?.created_at || '',
          unread_count: unreadCount || 0,
        };
      })
    );

    /* 按最后消息时间排序 */
    conversations.sort((a, b) =>
      new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
    );

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: '获取会话列表时出错' });
  }
});

/**
 * GET /api/conversations/:id/messages
 * 功能：获取指定会话的消息列表
 */
router.get('/:id/messages', authMiddleware, async (req: Request, res: Response) => {
  const { limit = '50', before = '' } = req.query;

  try {
    const supabase = createAuthenticatedClient(req.accessToken!);

    let query = supabase
      .from('messages')
      .select('*, sender:profiles!sender_id(id, username, avatar_url)')
      .eq('conversation_id', req.params.id)
      .order('created_at', { ascending: true })
      .limit(Number(limit));

    if (before) {
      query = query.lt('created_at', before as string);
    }

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    /* 更新用户的最后阅读时间 */
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', req.params.id)
      .eq('user_id', req.userId!);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: '获取消息记录时出错' });
  }
});

/**
 * POST /api/conversations/:id/messages
 * 功能：在指定会话中发送消息
 */
router.post('/:id/messages', authMiddleware, async (req: Request, res: Response) => {
  const { content } = req.body;

  if (!content) {
    res.status(400).json({ message: '消息内容不能为空' });
    return;
  }

  try {
    const supabase = createAuthenticatedClient(req.accessToken!);
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: req.params.id,
        sender_id: req.userId,
        content,
      })
      .select('*, sender:profiles!sender_id(id, username, avatar_url)')
      .single();

    if (error) {
      res.status(500).json({ message: error.message });
      return;
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: '发送消息时出错' });
  }
});

/**
 * POST /api/conversations
 * 功能：创建新会话（私聊）
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { participantId } = req.body;

  if (!participantId) {
    res.status(400).json({ message: '缺少对话参与者ID' });
    return;
  }

  try {
    const supabase = createAuthenticatedClient(req.accessToken!);

    /* 检查是否已有与该用户的会话 */
    const { data: existingParticipations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', req.userId!);

    if (existingParticipations?.length) {
      const convIds = existingParticipations.map(p => p.conversation_id);
      const { data: otherParticipation } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', participantId)
        .in('conversation_id', convIds)
        .maybeSingle();

      if (otherParticipation) {
        res.json({ id: otherParticipation.conversation_id, existing: true });
        return;
      }
    }

    /* 创建新会话 */
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (convError) {
      res.status(500).json({ message: convError.message });
      return;
    }

    /* 添加两个参与者 */
    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conversation.id, user_id: req.userId },
        { conversation_id: conversation.id, user_id: participantId },
      ]);

    if (partError) {
      res.status(500).json({ message: partError.message });
      return;
    }

    res.status(201).json({ id: conversation.id, existing: false });
  } catch (err) {
    res.status(500).json({ message: '创建会话时出错' });
  }
});

export default router;
