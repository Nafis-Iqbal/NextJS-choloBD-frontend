"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CommunityApi } from "@/services/api/communityApi";
import { AuthApi } from "@/services/api";
import { CommunityPostCard } from "@/components/data-elements/DataTableRowElements";
import {HeroSectionFull} from "@/components/modular-components/HeroSectionFull";
import SuspenseFallback from "@/components/page-content/SuspenseFallback";
import {SectionHeader} from "@/components/page-content/SectionHeader";
import CommunityPostCreateModal from "@/components/modals/CommunityPostCreateModal";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, ClipboardList } from "lucide-react";

function CommunityPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const { openNotificationPopUpMessage } = useGlobalUI();
    
    // Scroll tracking for sticky action buttons (small screens only)
    const [isActionBarSticky, setIsActionBarSticky] = useState(false);
    const actionBarRef = useRef<HTMLDivElement>(null);
    const actionBarContainerRef = useRef<HTMLDivElement>(null);

    // Get current user
    const { data: authResponse } = AuthApi.useGetUserAuthenticationRQ(true);
    const isAuthenticated = authResponse?.data?.isAuthenticated || false;
    const currentUserId = authResponse?.data?.userId;
    const currentUserRole = authResponse?.data?.userRole;

    // Fetch active posts
    const { data: postsData, isLoading, isError, refetch } = CommunityApi.useGetActivePostsRQ({
        page,
        limit
    });

    const posts = postsData?.data?.results || [];
    const total = postsData?.data?.total || 0;
    const totalPages = Math.ceil(total / limit);
    const hasMorePosts = page < totalPages;
    const isLastPage = page === totalPages;

    // Reaction mutations
    const reactMutation = CommunityApi.useReactToPostRQ(
        () => {
            refetch();
        },
        () => {
            openNotificationPopUpMessage("Failed to react to post");
        }
    );

    const handleReact = (postId: string, reactionType: 'WOW') => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        reactMutation.mutate({ postId, reactionType });
    };

    const handleLoadOlderPosts = () => {
        if (page > 1) {
            setIsLoadingMore(true);
            setPage(page - 1);
            setTimeout(() => setIsLoadingMore(false), 500);
        }
    };

    const handleLoadMorePosts = () => {
        if (hasMorePosts) {
            setIsLoadingMore(true);
            setPage(page + 1);
            setTimeout(() => setIsLoadingMore(false), 500);
        }
    };

    const handleRefresh = () => {
        refetch();
    };

    const handleOpenCreateModal = () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        // Refetch posts to show the newly created one
        refetch();
    };

    // Extract images from first 5 posts
    const heroImages = posts.slice(0, 5).flatMap(post => 
        post.images?.map(image => ({
            imageURL: image.url,
            imageStyle: 'object-cover object-center'
        })) || []
    );
    console.log(posts, heroImages);

    // Scroll tracking for sticky action bar (small screens only)
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerWidth >= 768) {
                // Only apply sticky behavior on small screens (below md breakpoint)
                setIsActionBarSticky(false);
                return;
            }

            if (actionBarRef.current && actionBarContainerRef.current) {
                const barRect = actionBarRef.current.getBoundingClientRect();
                const containerRect = actionBarContainerRef.current.getBoundingClientRect();
                
                // Check if action bar is approaching the navbar (trigger earlier to account for navbar height)
                const NAVBAR_OFFSET = 500; // Trigger sticky earlier to account for navbar
                const shouldBeSticky = barRect.top <= NAVBAR_OFFSET && containerRect.top < 0;
                
                setIsActionBarSticky(shouldBeSticky);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen">
            <HeroSectionFull
                className="h-[50vh] md:h-[70vh] border-b"
                imageList={heroImages}
                titleText="Every journey tells a story"
                titleTextStyle="text-red-500"
            />

            {/* Create Post Modal */}
            <CommunityPostCreateModal
                isVisible={isCreateModalOpen}
                onClose={handleCloseCreateModal}
            />

            {/* Header */}
            <SectionHeader
                title="Community Posts"
                subtitle="Explore travel moments shared by our community"
                className="mt-10 md:mt-15 mb-6"
            />

            <div className="max-w-7xl mx-auto flex flex-col space-y-4 md:space-y-8 p-4 md:p-8 font-sans">
                {/* Action Buttons Container with Scroll Tracking */}
                <div ref={actionBarContainerRef}>
                    {/* Sticky Action Bar - Only on small screens */}
                    <motion.div
                        ref={actionBarRef}
                        className={`
                            md:static
                            ${isActionBarSticky 
                                ? 'fixed md:static left-0 right-0 top-12 z-40 md:z-auto px-4 py-3 backdrop-blur-sm' 
                                : 'mb-8'
                            }
                        `}
                        style={isActionBarSticky ? {
                            backgroundColor: 'transparent',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        } : {}}
                    >
                        {/* Action Buttons - Beautified with Icons */}
                        <div className="flex items-center gap-1 flex-wrap text-xs md:text-base">
                            {isAuthenticated && (
                                <button
                                    onClick={() => router.push('/community/my-posts')}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                                    style={{
                                        backgroundColor: 'var(--theme-teal)',
                                        color: 'var(--theme-black)'
                                    }}
                                >
                                    <BookOpen size={18} />
                                    <span>My Posts</span>
                                </button>
                            )}
                            {isAuthenticated && (
                                <button
                                    onClick={handleOpenCreateModal}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                                    style={{
                                        backgroundColor: 'var(--theme-teal)',
                                        color: 'var(--theme-black)'
                                    }}
                                >
                                    <Plus size={18} />
                                    <span>Create Post</span>
                                </button>
                            )}
                            {currentUserRole === 'MASTER_ADMIN' && (
                                <button
                                    onClick={() => router.push('/community/pending-posts-admin')}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                                    style={{
                                        backgroundColor: 'var(--theme-teal)',
                                        color: 'var(--theme-black)'
                                    }}
                                >
                                    <ClipboardList size={18} />
                                    <span>Pending Posts</span>
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Spacer when action bar is sticky */}
                    {isActionBarSticky && (
                        <div className="md:hidden h-[48px]" />
                    )}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20">
                        <p className="text-xl" style={{color: 'var(--theme-teal)'}}>Loading posts...</p>
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
                    <div className="space-y-6">
                        {/* Load Older Posts Button */}
                        {page > 1 && (
                            <motion.button
                                onClick={handleLoadOlderPosts}
                                disabled={isLoadingMore}
                                className="w-full py-3 rounded-lg font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{backgroundColor: 'var(--theme-deep-green)', color: 'var(--theme-text)'}}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isLoadingMore ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                                        />
                                        <span>Loading older posts...</span>
                                    </>
                                ) : (
                                    <span>↑ Load Older Posts</span>
                                )}
                            </motion.button>
                        )}

                        {/* Posts */}
                        {posts.map((post: CommunityPost) => (
                            <CommunityPostCard
                                key={post.id}
                                post={post}
                                currentUserId={currentUserId}
                                userHasReacted={post.userHasReacted}
                                isAdmin={currentUserRole === 'MASTER_ADMIN'}
                                onReact={handleReact}
                            />
                        ))}

                        {/* Load More / Refresh Button */}
                        <div className="flex gap-3 justify-center mt-8">
                            {hasMorePosts ? (
                                <motion.button
                                    onClick={handleLoadMorePosts}
                                    disabled={isLoadingMore || isLoading}
                                    className="px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[200px]"
                                    style={{backgroundColor: 'var(--theme-teal)', color: 'var(--theme-black)'}}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isLoadingMore || isLoading ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                                            />
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        <span>↓ Load More Posts</span>
                                    )}
                                </motion.button>
                            ) : (
                                <motion.button
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                    className="px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[200px]"
                                    style={{backgroundColor: 'var(--theme-yellow)', color: 'var(--theme-black)'}}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isLoading ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                                            />
                                            <span>Refreshing...</span>
                                        </>
                                    ) : (
                                        <span>🔄 Refresh</span>
                                    )}
                                </motion.button>
                            )}
                        </div>

                        {/* Posts Count Info */}
                        <div className="text-center py-4">
                            <p className="text-sm" style={{color: 'var(--theme-text-muted)'}}>
                                Showing {posts.length} of {total} posts
                            </p>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !isError && posts.length === 0 && (
                    <div className="flex flex-col justify-center items-center py-20 space-y-4">
                        <p className="text-xl" style={{color: 'var(--theme-text-muted)'}}>
                            No posts yet. Be the first to share your travel moments!
                        </p>
                        {isAuthenticated && (
                            <button
                                onClick={handleOpenCreateModal}
                                className="px-6 py-3 rounded hover:scale-105 transition-all"
                                style={{backgroundColor: 'var(--theme-teal)', color: 'var(--theme-black)'}}
                            >
                                Create Your First Post
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CommunityPage() {
    return (
        <Suspense fallback={<SuspenseFallback />}>
            <CommunityPageContent />
        </Suspense>
    );
}