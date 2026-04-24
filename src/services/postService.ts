/**
 * 功能：帖子服务层
 * 封装论坛帖子相关的所有 API 调用
 */
import { get, post, put, del } from './api';
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
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);
  return get(`/posts?${query.toString()}`);
}

/**
 * 功能：获取帖子详情
 * 参数：
 *     id: 帖子ID
 * 返回：帖子详情（含作者信息和是否已点赞）
 */
export function fetchPost(id: string): Promise<PostWithAuthor & { is_liked: boolean }> {
  return get(`/posts/${id}`);
}

/**
 * 功能：创建帖子
 * 参数：
 *     data: 帖子数据
 * 返回：创建的帖子
 */
export function createPost(data: { title: string; content: string; excerpt?: string; category?: string; visibility?: string }): Promise<PostWithAuthor> {
  return post('/posts', data);
}

/**
 * 功能：更新帖子
 * 参数：
 *     id: 帖子ID
 *     data: 更新数据
 * 返回：更新后的帖子
 */
export function updatePost(id: string, data: Partial<PostWithAuthor>): Promise<PostWithAuthor> {
  return put(`/posts/${id}`, data);
}

/**
 * 功能：删除帖子
 * 参数：
 *     id: 帖子ID
 */
export function deletePost(id: string): Promise<{ message: string }> {
  return del(`/posts/${id}`);
}

/**
 * 功能：切换帖子点赞状态
 * 参数：
 *     id: 帖子ID
 * 返回：当前点赞状态
 */
export function toggleLike(id: string): Promise<{ liked: boolean }> {
  return post(`/posts/${id}/like`, {});
}

/**
 * 功能：获取帖子评论列表
 * 参数：
 *     postId: 帖子ID
 * 返回：评论列表
 */
export function fetchComments(postId: string): Promise<CommentWithAuthor[]> {
  return get(`/posts/${postId}/comments`);
}

/**
 * 功能：发表评论
 * 参数：
 *     postId: 帖子ID
 *     content: 评论内容
 * 返回：创建的评论
 */
export function createComment(postId: string, content: string): Promise<CommentWithAuthor> {
  return post(`/posts/${postId}/comments`, { content });
}
