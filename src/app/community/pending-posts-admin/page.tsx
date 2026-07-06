"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CommunityApi } from "@/services/api/communityApi";
import { AuthApi } from "@/services/api";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { CommunityPostCompact } from "@/components/data-elements/DataTableRowElements";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import { SectionHeader } from "@/components/page-content/SectionHeader";
import CommunityPostDetailModal from "@/components/modals/CommunityPostDetailModal";
import { ArrowLeft } from "lucide-react";

function PendingPostsAdminContent() {
    const router = useRouter();
    const { openNotificationPopUpMessage, showLoadingContent } = useGlobalUI();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [loadingPostId, setLoadingPostId] = useState<string | null>(null);
    const [isPostDetailModalOpen, setIsPostDetailModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

    // Get current user
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId;
    const currentUserRole = authResponse?.data?.userRole;

    // Fetch pending posts
    const { data: postsData, isLoading, isError, refetch } = CommunityApi.useGetPendingPostsRQ({
        page,
        limit
    });

    const posts = postsData?.data?.results || [];
    const total = postsData?.data?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Mutations
    const activateMutation = CommunityApi.useActivatePostRQ(
        (responseData) => {
            setLoadingPostId(null);
            if (responseData.status === "success") {
                finishWithMessage("Post approved successfully");
                refetch();
            } else {
                finishWithMessage("Failed to approve post");
            }
        },
        () => {
            setLoadingPostId(null);
            finishWithMessage("Failed to approve post");
        }
    );

    const deactivateMutation = CommunityApi.useDeactivatePostRQ(
        (responseData) => {
            setLoadingPostId(null);
            if (responseData.status === "success") {
                finishWithMessage("Post deactivated successfully");
                refetch();
            } else {
                finishWithMessage("Failed to deactivate post");
            }
        },
        () => {
            setLoadingPostId(null);
            finishWithMessage("Failed to deactivate post");
        }
    );

    const handleActivate = (postId: string) => {
        setLoadingPostId(postId);
        showLoadingContent(true);
        activateMutation.mutate(postId);
    };

    const handleDeactivate = (postId: string) => {
        setLoadingPostId(postId);
        showLoadingContent(true);
        deactivateMutation.mutate(postId);
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

    const finishWithMessage = (message: string) => {
        showLoadingContent(false);
        openNotificationPopUpMessage(message);
    }

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated || currentUserRole !== 'MASTER_ADMIN') {
            router.push('/community');
        }
    }, [isAuthenticated, router, currentUserRole]);

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
                            <span className="text-2xl font-bold" style={{color: 'var(--theme-yellow)'}}>
                                {total}
                            </span>
                            <span className="text-sm" style={{color: 'var(--theme-text-muted)'}}>
                                Pending Review
                            </span>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20">
                        <p className="text-xl" style={{color: 'var(--theme-teal)'}}>Loading pending posts...</p>
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <div className="flex justify-center items-center py-20">
                        <p className="text-xl" style={{color: 'var(--theme-red)'}}>
                            Failed to load pending posts. Please try again.
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
                                isAdmin={true}
                                isLoadingAction={loadingPostId === post.id}
                                onActivate={handleActivate}
                                onDeactivate={handleDeactivate}
                                onViewPost={handleViewPost}
                            />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && posts.length === 0 && (
                    <div className="flex flex-col justify-center items-center py-20 space-y-4">
                        <span className="text-6xl">✅</span>
                        <p className="text-xl" style={{color: 'var(--theme-text-muted)'}}>
                            All caught up! No pending posts to review.
                        </p>
                        <button
                            onClick={() => router.push('/community')}
                            className="px-6 py-3 rounded hover:scale-105 transition-all"
                            style={{backgroundColor: 'var(--theme-teal)', color: 'white'}}
                        >
                            View Community Posts
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && !isError && totalPages > 1 && (
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

export default function PendingPostsAdminPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <PendingPostsAdminContent />
        </Suspense>
    );
}
