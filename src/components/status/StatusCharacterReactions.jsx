import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatusCharacterReactions({ statusContent, statusType, userEmail }) {
  const [reactingCharId, setReactingCharId] = useState(null);
  const queryClient = useQueryClient();

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date')
  });

  const activeCharacters = characters.filter(c => !c.is_archived).slice(0, 6);

  const reactMutation = useMutation({
    mutationFn: async (character) => {
      setReactingCharId(character.id);

      const statusDesc = statusType === 'text'
        ? `einen Text-Status: "${statusContent}"`
        : statusType === 'image'
          ? `ein Bild als Status (${statusContent ? 'mit Bild' : ''})`
          : `ein Video als Status`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${character.name}. ${character.personality}
        
Der Nutzer hat ${statusDesc} als Status gepostet.

Reagiere darauf mit einer kurzen, authentischen Nachricht (1-2 Sätze max). 
Bleibe in deiner Rolle und Persönlichkeit. Sei natürlich.
${character.writing_style ? `Schreibstil: ${character.writing_style}` : ''}
${character.current_mood ? `Deine aktuelle Stimmung: ${character.current_mood}` : ''}`,
        response_json_schema: {
          type: "object",
          properties: {
            reaction: { type: "string", description: "Kurze Reaktion auf den Status" }
          }
        }
      });

      // Save reaction as a message in the character's chat
      await base44.entities.ChatMessage.create({
        character_id: character.id,
        role: 'assistant',
        content: `📸 *Reaktion auf deinen Status:*\n\n${response.reaction}`,
        status: 'delivered'
      });

      queryClient.invalidateQueries({ queryKey: ['messages', character.id] });
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });

      return { characterName: character.name, reaction: response.reaction };
    },
    onSettled: () => {
      setReactingCharId(null);
    }
  });

  if (activeCharacters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-1">
      {activeCharacters.map((char) => {
        const isReacting = reactingCharId === char.id;
        const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`;

        return (
          <motion.button
            key={char.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (!isReacting && !reactMutation.isPending) {
                reactMutation.mutate(char);
              }
            }}
            disabled={reactMutation.isPending}
            className="flex flex-col items-center gap-1 flex-shrink-0"
            title={`${char.name} reagieren lassen`}
          >
            <div className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
              isReacting ? 'border-emerald-400 animate-pulse' : 'border-white/20 hover:border-emerald-400'
            }`}>
              <img
                src={char.avatar_url || defaultAvatar}
                alt={char.name}
                className="w-full h-full object-cover"
              />
              {isReacting && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              )}
            </div>
            <span className="text-[10px] text-white/70 max-w-[50px] truncate">{char.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}