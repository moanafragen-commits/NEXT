import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Wand2, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function CreatePost() {
  const [topic, setTopic] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedCharId, setSelectedCharId] = useState('random');
  const [step, setStep] = useState('');
  const queryClient = useQueryClient();

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list()
  });

  const activeChars = characters.filter(c => !c.is_archived);

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (activeChars.length === 0) return;

      const character = selectedCharId === 'random'
        ? activeChars[Math.floor(Math.random() * activeChars.length)]
        : activeChars.find(c => c.id === selectedCharId) || activeChars[0];

      const context = [
        character.personality,
        character.biography && `Biografie: ${character.biography}`,
        character.interests && `Interessen: ${character.interests}`,
        character.favorite_topics && `Lieblingsthemen: ${character.favorite_topics}`,
        character.occupation && `Beruf: ${character.occupation}`,
        character.mood_default && `Stimmung: ${character.mood_default}`,
      ].filter(Boolean).join('. ');

      const topicHint = topic.trim()
        ? `\n\nDer Post soll sich um folgendes Thema/Stichpunkte drehen: "${topic.trim()}". Passe das kreativ an die Persönlichkeit des Charakters an.`
        : '';

      const captionHint = caption.trim()
        ? `\n\nDer User möchte folgende Caption verwenden: "${caption.trim()}". Passe den Bild-Prompt dazu an.`
        : '';

      // Step 1: Generate tweet text
      setStep('Tweet wird erstellt...');
      const isCelebrity = character.category === 'Berühmtheit';
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${character.name}. ${context}${topicHint}${captionHint}

Erstelle einen Tweet/Post für diesen Charakter.${isCelebrity ? ' Dieser Charakter ist eine BERÜHMTHEIT mit einem verifizierten Account (blauer Haken). Der Post sollte authentisch für eine öffentliche Person klingen – Statements, Meinungen, Ankündigungen, Humor oder Einblicke ins Leben.' : ''}

Erstelle einen kurzen Tweet-Text auf Deutsch (1-3 Sätze, max 280 Zeichen, mit Emojis wenn passend), geschrieben aus der Ich-Perspektive des Charakters. Kein Hashtag-Spam.${caption.trim() ? ' Verwende die vom User vorgegebene Caption als Basis.' : ''}`,
        response_json_schema: {
          type: "object",
          properties: {
            tweet_text: { type: "string" }
          }
        }
      });

      // Step 2: Create post (text-only, no image)
      setStep('Post wird erstellt...');
      const post = await base44.entities.Post.create({
        character_id: character.id,
        content: caption.trim() || result.tweet_text,
        image_url: '',
        likes_count: isCelebrity ? Math.floor(Math.random() * 5000 + 500) : 0,
        comments_count: 0
      });

      // Step 4: AI reactions
      setStep('Charaktere reagieren...');
      const otherChars = activeChars.filter(c => c.id !== character.id).slice(0, 5);

      if (otherChars.length > 0) {
        const reactResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Ein Tweet von "${character.name}" mit dem Text: "${caption.trim() || result.tweet_text}"

Folgende KI-Charaktere sehen diesen Post. Entscheide für jeden, ob sie liken und/oder kommentieren würden.

Charaktere:
${otherChars.map(c => `- ${c.name} (ID: ${c.id}): ${c.personality?.slice(0, 100)}`).join('\n')}

Generiere realistische Reaktionen passend zur Persönlichkeit.`,
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

        let likesCount = 0;
        let commentsCount = 0;

        for (const reaction of (reactResult.reactions || [])) {
          if (reaction.should_like) {
            await base44.entities.PostLike.create({ post_id: post.id, user_email: reaction.character_id });
            likesCount++;
          }
          if (reaction.should_comment && reaction.comment_text) {
            await base44.entities.Comment.create({ post_id: post.id, user_email: reaction.character_id, content: reaction.comment_text });
            commentsCount++;
          }
        }

        if (likesCount > 0 || commentsCount > 0) {
          await base44.entities.Post.update(post.id, { likes_count: likesCount, comments_count: commentsCount });
        }
      }

      return character.name;
    },
    onSuccess: (name) => {
      setStep('');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['likes'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast.success(`${name} hat gepostet!`);
      window.history.back();
    },
    onError: () => {
      setStep('');
      toast.error('Fehler beim Generieren');
    }
  });

  const isGenerating = generateMutation.isPending;

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => window.history.back()} className="text-black">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-base font-semibold">Neuer Tweet</h1>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-lg mx-auto p-5 space-y-5">
        {/* Character selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Charakter</label>
          <select
            value={selectedCharId}
            onChange={(e) => setSelectedCharId(e.target.value)}
            className="w-full bg-gray-50 text-black text-sm rounded-xl px-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            <option value="random">🎲 Zufälliger Charakter</option>
            {activeChars.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Topic */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Thema / Stichpunkte</label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="z.B. Sonnenuntergang, neues Rezept, Gym..."
            className="bg-gray-50 border-gray-200 text-black placeholder-gray-400 rounded-xl h-12"
          />
        </div>

        {/* Caption */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Caption (optional)</label>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Eigene Caption eingeben oder KI generieren lassen..."
            rows={3}
            className="bg-gray-50 border-gray-200 text-black placeholder-gray-400 rounded-xl resize-none"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={isGenerating || activeChars.length === 0}
          className="w-full h-12 rounded-xl bg-black hover:bg-black/90 text-white text-base font-medium gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {step}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Tweet generieren
            </>
          )}
        </Button>

        {activeChars.length === 0 && (
          <p className="text-center text-sm text-gray-400">Erstelle zuerst einen Charakter</p>
        )}
      </main>
    </div>
  );
}