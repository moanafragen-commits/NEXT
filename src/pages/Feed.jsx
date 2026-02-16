import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import FeedPostCard from '@/components/feed/FeedPostCard';
import FeedCommentSheet from '@/components/feed/FeedCommentSheet';
import BottomNav from '@/components/navigation/BottomNav';
import NextHeader from '@/components/navigation/NextHeader';
import TrendingSidebar from '@/components/feed/TrendingSidebar';
import GenerateFeedButton from '@/components/feed/GenerateFeedButton';
import { Button } from '@/components/ui/button';
import { createNotification } from '@/components/notifications/NotificationHelper';

export default function Feed() {
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50)
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list()
  });

  const { data: allMessages = [] } = useQuery({
    queryKey: ['all-messages-feed'],
    queryFn: () => base44.entities.ChatMessage.list('-created_date', 100)
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments'],
    queryFn: () => base44.entities.Comment.list('-created_date', 500)
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['likes'],
    queryFn: () => base44.entities.PostLike.list()
  });

  const { data: weatherStates = [] } = useQuery({
    queryKey: ['weather-feed'],
    queryFn: () => base44.entities.WeatherState.filter({ user_email: user?.email }),
    enabled: !!user
  });

  const weatherState = weatherStates[0] || null;

  const getCharacter = (id) => characters.find(c => c.id === id);
  const hasLiked = (postId) => likes.some(l => l.post_id === postId && l.user_email === user?.email);
  const getPostComments = (postId) => comments.filter(c => c.post_id === postId);

  const likeMutation = useMutation({
    mutationFn: async (postId) => {
      const existingLike = likes.find(l => l.post_id === postId && l.user_email === user?.email);
      if (existingLike) {
        await base44.entities.PostLike.delete(existingLike.id);
        const post = posts.find(p => p.id === postId);
        await base44.entities.Post.update(postId, { likes_count: Math.max(0, (post.likes_count || 1) - 1) });
      } else {
        await base44.entities.PostLike.create({ post_id: postId, user_email: user?.email });
        const post = posts.find(p => p.id === postId);
        await base44.entities.Post.update(postId, { likes_count: (post.likes_count || 0) + 1 });
        // Notify post owner
        if (post.created_by && post.created_by !== user?.email) {
          const char = getCharacter(post.character_id);
          createNotification({
            recipientEmail: post.created_by,
            type: 'like',
            actorName: user?.display_name || user?.full_name || 'Jemand',
            actorAvatar: user?.avatar_url || '',
            actorUsername: '@' + (user?.display_name || user?.full_name || 'user').toLowerCase().replace(/\s+/g, '_'),
            postId: post.id,
            postPreview: post.content
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['likes'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: async ({ postId, content }) => {
      await base44.entities.Comment.create({ post_id: postId, user_email: user?.email, content });
      const post = posts.find(p => p.id === postId);
      await base44.entities.Post.update(postId, { comments_count: (post.comments_count || 0) + 1 });
      // Notify post owner
      if (post.created_by && post.created_by !== user?.email) {
        createNotification({
          recipientEmail: post.created_by,
          type: 'comment',
          actorName: user?.display_name || user?.full_name || 'Jemand',
          actorAvatar: user?.avatar_url || '',
          actorUsername: '@' + (user?.display_name || user?.full_name || 'user').toLowerCase().replace(/\s+/g, '_'),
          postId: post.id,
          postPreview: content
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    }
  });

  const openPost = openCommentsPostId ? posts.find(p => p.id === openCommentsPostId) : null;
  const activeChars = characters.filter(c => !c.is_archived && !c.is_blocked);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white auto-theme">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-white/[0.06] auto-theme-header">
        <div className="flex items-center justify-between px-4 py-3">
          <NextHeader />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['posts'] })}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto pb-20 relative z-[1]">
        {/* Generate Feed Button */}
        <GenerateFeedButton
          characters={activeChars}
          messages={allMessages}
          weatherState={weatherState}
          userEmail={user?.email}
          onGenerated={() => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['likes'] });
            queryClient.invalidateQueries({ queryKey: ['comments'] });
          }}
        />

        {/* Trending Topics */}
        <div className="px-4 py-3">
          <TrendingSidebar />
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 px-6">
            <p className="text-gray-400 text-lg mb-2">Noch keine Posts</p>
            <p className="text-gray-600 text-sm">Tippe auf "Feed generieren" um KI-Posts zu erstellen</p>
          </div>
        ) : (
          <div>
            {posts.map((post) => {
              const character = getCharacter(post.character_id);
              const displayChar = character || {
                id: post.character_id,
                name: 'Unbekannt',
                avatar_url: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${post.character_id}`,
                category: 'Andere'
              };

              return (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  character={displayChar}
                  isLiked={hasLiked(post.id)}
                  onLike={() => likeMutation.mutate(post.id)}
                  onOpenComments={() => setOpenCommentsPostId(post.id)}
                  commentsCount={post.comments_count || 0}
                  allCharacters={characters}
                  currentUser={user}
                />
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {openPost && (
          <FeedCommentSheet
            post={openPost}
            character={getCharacter(openPost.character_id)}
            comments={getPostComments(openPost.id)}
            user={user}
            onClose={() => setOpenCommentsPostId(null)}
            onSubmitComment={(content) => commentMutation.mutate({ postId: openPost.id, content })}
            isSubmitting={commentMutation.isPending}
          />
        )}
      </AnimatePresence>

      <BottomNav user={user} />
    </div>
  );
}