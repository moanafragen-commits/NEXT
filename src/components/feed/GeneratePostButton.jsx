import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, X, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function GeneratePostButton({ characters }) {
  const [showInput, setShowInput] = useState(false);
  const [topic, setTopic] = useState('');
  const [selectedCharId, setSelectedCharId] = useState('random');
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState(''); // caption, image, reactions
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!characters || characters.length === 0) return;
      setGenerating(true);

      // Pick character
      const character = selectedCharId === 'random'
        ? characters[Math.floor(Math.random() * characters.length)]
        : characters.find(c => c.id === selectedCharId) || characters[0];

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

      const topicHint = topic.trim()
        ? `\n\nDer Post soll sich um folgendes Thema/Stichpunkte drehen: "${topic.trim()}". Passe das kreativ an die Persönlichkeit des Charakters an.`
        : '';

      // Step 1: Generate caption + image prompt
      setStep('Caption wird erstellt...');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${character.name}. ${context}${topicHint}

Erstelle einen Instagram-Post für diesen Charakter. Der Post soll perfekt zur Persönlichkeit passen.

Erstelle:
1. Einen detaillierten Bild-Prompt auf Englisch für eine KI-Bildgenerierung (fotorealistisch, kein Text im Bild, keine Hände im Vordergrund). Das Bild soll etwas zeigen, das der Charakter fotografieren/teilen würde.
2. Eine kurze Instagram-Caption auf Deutsch (1-3 Sätze, mit passenden Emojis), geschrieben aus der Ich-Perspektive des Charakters.`,
        response_json_schema: {
          type: "object",
          properties: {
            image_prompt: { type: "string" },
            caption: { type: "string" }
          }
        }
      });

      // Step 2: Generate the image
      setStep('Bild wird generiert...');
      const imageResult = await base44.integrations.Core.GenerateImage({
        prompt: result.image_prompt
      });

      // Step 3: Create the post
      const post = await base44.entities.Post.create({
        character_id: character.id,
        content: result.caption,
        image_url: imageResult.url,
        image_prompt: result.image_prompt,
        likes_count: 0,
        comments_count: 0
      });

      // Step 4: Generate AI character reactions (likes & comments)
      setStep('Charaktere reagieren...');
      const otherChars = characters.filter(c => c.id !== character.id).slice(0, 5);
      
      if (otherChars.length > 0) {
        const reactResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Ein Instagram-Post von "${character.name}" mit der Caption: "${result.caption}"
Bild-Beschreibung: ${result.image_prompt}

Folgende KI-Charaktere sehen diesen Post. Entscheide für jeden, ob sie liken und/oder kommentieren würden. Die Reaktionen sollen zu ihrer Persönlichkeit passen.

Charaktere:
${otherChars.map(c => `- ${c.name} (ID: ${c.id}): ${c.personality?.slice(0, 100)}`).join('\n')}

Generiere realistische Reaktionen. Nicht jeder muss reagieren – nur wenn es zur Persönlichkeit passt.`,
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
                    comment_text: { type: "string", description: "Kommentar auf Deutsch, passend zur Persönlichkeit. Leer wenn should_comment=false" }
                  }
                }
              }
            }
          }
        });

        let likesCount = 0;
        let commentsCount = 0;

        for (const reaction of (reactResult.reactions || [])) {
          if (reaction.should_like) {
            await base44.entities.PostLike.create({
              post_id: post.id,
              user_email: reaction.character_id // Use character_id as identifier
            });
            likesCount++;
          }
          if (reaction.should_comment && reaction.comment_text) {
            await base44.entities.Comment.create({
              post_id: post.id,
              user_email: reaction.character_id, // Use character_id as identifier
              content: reaction.comment_text
            });
            commentsCount++;
          }
        }

        // Update post counts
        if (likesCount > 0 || commentsCount > 0) {
          await base44.entities.Post.update(post.id, {
            likes_count: likesCount,
            comments_count: commentsCount
          });
        }
      }

      return character.name;
    },
    onSuccess: (name) => {
      setGenerating(false);
      setStep('');
      setShowInput(false);
      setTopic('');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      if (name) toast.success(`${name} hat etwas gepostet!`);
    },
    onError: () => {
      setGenerating(false);
      setStep('');
      toast.error('Fehler beim Generieren');
    }
  });

  return (
    <div className="w-full">
      <AnimatePresence>
        {showInput && !generating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Post erstellen</span>
                <button onClick={() => setShowInput(false)}>
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Character selector */}
              <select
                value={selectedCharId}
                onChange={(e) => setSelectedCharId(e.target.value)}
                className="w-full bg-[#262626] text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="random">🎲 Zufälliger Charakter</option>
                {characters.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Topic input */}
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Thema oder Stichpunkte (optional)..."
                className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
                onKeyDown={(e) => e.key === 'Enter' && generateMutation.mutate()}
              />
              <p className="text-[11px] text-gray-500">z.B. "Sonnenuntergang am Strand", "neues Rezept ausprobiert", "Gym Session"</p>

              <Button
                onClick={() => generateMutation.mutate()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-lg gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Generieren
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {generating ? (
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-xl px-5 py-3 border border-white/10">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            <span className="text-sm text-gray-300">{step || 'Wird generiert...'}</span>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setShowInput(!showInput)}
          disabled={!characters?.length}
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-xl gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Neuer Post
        </Button>
      )}
    </div>
  );
}