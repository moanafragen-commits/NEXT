import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Heart, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import moment from 'moment';

export default function Activity() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  // Get user's own posts
  const { data: myPosts = [] } = useQuery({
    queryKey: ['my-posts', user?.email],
    queryFn: () => base44.entities.Post.filter({}, '-created_date', 200),
    enabled: !!user
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list()
  });

  // Get all likes on user's posts
  const { data: allLikes = [] } = useQuery({
    queryKey: ['activity-likes', user?.email],
    queryFn: async () => {
      const postIds = myPosts.map(p => p.id);
      if (postIds.length === 0) return [];
      const likes = await base44.entities.PostLike.list('-created_date', 200);
      return likes.filter(l => postIds.includes(l.post_id) && l.user_email !== user.email);
    },
    enabled: !!user && myPosts.length > 0
  });

  // Get all comments on user's posts
  const { data: allComments = [] } = useQuery({
    queryKey: ['activity-comments', user?.email],
    queryFn: async () => {
      const postIds = myPosts.map(p => p.id);
      if (postIds.length === 0) return [];
      const comments = await base44.entities.Comment.list('-created_date', 200);
      return comments.filter(c => postIds.includes(c.post_id) && c.user_email !== user.email);
    },
    enabled: !!user && myPosts.length > 0
  });

  // Build activity feed
  const charMap = Object.fromEntries(characters.map(c => [c.id, c]));
  const postMap = Object.fromEntries(myPosts.map(p => [p.id, p]));

  const activities = [
    ...allLikes.map(l => ({
      id: `like-${l.id}`,
      type: 'like',
      actorId: l.user_email,
      postId: l.post_id,
      date: l.created_date,
    })),
    ...allComments.map(c => ({
      id: `comment-${c.id}`,
      type: 'comment',
      actorId: c.user_email,
      postId: c.post_id,
      content: c.content,
      date: c.created_date,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const getActor = (actorId) => {
    // Check if it's a character ID
    const char = charMap[actorId];
    if (char) return { name: char.name, avatar: char.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`, isChar: true };
    // Otherwise it's a user email
    return { name: actorId, avatar: null, isChar: false };
  };

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5 p-4">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Aktivitäten</h1>
        </div>
      </header>

      <div className="pb-20">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400">Noch keine Aktivitäten</p>
            <p className="text-xs text-gray-600 mt-1">Likes und Kommentare auf deine Beiträge erscheinen hier</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {activities.map((activity, i) => {
              const actor = getActor(activity.actorId);
              const post = postMap[activity.postId];

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 px-4 py-3.5 hover:bg-white/[0.02]"
                >
                  {/* Avatar */}
                  {actor.avatar ? (
                    <img src={actor.avatar} alt={actor.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center flex-shrink-0 text-sm font-medium text-gray-400">
                      {actor.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold text-white">{actor.name}</span>
                      {activity.type === 'like' && (
                        <span className="text-gray-400"> hat deinen Beitrag geliked</span>
                      )}
                      {activity.type === 'comment' && (
                        <span className="text-gray-400"> hat kommentiert: <span className="text-gray-300">{activity.content?.slice(0, 80)}{activity.content?.length > 80 ? '...' : ''}</span></span>
                      )}
                    </p>
                    <span className="text-xs text-gray-600">{moment(activity.date).fromNow()}</span>
                  </div>

                  {/* Post thumbnail */}
                  {post?.image_url && (
                    <img src={post.image_url} alt="" className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                  )}

                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === 'like' ? (
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    ) : (
                      <MessageCircle className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}