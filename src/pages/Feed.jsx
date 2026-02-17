import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, RefreshCw, TrendingUp, Newspaper } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FeedPostCard from '@/components/feed/FeedPostCard';
import FeedCommentSheet from '@/components/feed/FeedCommentSheet';
import BottomNav from '@/components/navigation/BottomNav';
import NextHeader from '@/components/navigation/NextHeader';
import TrendingSidebar from '@/components/feed/TrendingSidebar';
import GenerateFeedButton from '@/components/feed/GenerateFeedButton';
import ComposeBox from '@/components/feed/ComposeBox';
import NewsArticleCard from '@/components/news/NewsArticleCard';
import ShareNewsSheet from '@/components/news/ShareNewsSheet';
import { Button } from '@/components/ui/button';
import { createNotification } from '@/components/notifications/NotificationHelper';

export default function Feed() {
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);
  const [activeTrend, setActiveTrend] = useState(null);
  const [shareArticle, setShareArticle] = useState(null);
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

  const { data: aiCharacters = [] } = useQuery({
    queryKey: ['ai-characters'],
    queryFn: () => base44.entities.AICharacter.list()
  });

  const { data: newsArticles = [] } = useQuery({
    queryKey: ['news-feed-articles', user?.email],
    queryFn: () => base44.entities.NewsArticle.filter({ user_email: user.email }, '-created_date', 5),
    enabled: !!user
  });

  const markNewsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.NewsArticle.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['news-feed-articles'] })
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

  const getCharacter = (id) => {
    const char = characters.find(c => c.id === id);
    if (char) return char;
    const aiChar = aiCharacters.find(c => c.id === id);
    if (aiChar) return {
      id: aiChar.id,
      name: aiChar.name,
      avatar_url: aiChar.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${aiChar.username}`,
      category: aiChar.category === 'lifestyle' ? 'Influencer' : aiChar.category === 'tech' ? 'Wissenschaftler' : aiChar.category === 'inspiration' ? 'Musiker' : 'Andere',
      is_verified: aiChar.is_verified
    };
    return null;
  };
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

  const deleteMutation = useMutation({
    mutationFn: async (postId) => {
      // Delete related comments and likes
      const postComments = comments.filter(c => c.post_id === postId);
      const postLikes = likes.filter(l => l.post_id === postId);
      for (const c of postComments) await base44.entities.Comment.delete(c.id);
      for (const l of postLikes) await base44.entities.PostLike.delete(l.id);
      await base44.entities.Post.delete(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      toast.success('Post gelöscht');
    }
  });

  const editMutation = useMutation({
    mutationFn: async ({ postId, content }) => {
      await base44.entities.Post.update(postId, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post bearbeitet');
    }
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white auto-theme">
      {/* Header */}
      <header className="sticky top-0 z-10 glass border-b border-white/[0.06] auto-theme-header">
        <div className="flex items-center justify-between px-4 py-3">
          <NextHeader />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['posts'] });
              queryClient.invalidateQueries({ queryKey: ['likes'] });
              queryClient.invalidateQueries({ queryKey: ['comments'] });
              queryClient.invalidateQueries({ queryKey: ['news-feed-articles'] });
              toast.success('Feed aktualisiert');
            }}
            className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto pb-20 relative z-[1]">
        {/* User Compose Box */}
        <ComposeBox user={user} characters={characters} />

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

        {/* News Banner */}
        {newsArticles.length > 0 && !activeTrend && (
          <div className="border-b border-white/[0.05]">
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">Top-Nachrichten</span>
              </div>
              <Link to={createPageUrl('NewsFeed')} className="text-xs text-blue-400 hover:text-blue-300">
                Alle anzeigen →
              </Link>
            </div>
            {newsArticles.slice(0, 2).map(article => (
              <NewsArticleCard
                key={article.id}
                article={article}
                characters={characters}
                compact
                onMarkRead={(id) => markNewsReadMutation.mutate(id)}
                onShare={(a) => setShareArticle(a)}
              />
            ))}
          </div>
        )}

        {/* Trending Topics */}
        <div className="px-4 py-3">
          <TrendingSidebar activeTrend={activeTrend} onTrendClick={setActiveTrend} posts={posts} likes={likes} comments={comments} characters={characters} getCharacter={getCharacter} />
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
            {/* Trend filter banner */}
            {activeTrend && (
              <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-300 font-medium">Posts zu "{activeTrend}"</span>
                <span className="text-xs text-gray-500 ml-auto">
                  {posts.filter(p => {
                    const keywords = activeTrend.toLowerCase().split(/[\s\-]+/);
                    const content = (p.content || '').toLowerCase();
                    return keywords.some(kw => kw.length > 3 && content.includes(kw));
                  }).length} Treffer
                </span>
              </div>
            )}
            {(activeTrend
              ? posts.filter(p => {
                  const keywords = activeTrend.toLowerCase().split(/[\s\-]+/);
                  const content = (p.content || '').toLowerCase();
                  return keywords.some(kw => kw.length > 3 && content.includes(kw));
                })
              : posts
            ).map((post) => {
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
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onEdit={(id, content) => editMutation.mutate({ postId: id, content })}
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

      {shareArticle && (
        <ShareNewsSheet
          open={!!shareArticle}
          onClose={() => setShareArticle(null)}
          article={shareArticle}
        />
      )}

      <BottomNav user={user} />
    </div>
  );
}