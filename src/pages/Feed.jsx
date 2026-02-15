import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AnimatePresence } from 'framer-motion';
import FeedPostCard from '@/components/feed/FeedPostCard';
import FeedCommentSheet from '@/components/feed/FeedCommentSheet';
import GeneratePostButton from '@/components/feed/GeneratePostButton';
import StatusCircle from '@/components/status/StatusCircle';

export default function Feed() {
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: posts = [], isLoading, isFetching } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50)
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list()
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments'],
    queryFn: () => base44.entities.Comment.list('-created_date', 500)
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['likes'],
    queryFn: () => base44.entities.PostLike.list()
  });

  const { data: statuses = [] } = useQuery({
    queryKey: ['statuses'],
    queryFn: async () => {
      const now = new Date();
      const all = await base44.entities.CharacterStatus.filter({}, '-created_date', 100);
      return all.filter(s => new Date(s.expires_at) > now);
    }
  });

  const { data: statusViews = [] } = useQuery({
    queryKey: ['status-views', user?.email],
    queryFn: () => base44.entities.StatusView.filter({ user_email: user.email }),
    enabled: !!user
  });

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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    }
  });

  const openPost = openCommentsPostId ? posts.find(p => p.id === openCommentsPostId) : null;

  // Characters with active statuses for the story bar
  const charactersWithStatuses = characters.filter(c => !c.is_archived).filter(c => {
    return statuses.some(s => s.character_id === c.id);
  });

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#111]/95 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-3">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            Feed
          </h1>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['posts'] })}
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto">
        {/* Stories bar */}
        {charactersWithStatuses.length > 0 && (
          <div className="px-4 py-3 overflow-x-auto scrollbar-hide border-b border-white/5">
            <div className="flex gap-3">
              {charactersWithStatuses.map(character => {
                const charStatuses = statuses.filter(s => s.character_id === character.id);
                const viewedIds = new Set(statusViews.map(v => v.status_id));
                const hasUnseen = charStatuses.some(s => !viewedIds.has(s.id));
                return (
                  <StatusCircle key={character.id} character={character} hasNewStatus={hasUnseen} />
                );
              })}
            </div>
          </div>
        )}

        {/* Generate button */}
        <div className="px-4 py-3 flex justify-center">
          <GeneratePostButton characters={characters.filter(c => !c.is_archived)} />
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 px-6">
            <p className="text-gray-400 text-lg mb-2">Noch keine Posts</p>
            <p className="text-gray-500 text-sm">Tippe auf "Neuer Post" um deinen Charakteren Bilder generieren zu lassen!</p>
          </div>
        ) : (
          <div>
            {posts.map((post) => {
              const character = getCharacter(post.character_id);
              if (!character || !post.image_url) return null;

              return (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  character={character}
                  isLiked={hasLiked(post.id)}
                  onLike={() => likeMutation.mutate(post.id)}
                  onOpenComments={() => setOpenCommentsPostId(post.id)}
                  commentsCount={post.comments_count || 0}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Comment sheet */}
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
    </div>
  );
}