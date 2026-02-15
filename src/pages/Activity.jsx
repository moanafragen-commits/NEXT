import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import moment from 'moment';
import BottomNav from '@/components/navigation/BottomNav';

export default function Activity() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: myPosts = [] } = useQuery({
    queryKey: ['my-posts', user?.email],
    queryFn: () => base44.entities.Post.filter({}, '-created_date', 200),
    enabled: !!user
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list()
  });

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

  const charMap = Object.fromEntries(characters.map(c => [c.id, c]));
  const postMap = Object.fromEntries(myPosts.map(p => [p.id, p]));

  const activities = [
    ...allLikes.map(l => ({ id: `like-${l.id}`, type: 'like', actorId: l.user_email, postId: l.post_id, date: l.created_date })),
    ...allComments.map(c => ({ id: `comment-${c.id}`, type: 'comment', actorId: c.user_email, postId: c.post_id, content: c.content, date: c.created_date })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const getActor = (actorId) => {
    const char = charMap[actorId];
    if (char) return { name: char.name, avatar: char.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}` };
    return { name: actorId, avatar: null };
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-center px-4 py-3">
          <h1 className="text-base font-semibold">Aktivität</h1>
        </div>
      </header>

      <div className="pb-16 max-w-lg mx-auto">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <Heart className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-gray-500 text-sm">Noch keine Aktivitäten</p>
            <p className="text-xs text-gray-400 mt-1">Likes und Kommentare auf deine Beiträge erscheinen hier</p>
          </div>
        ) : (
          <div>
            {activities.map((activity, i) => {
              const actor = getActor(activity.actorId);
              const post = postMap[activity.postId];

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-50"
                >
                  {actor.avatar ? (
                    <img src={actor.avatar} alt={actor.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-gray-500">{actor.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] leading-snug">
                      <span className="font-semibold">{actor.name}</span>
                      {activity.type === 'like' && (
                        <span className="text-gray-500"> hat deinen Beitrag geliked</span>
                      )}
                      {activity.type === 'comment' && (
                        <span className="text-gray-500"> hat kommentiert: <span className="text-gray-700">{activity.content?.slice(0, 60)}{activity.content?.length > 60 ? '...' : ''}</span></span>
                      )}
                    </p>
                    <span className="text-[11px] text-gray-400">{moment(activity.date).fromNow()}</span>
                  </div>

                  {post?.image_url && (
                    <img src={post.image_url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav user={user} />
    </div>
  );
}