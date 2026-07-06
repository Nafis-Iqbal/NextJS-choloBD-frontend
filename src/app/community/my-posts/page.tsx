"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CommunityApi } from "@/services/api/communityApi";
import { AuthApi } from "@/services/api";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { CommunityPostCompact } from "@/components/data-elements/DataTableRowElements";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import { SectionHeader } from "@/components/page-content/SectionHeader";
import CommunityPostDetailModal from "@/components/modals/CommunityPostDetailModal";
import {Role} from "@/types/enums";

function MyPostsContent() {
    const router = useRouter();
    const { openNotificationPopUpMessage, showLoadingContent } = useGlobalUI();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [isPostDetailModalOpen, setIsPostDetailModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

    // Get current user
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId;

    // Fetch my posts
    const { data: postsData, isLoading, isError, refetch } = CommunityApi.useGetMyPostsRQ({
        page,
        limit
    });

    const posts = postsData?.data?.results || [];
    const total = postsData?.data?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Mutations
    const deactivatePostMutation = CommunityApi.useDeactivatePostRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Post deactivated successfully");
                refetch();
            } else {
                finishWithMessage("Failed to deactivate post");
            }
        },
        () => {
            finishWithMessage("Failed to deactivate post");
        }
    );

    const reactMutation = CommunityApi.useReactToPostRQ(
        (responseData) => {
            if (responseData.status === "success") {
                finishWithMessage("Reaction added successfully");
                refetch();
            } else {
                finishWithMessage("Failed to react to post");
            }
        },
        () => {
            finishWithMessage("Failed to react to post");
        }
    );

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    }

    const handleReact = (postId: string, reactionType: 'WOW') => {
        showLoadingContent(true);
        reactMutation.mutate({ postId, reactionType });
    };

    const handlePostDeactivate = (postId: string) => {
        showLoadingContent(true);
        deactivatePostMutation.mutate(postId);
    };

    const handleViewPost = (postId: string) => {
        const post = posts.find((p: CommunityPost) => p.id === postId);
        if (post) {
            setSelectedPost(post);
            setIsPostDetailModalOpen(true);
        }
    };

    const handleClosePostDetailModal = () => {
        setIsPostDetailModalOpen(false);
        setSelectedPost(null);
    };

    const handlePreviousPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="flex items-start gap-4">
                <SectionHeader
                    title="My Community Posts"
                    subtitle="Manage your community posts and drafts"
                />

                <button
                    onClick={() => router.push('/community')}
                    className="md:hidden p-2 rounded hover:scale-110 transition-all flex-shrink-0 mt-2"
                    style={{backgroundColor: 'var(--theme-deep-green)', color: 'white'}}
                    title="Back to community"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
            </div>
            
            <div className="flex flex-col max-w-6xl mx-auto font-sans mt-6">
                {/* Header */}
                <div className="hidden md:flex justify-end mb-6">
                    <button
                        onClick={() => router.push('/community')}
                        className="px-4 py-2 rounded hover:scale-105 transition-all"
                        style={{backgroundColor: 'var(--theme-deep-green)', color: 'white'}}
                    >
                        Back to Community
                    </button>
                </div>

                {/* Stats Summary */}
                {!isLoading && !isError && (
                    <div 
                        className="flex flex-wrap gap-4 p-4 rounded-lg mb-6"
                        style={{backgroundColor: 'var(--theme-section-bg)', border: '1px solid var(--theme-deep-green)'}}
                    >
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold" style={{color: 'var(--theme-teal)'}}>
                                {total}
                            </span>
                            <span className="text-sm" style={{color: 'var(--theme-text-muted)'}}>
                                Total Posts
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold" style={{color: 'var(--theme-green)'}}>
                                {posts.filter((p: CommunityPost) => p.isActive).length}
                            </span>
                            <span className="text-sm" style={{color: 'var(--theme-text-muted)'}}>
                                Active
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold" style={{color: 'var(--theme-yellow)'}}>
                                {posts.filter((p: CommunityPost) => !p.isActive).length}
                            </span>
                            <span className="text-sm" style={{color: 'var(--theme-text-muted)'}}>
                                Drafts
                            </span>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20">
                        <p className="text-xl" style={{color: 'var(--theme-teal)'}}>Loading your posts...</p>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="flex justify-center items-center py-20">
                        <p className="text-xl" style={{color: 'var(--theme-red)'}}>
                            Failed to load posts. Please try again.
                        </p>
                    </div>
                )}

                {/* Posts List */}
                {!isLoading && !isError && posts.length > 0 && (
                    <div className="space-y-4">
                        {posts.map((post: CommunityPost) => (
                            <CommunityPostCompact
                                key={post.id}
                                post={post}
                                currentUserId={currentUserId}
                                onReact={handleReact}
                                onDeactivate={handlePostDeactivate}
                                onViewPost={handleViewPost}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && posts.length === 0 && (
                    <div className="flex flex-col justify-center items-center py-20 space-y-4">
                        <p className="text-xl" style={{color: 'var(--theme-text-muted)'}}>
                            You haven't created any posts yet.
                        </p>
                        <button
                            onClick={() => router.push('/community')}
                            className="px-6 py-3 rounded hover:scale-105 transition-all"
                            style={{backgroundColor: 'var(--theme-teal)', color: 'white'}}
                        >
                            Create Your First Post
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && !isError && (
                    <div className="flex justify-center items-center space-x-4 mt-8 mb-4">
                        <button
                            onClick={handlePreviousPage}
                            disabled={page === 1}
                            className="px-4 py-2 rounded hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{backgroundColor: 'var(--theme-deep-green)', color: 'white'}}
                        >
                            Previous
                        </button>
                        <span style={{color: 'var(--theme-text)'}}>
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{backgroundColor: 'var(--theme-deep-green)', color: 'white'}}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Post Detail Modal */}
            <CommunityPostDetailModal
                isVisible={isPostDetailModalOpen}
                caption={selectedPost?.caption || ""}
                images={selectedPost?.images || []}
                onCancel={handleClosePostDetailModal}
            />
        </div>
    );
}

export default function MyPostsPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <MyPostsContent />
        </Suspense>
    );
}
