import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function GeneratePostButton({ characters }) {
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!characters || characters.length === 0) return;
      setGenerating(true);

      // Pick a random character
      const character = characters[Math.floor(Math.random() * characters.length)];

      // Build context from character personality
      const context = [
        character.personality,
        character.biography && `Biografie: ${character.biography}`,
        character.interests && `Interessen: ${character.interests}`,
        character.favorite_topics && `Lieblingsthemen: ${character.favorite_topics}`,
        character.occupation && `Beruf: ${character.occupation}`,
        character.goals && `Ziele: ${character.goals}`,
        character.age && `Alter: ${character.age}`,
        character.background_culture && `Kultureller Hintergrund: ${character.background_culture}`,
        character.mood_default && `Stimmung: ${character.mood_default}`,
      ].filter(Boolean).join('. ');

      // Generate image prompt + caption via LLM
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${character.name}. ${context}

Erstelle einen Instagram-Post für diesen Charakter. Der Post soll perfekt zur Persönlichkeit passen.

Erstelle:
1. Einen detaillierten Bild-Prompt auf Englisch für eine KI-Bildgenerierung (fotorealistisch, kein Text im Bild, keine Hände im Vordergrund). Das Bild soll etwas zeigen, das der Charakter fotografieren/teilen würde - z.B. sein Hobby, Reisen, Essen, Natur, Kunst, Sport, Alltag, etc.
2. Eine kurze Instagram-Caption auf Deutsch (1-3 Sätze, mit passenden Emojis), geschrieben aus der Ich-Perspektive des Charakters.`,
        response_json_schema: {
          type: "object",
          properties: {
            image_prompt: { type: "string", description: "Detaillierter englischer Prompt für Bildgenerierung" },
            caption: { type: "string", description: "Deutsche Instagram-Caption aus Sicht des Charakters" }
          }
        }
      });

      // Generate the image
      const imageResult = await base44.integrations.Core.GenerateImage({
        prompt: result.image_prompt
      });

      // Create the post
      await base44.entities.Post.create({
        character_id: character.id,
        content: result.caption,
        image_url: imageResult.url,
        image_prompt: result.image_prompt,
        likes_count: 0,
        comments_count: 0
      });

      return character.name;
    },
    onSuccess: (name) => {
      setGenerating(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      if (name) toast.success(`${name} hat etwas gepostet!`);
    },
    onError: (err) => {
      setGenerating(false);
      toast.error('Fehler beim Generieren');
    }
  });

  return (
    <Button
      onClick={() => generateMutation.mutate()}
      disabled={generating || !characters?.length}
      className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-xl gap-2"
    >
      {generating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Wird generiert...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Neuer Post
        </>
      )}
    </Button>
  );
}