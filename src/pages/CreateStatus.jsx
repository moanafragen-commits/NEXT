import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateStatus() {
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('characterId');
  const [caption, setCaption] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(characterId || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list('-created_date')
  });

  const { data: character } = useQuery({
    queryKey: ['character', selectedCharacter],
    queryFn: async () => {
      const chars = await base44.entities.Character.filter({ id: selectedCharacter });
      return chars[0];
    },
    enabled: !!selectedCharacter
  });

  const generateStatusMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      
      // Generate image prompt based on character
      const promptResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${character.name}. ${character.personality}
        
Erstelle einen kreativen Bild-Prompt und eine kurze Caption für einen Status-Post, der zu deiner Persönlichkeit passt.
Der Post sollte authentisch und interessant sein, als würdest du ihn gerade erleben.

Beispiele für Status-Themen:
- Aktivitäten (Sport, Hobbys, Arbeit)
- Orte (Café, Park, Zuhause, Reisen)
- Momente (Sonnenuntergang, Food, Selfie, Haustiere)
- Stimmungen (entspannt, motiviert, nachdenklich)

Der Bildprompt sollte spezifisch und visuell ansprechend sein.`,
        response_json_schema: {
          type: "object",
          properties: {
            image_prompt: { type: "string", description: "Detaillierter Prompt für Bildgenerierung" },
            caption: { type: "string", description: "Kurze Caption (max 100 Zeichen)" }
          }
        }
      });

      // Generate image
      const imageResponse = await base44.integrations.Core.GenerateImage({
        prompt: promptResponse.image_prompt
      });

      // Create status with 24h expiry
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await base44.entities.CharacterStatus.create({
        character_id: selectedCharacter,
        image_url: imageResponse.url,
        caption: promptResponse.caption,
        expires_at: expiresAt.toISOString(),
        views_count: 0
      });

      return { caption: promptResponse.caption };
    },
    onSuccess: (data) => {
      setIsGenerating(false);
      setCaption(data.caption);
      queryClient.invalidateQueries({ queryKey: ['statuses'] });
      window.location.href = createPageUrl(`CharacterStatus?characterId=${selectedCharacter}`);
    },
    onError: () => {
      setIsGenerating(false);
    }
  });

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5">
        <div className="flex items-center gap-3 p-4">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Status erstellen</h1>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Charakter wählen</label>
            <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
              <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                <SelectValue placeholder="Charakter auswählen..." />
              </SelectTrigger>
              <SelectContent className="bg-[#262626] border-white/10">
                {characters.map(char => (
                  <SelectItem key={char.id} value={char.id} className="text-white">
                    {char.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {character && (
            <>
              <div className="bg-[#262626] rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={character.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`}
                    alt={character.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{character.name}</p>
                    <p className="text-sm text-gray-400">{character.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">{character.personality?.slice(0, 150)}...</p>
              </div>

              <Button
                onClick={() => generateStatusMutation.mutate()}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Status wird generiert...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    KI-Status generieren
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Erstellt automatisch einen Status-Post mit Bild und Text basierend auf der Persönlichkeit von {character.name}
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}