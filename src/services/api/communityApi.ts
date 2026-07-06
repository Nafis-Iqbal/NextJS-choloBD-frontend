/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiFetch } from "../apiInstance";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ── Post CRUD ─────────────────────────────────────────────────────────────

/**
 * Get paginated list of active posts (public route)
 */
export async function getActivePosts(params?: {
  userTripPlanId?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.userTripPlanId) searchParams.set('userTripPlanId', params.userTripPlanId);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const queryString = searchParams.toString();
  const response = await apiFetch<ApiResponse<CommunityPostsListResponse>>(
    `/community/posts${queryString ? `?${queryString}` : ''}`,
    { method: 'GET' }
  );
  return response;
}

export function useGetActivePostsRQ(params?: {
  userTripPlanId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<ApiResponse<CommunityPostsListResponse>>({
    queryFn: () => getActivePosts(params),
    queryKey: ['communityPosts', 'active', params],
    staleTime: 30_000,
    gcTime: 30 * 1000,
  });
}

/**
 * Get my posts (both draft and active)
 */
export async function getMyPosts(params?: {
  userTripPlanId?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.userTripPlanId) searchParams.set('userTripPlanId', params.userTripPlanId);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const queryString = searchParams.toString();
  const response = await apiFetch<ApiResponse<CommunityPostsListResponse>>(
    `/community/posts/my-posts${queryString ? `?${queryString}` : ''}`,
    { method: 'GET' }
  );
  return response;
}

export function useGetMyPostsRQ(params?: {
  userTripPlanId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<ApiResponse<CommunityPostsListResponse>>({
    queryFn: () => getMyPosts(params),
    queryKey: ['communityPosts', 'my-posts', params],
    staleTime: 10_000,
    gcTime: 30 * 1000,
  });
}

/**
 * Get pending posts (admin only)
 */
export async function getPendingPosts(params?: {
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  const queryString = searchParams.toString();
  const response = await apiFetch<ApiResponse<CommunityPostsListResponse>>(
    `/community/posts/pending${queryString ? `?${queryString}` : ''}`,
    { method: 'GET' }
  );
  return response;
}

export function useGetPendingPostsRQ(params?: {
  page?: number;
  limit?: number;
}) {
  return useQuery<ApiResponse<CommunityPostsListResponse>>({
    queryFn: () => getPendingPosts(params),
    queryKey: ['communityPosts', 'pending', params],
    staleTime: 5_000,
    gcTime: 30 * 1000,
  });
}

/**
 * Get single post by ID
 */
export async function getPostById(postId: string) {
  const response = await apiFetch<ApiResponse<CommunityPost>>(
    `/community/posts/${postId}`,
    { method: 'GET' }
  );
  return response;
}

export function useGetPostByIdRQ(postId: string, enabled: boolean = true) {
  return useQuery<ApiResponse<CommunityPost>>({
    queryFn: () => getPostById(postId),
    queryKey: ['communityPost', postId],
    staleTime: 30_000,
    gcTime: 30 * 1000,
    enabled,
  });
}

/**
 * Create a new draft post
 */
export async function createPost(data: { caption?: string }) {
  const response = await apiFetch<ApiResponse<CommunityPost>>(
    '/community/posts',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return response;
}

export function useCreatePostRQ(onSuccessFn?: (data: ApiResponse<CommunityPost>) => void, onErrorFn?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts', 'my'] });
      onSuccessFn?.(data);
    },
    onError: () => {
      onErrorFn?.();
    }
  });
}

/**
 * Update post images only
 */
export async function updatePost(postId: string, data: { images: Array<{ url: string; order: number }> }) {
  const response = await apiFetch<ApiResponse<CommunityPost>>(
    `/community/posts/${postId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
  return response;
}

export function useUpdatePostRQ(onSuccessFn?: (data: ApiResponse<CommunityPost>) => void, onErrorFn?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, images }: { postId: string; images: Array<{ url: string; order: number }> }) =>
      updatePost(postId, { images }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['communityPost'] });
      onSuccessFn?.(data);
    },
    onError: () => {
      onErrorFn?.();
    }
  });
}

// ── Tags ──────────────────────────────────────────────────────────────────

/**
 * Tag a user in a post
 */
export async function tagUser(postId: string, taggedUserId: string) {
  const response = await apiFetch<ApiResponse<CommunityPostTag>>(
    `/community/posts/${postId}/tags`,
    {
      method: 'POST',
      body: JSON.stringify({ taggedUserId }),
    }
  );
  return response;
}

export function useTagUserRQ(onSuccessFn?: (data: ApiResponse<CommunityPostTag>) => void, onErrorFn?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, taggedUserId }: { postId: string; taggedUserId: string }) =>
      tagUser(postId, taggedUserId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['communityPost'] });
      onSuccessFn?.(data);
    },
    onError: () => {
      onErrorFn?.();
    }
  });
}

/**
 * Remove a tag from a post
 */
export async function removeTag(postId: string, taggedUserId: string) {
  const response = await apiFetch<ApiResponse<void>>(
    `/community/posts/${postId}/tags/${taggedUserId}`,
    { method: 'DELETE' }
  );
  return response;
}

export function useRemoveTagRQ(onSuccessFn?: () => void, onErrorFn?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, taggedUserId }: { postId: string; taggedUserId: string }) =>
      removeTag(postId, taggedUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['communityPost'] });
      onSuccessFn?.();
    },
    onError: () => {
      onErrorFn?.();
    }
  });
}

/**
 * Respond to a tag (accept/decline)
 */
export async function respondToTag(postId: string, response: 'ACCEPTED' | 'DECLINED') {
  const responseData = await apiFetch<ApiResponse<CommunityPostTag>>(
    `/community/posts/${postId}/tags/respond`,
    {
      method: 'PUT',
      body: JSON.stringify({ response }),
    }
  );
  return responseData;
}

export function useRespondToTagRQ(onSuccessFn?: (data: ApiResponse<CommunityPostTag>) => void, onErrorFn?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, response }: { postId: string; response: 'ACCEPTED' | 'DECLINED' }) =>
      respondToTag(postId, response),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['communityPost'] });
      onSuccessFn?.(data);
    },
    onError: () => {
      onErrorFn?.();
    }
  });
}

// ── Reactions ─────────────────────────────────────────────────────────────

/**
 * React to a post (WOW only), works as toggle
 */
export async function reactToPost(postId: string, reactionType: 'WOW') {
  const response = await apiFetch<ApiResponse<{ wowCount: number; mehCount: number }>>(
    `/community/posts/${postId}/react`,
    {
      method: 'POST',
      body: JSON.stringify({ reactionType }),
    }
  );
  return response;
}

export function useReactToPostRQ(onSuccessFn?: (data: ApiResponse<{ wowCount: number; mehCount: number }>) => void, onErrorFn?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, reactionType }: { postId: string; reactionType: 'WOW'}) =>
      reactToPost(postId, reactionType),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['communityPost'] });
      onSuccessFn?.(data);
    },
    onError: () => {
      onErrorFn?.();
    }
  });
}

// ── Admin Actions ─────────────────────────────────────────────────────────

/**
 * Activate a post (admin only)
 */
export async function activatePost(postId: string) {
  const response = await apiFetch<ApiResponse<CommunityPost>>(
    `/community/posts/${postId}/activate`,
    { method: 'PUT' }
  );
  return response;
}

export function useActivatePostRQ(onSuccessFn?: (data: ApiResponse<CommunityPost>) => void, onErrorFn?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activatePost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['communityPost'] });
      onSuccessFn?.(data);
    },
    onError: () => {
      onErrorFn?.();
    }
  });
}

/**
 * Deactivate a post \
 */
export async function deactivatePost(postId: string) {
  const response = await apiFetch<ApiResponse<CommunityPost>>(
    `/community/posts/${postId}/deactivate`,
    { method: 'PUT' }
  );
  return response;
}

export function useDeactivatePostRQ(onSuccessFn?: (data: ApiResponse<CommunityPost>) => void, onErrorFn?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivatePost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      queryClient.invalidateQueries({ queryKey: ['communityPost'] });
      onSuccessFn?.(data);
    },
    onError: () => {
      onErrorFn?.();
    }
  });
}

export const CommunityApi = {
  useGetActivePostsRQ,
  useGetMyPostsRQ,
  useGetPendingPostsRQ,
  useGetPostByIdRQ,
  useCreatePostRQ,
  useUpdatePostRQ,
  useTagUserRQ,
  useRemoveTagRQ,
  useRespondToTagRQ,
  useReactToPostRQ,
  useActivatePostRQ,
  useDeactivatePostRQ,
};