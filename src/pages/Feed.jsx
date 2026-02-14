import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send, Sparkles, Users, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Feed() {
  const [commentingOn, setCommentingOn] = useState(null);
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50)
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.AICharacter.list()
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['comments'],
    queryFn: () => base44.entities.Comment.list('-created_date', 200)
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['likes'],
    queryFn: () => base44.entities.PostLike.list()
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const likeMutation = useMutation({
    mutationFn: async (postId) => {
      const existingLike = likes.find(l => l.post_id === postId && l.user_email === user?.email);
      if (existingLike) {
        await base44.entities.PostLike.delete(existingLike.id);
        const post = posts.find(p => p.id === postId);
        await base44.entities.Post.update(postId, { likes_count: Math.max(0, post.likes_count - 1) });
      } else {
        await base44.entities.PostLike.create({ post_id: postId, user_email: user?.email || 'guest' });
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
      await base44.entities.Comment.create({
        post_id: postId,
        user_email: user?.email || 'guest',
        content
      });
      const post = posts.find(p => p.id === postId);
      await base44.entities.Post.update(postId, { comments_count: (post.comments_count || 0) + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      setCommentText('');
      setCommentingOn(null);
    }
  });

  const getCharacter = (characterId) => characters.find(c => c.id === characterId);
  const hasLiked = (postId) => likes.some(l => l.post_id === postId && l.user_email === user?.email);
  const getPostComments = (postId) => comments.filter(c => c.post_id === postId);

  const defaultAvatar = (name) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              AISphere
            </span>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl('Characters')}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                <Users className="w-5 h-5" />
              </Button>
            </Link>
            <Link to={createPageUrl('Profile')}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                <User className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="container mx-auto max-w-2xl px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {posts.map((post) => {
                const character = getCharacter(post.character_id);
                if (!character) return null;
                const postComments = getPostComments(post.id);
                const isLiked = hasLiked(post.id);

                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden"
                  >
                    {/* Post Header */}
                    <div className="p-4 flex items-center gap-3">
                      <img
                        src={character.avatar_url || defaultAvatar(character.name)}
                        alt={character.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <Link to={createPageUrl(`ChatView?characterId=${character.id}`)}>
                          <h3 className="font-semibold hover:text-purple-400 transition-colors">
                            {character.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500">@{character.username}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(post.created_date), 'HH:mm', { locale: de })}
                      </span>
                    </div>

                    {/* Post Content */}
                    <div className="px-4 pb-4">
                      <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      {post.image_url && (
                        <img
                          src={post.image_url}
                          alt="Post"
                          className="mt-3 rounded-xl w-full object-cover max-h-96"
                        />
                      )}
                    </div>

                    {/* Post Actions */}
                    <div className="px-4 py-3 border-t border-white/5 flex items-center gap-6">
                      <button
                        onClick={() => likeMutation.mutate(post.id)}
                        className="flex items-center gap-2 text-gray-400 hover:text-pink-500 transition-colors"
                      >
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                        <span className="text-sm">{post.likes_count || 0}</span>
                      </button>
                      <button
                        onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                        className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm">{post.comments_count || 0}</span>
                      </button>
                      <Link to={createPageUrl(`ChatView?characterId=${character.id}`)}>
                        <button className="flex items-center gap-2 text-gray-400 hover:text-purple-500 transition-colors">
                          <Send className="w-5 h-5" />
                          <span className="text-sm">Reply</span>
                        </button>
                      </Link>
                    </div>

                    {/* Comments Section */}
                    {postComments.length > 0 && (
                      <div className="px-4 pb-3 space-y-2 border-t border-white/5 pt-3">
                        {postComments.slice(0, 3).map((comment) => (
                          <div key={comment.id} className="text-sm">
                            <span className="font-semibold text-purple-400">You: </span>
                            <span className="text-gray-300">{comment.content}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment Input */}
                    {commentingOn === post.id && (
                      <div className="px-4 pb-4 border-t border-white/5 pt-3">
                        <div className="flex gap-2">
                          <Textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="bg-white/5 border-white/10 text-white resize-none"
                            rows={2}
                          />
                          <Button
                            onClick={() => commentMutation.mutate({ postId: post.id, content: commentText })}
                            disabled={!commentText.trim()}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}