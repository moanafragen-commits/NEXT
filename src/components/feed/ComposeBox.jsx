import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComposeBox({ user, characters }) {
  const [text, setText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const postMutation = useMutation({
    mutationFn: async () => {
      const content = text.trim();
      if (!content) return;

      // Create user post
      const post = await base44.entities.Post.create({
        content,
        character_id: '',
        image_url: '',
        is_user_post: true,
        user_display_name: user?.display_name || user?.full_name || 'Du',
        user_avatar_url: user?.avatar_url || '',
        likes_count: 0,
        comments_count: 0
      });

      // Let AI characters react
      const activeChars = (characters || []).filter(c => !c.is_archived && !c.is_blocked);
      if (activeChars.length > 0) {
        const reactors = activeChars.sort(() => Math.random() - 0.5).slice(0, Math.min(6, activeChars.length));

        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `Ein User hat auf der Social-Media-Plattform gepostet: "${content}"

Folgende KI-Charaktere sehen diesen Post und können reagieren. Entscheide für JEDEN basierend auf ihrer Persönlichkeit ob und wie sie reagieren:

${reactors.map(c => `- ${c.name} (ID: ${c.id}): ${(c.personality || '').slice(0, 80)}. Stimmung: ${c.current_mood || c.mood_default || 'neutral'}. Kategorie: ${c.category || 'Andere'}`).join('\n')}

Regeln:
- Ca. 50-80% sollten liken, 30-50% kommentieren
- Kommentare sind kurz (1 Satz), natürlich, persönlich
- Die Reaktion muss zur Persönlichkeit und Stimmung des Charakters passen`,
          response_json_schema: {
            type: "object",
            properties: {
              reactions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    character_id: { type: "string" },
                    should_like: { type: "boolean" },
                    should_comment: { type: "boolean" },
                    comment_text: { type: "string" }
                  }
                }
              }
            }
          }
        });

        let newLikes = 0, newComments = 0;
        for (const r of (result.reactions || [])) {
          if (r.should_like) {
            await base44.entities.PostLike.create({ post_id: post.id, user_email: r.character_id });
            newLikes++;
          }
          if (r.should_comment && r.comment_text) {
            await base44.entities.Comment.create({ post_id: post.id, user_email: r.character_id, content: r.comment_text });
            newComments++;
          }
        }
        if (newLikes > 0 || newComments > 0) {
          await base44.entities.Post.update(post.id, {
            likes_count: newLikes,
            comments_count: newComments
          });
        }
      }

      return post;
    },
    onSuccess: () => {
      setText('');
      setExpanded(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success('Gepostet! Deine Charaktere reagieren...');
    }
  });

  const isPosting = postMutation.isPending;

  return (
    <div className="px-4 py-3 border-b border-white/[0.06]">
      <div className="flex gap-3">
        {/* User avatar */}
        <div className="flex-shrink-0">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
              {(user?.display_name || user?.full_name || 'U')[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex-1 min-w-0">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (!expanded && e.target.value.length > 0) setExpanded(true);
            }}
            onFocus={() => setExpanded(true)}
            placeholder="Was gibt's Neues?"
            rows={expanded ? 3 : 1}
            maxLength={280}
            disabled={isPosting}
            className="w-full bg-transparent text-white placeholder-gray-500 text-[15px] resize-none outline-none py-2 leading-relaxed"
          />

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between pt-2 border-t border-white/[0.06]"
              >
                <span className={`text-xs ${text.length > 250 ? 'text-amber-400' : 'text-gray-500'}`}>
                  {text.length}/280
                </span>
                <button
                  onClick={() => postMutation.mutate()}
                  disabled={!text.trim() || isPosting}
                  className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-sm font-medium rounded-full transition-colors"
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Posten...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Posten
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}