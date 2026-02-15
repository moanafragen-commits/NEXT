import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bot, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIReactButton({ post, postCharacter, allCharacters }) {
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const reactMutation = useMutation({
    mutationFn: async () => {
      setGenerating(true);
      const otherChars = allCharacters.filter(c => c.id !== post.character_id).slice(0, 5);
      if (otherChars.length === 0) return 0;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Ein Instagram-Post von "${postCharacter?.name}" mit der Caption: "${post.content}"

Folgende KI-Charaktere sehen diesen Post. Entscheide für jeden, ob sie liken und/oder kommentieren würden.

Charaktere:
${otherChars.map(c => `- ${c.name} (ID: ${c.id}): ${c.personality?.slice(0, 120)}`).join('\n')}

Generiere realistische Reaktionen. Kommentare sollen kurz und natürlich sein (1-2 Sätze, mit Emojis wenn passend).`,
        response_json_schema: {
          type: "object",
          properties: {
            reactions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  character_id: { type: "string" },
                  character_name: { type: "string" },
                  should_like: { type: "boolean" },
                  should_comment: { type: "boolean" },
                  comment_text: { type: "string" }
                }
              }
            }
          }
        }
      });

      let newLikes = 0;
      let newComments = 0;

      for (const reaction of (result.reactions || [])) {
        if (reaction.should_like) {
          const existing = await base44.entities.PostLike.filter({ post_id: post.id, user_email: reaction.character_id });
          if (existing.length === 0) {
            await base44.entities.PostLike.create({ post_id: post.id, user_email: reaction.character_id });
            newLikes++;
          }
        }
        if (reaction.should_comment && reaction.comment_text) {
          await base44.entities.Comment.create({ post_id: post.id, user_email: reaction.character_id, content: reaction.comment_text });
          newComments++;
        }
      }

      if (newLikes > 0 || newComments > 0) {
        await base44.entities.Post.update(post.id, {
          likes_count: (post.likes_count || 0) + newLikes,
          comments_count: (post.comments_count || 0) + newComments
        });
      }

      return newLikes + newComments;
    },
    onSuccess: (count) => {
      setGenerating(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      if (count > 0) toast.success(`${count} neue Reaktion${count > 1 ? 'en' : ''}!`);
    },
    onError: () => {
      setGenerating(false);
      toast.error('Fehler');
    }
  });

  return (
    <button
      onClick={() => reactMutation.mutate()}
      disabled={generating}
      className="hover:opacity-60 transition-opacity"
      title="KI-Charaktere reagieren lassen"
    >
      {generating ? (
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      ) : (
        <Bot className="w-5 h-5 text-gray-500" />
      )}
    </button>
  );
}