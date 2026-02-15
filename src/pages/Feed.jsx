import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import FeedPostCard from '@/components/feed/FeedPostCard';
import FeedCommentSheet from '@/components/feed/FeedCommentSheet';
import BottomNav from '@/components/navigation/BottomNav';

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

  const { data: comments = [] } = useQuery({
    queryKey: ['comments'],
    queryFn: () => base44.entities.Comment.list('-created_date', 500)
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['likes'],
    queryFn: () => base44.entities.PostLike.list()
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

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-center px-4 py-3">
          <h1 className="text-xl font-bold tracking-tight">aspect</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto pb-16">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 px-6">
            <p className="text-gray-500 text-lg mb-2">Noch keine Posts</p>
            <p className="text-gray-400 text-sm">Tippe auf + um deinen ersten Post zu erstellen</p>
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
                  allCharacters={characters}
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