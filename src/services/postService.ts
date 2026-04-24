/**
 * 功能：帖子服务层
 * 直接通过 Supabase 访问论坛帖子相关数据
 */
import { supabase } from '../lib/supabase';
import { PostWithAuthor, CommentWithAuthor } from '../types';

interface PostListResponse {
  data: PostWithAuthor[];
  total: number;
}

/**
 * 功能：获取帖子列表
 * 参数：
 *     params: 分页和搜索参数
 * 返回：帖子列表和总数
 */
export function fetchPosts(params?: { page?: number; limit?: number; search?: string; category?: string }): Promise<PostListResponse> {
  return (async () => {
    const limit = params?.limit ?? 20;
    const page = params?.page ?? 1;
    const offset = (page - 1) * limit;
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
      .from('posts')
      .select('*, author:profiles!author_id(id, username, email, avatar_url)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,content.ilike.%${params.search}%`);
    }

    if (params?.category) {
      query = query.eq('category', params.category);
    }

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);

    let likedIds = new Set<string>();
    if (user && data?.length) {
      const { data: likes, error: likesError } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', data.map(post => post.id));

      if (likesError) throw new Error(likesError.message);
      likedIds = new Set((likes || []).map(item => item.post_id));
    }

    return {
      data: (data || []).map(post => ({ ...post, is_liked: likedIds.has(post.id) })),
      total: count || 0,
    };
  })();
}

/**
 * 功能：获取帖子详情
 * 参数：
 *     id: 帖子ID
 * 返回：帖子详情（含作者信息和是否已点赞）
 */
export function fetchPost(id: string): Promise<PostWithAuthor & { is_liked: boolean }> {
  return (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('posts')
      .select('*, author:profiles!author_id(id, username, email, avatar_url)')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);

    let isLiked = false;
    if (user) {
      const { data: likeData, error: likeError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (likeError) throw new Error(likeError.message);
      isLiked = !!likeData;
    }

    supabase
      .from('posts')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', id)
      .then();

    return { ...data, is_liked: isLiked };
  })();
}

/**
 * 功能：创建帖子
 * 参数：
 *     data: 帖子数据
 * 返回：创建的帖子
 */
export function createPost(data: { title: string; content: string; excerpt?: string; category?: string; visibility?: string }): Promise<PostWithAuthor> {
  return (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    const autoExcerpt = data.excerpt || data.content.substring(0, 100) + (data.content.length > 100 ? '...' : '');
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        title: data.title,
        content: data.content,
        excerpt: autoExcerpt,
        category: data.category || '其他',
        visibility: data.visibility || 'public',
      })
      .select('*, author:profiles!author_id(id, username, email, avatar_url)')
      .single();

    if (error) throw new Error(error.message);
    return post;
  })();
}

/**
 * 功能：更新帖子
 * 参数：
 *     id: 帖子ID
 *     data: 更新数据
 * 返回：更新后的帖子
 */
export function updatePost(id: string, data: Partial<PostWithAuthor>): Promise<PostWithAuthor> {
  return (async () => {
    const { data: post, error } = await supabase
      .from('posts')
      .update(data)
      .eq('id', id)
      .select('*, author:profiles!author_id(id, username, email, avatar_url)')
      .single();

    if (error) throw new Error(error.message);
    return post;
  })();
}

/**
 * 功能：删除帖子
 * 参数：
 *     id: 帖子ID
 */
export function deletePost(id: string): Promise<{ message: string }> {
  return (async () => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { message: '帖子已删除' };
  })();
}

/**
 * 功能：切换帖子点赞状态
 * 参数：
 *     id: 帖子ID
 * 返回：当前点赞状态
 */
export function toggleLike(id: string): Promise<{ liked: boolean }> {
  return (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    const { data: existing, error: existingError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingError) throw new Error(existingError.message);

    if (existing) {
      const { error } = await supabase.from('post_likes').delete().eq('id', existing.id);
      if (error) throw new Error(error.message);
      return { liked: false };
    }

    const { error } = await supabase.from('post_likes').insert({ post_id: id, user_id: user.id });
    if (error) throw new Error(error.message);
    return { liked: true };
  })();
}

/**
 * 功能：获取帖子评论列表
 * 参数：
 *     postId: 帖子ID
 * 返回：评论列表
 */
export function fetchComments(postId: string): Promise<CommentWithAuthor[]> {
  return (async () => {
    const { data, error } = await supabase
      .from('post_comments')
      .select('*, author:profiles!author_id(id, username, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  })();
}

/**
 * 功能：发表评论
 * 参数：
 *     postId: 帖子ID
 *     content: 评论内容
 * 返回：创建的评论
 */
export function createComment(postId: string, content: string): Promise<CommentWithAuthor> {
  return (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('请先登录');

    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, author_id: user.id, content })
      .select('*, author:profiles!author_id(id, username, avatar_url)')
      .single();

    if (error) throw new Error(error.message);
    return data;
  })();
}
