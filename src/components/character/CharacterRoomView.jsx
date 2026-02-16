import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Home, Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROOM_STYLES = [
  { value: 'modern', label: 'Modern', emoji: '🏢' },
  { value: 'gemütlich', label: 'Gemütlich', emoji: '🛋️' },
  { value: 'minimalistisch', label: 'Minimalistisch', emoji: '⬜' },
  { value: 'chaotisch', label: 'Chaotisch', emoji: '🌪️' },
  { value: 'vintage', label: 'Vintage', emoji: '📻' },
  { value: 'luxuriös', label: 'Luxuriös', emoji: '✨' },
  { value: 'gothic', label: 'Gothic', emoji: '🖤' },
  { value: 'bohemian', label: 'Bohemian', emoji: '🪴' },
  { value: 'gaming', label: 'Gaming', emoji: '🎮' },
  { value: 'künstlerisch', label: 'Künstlerisch', emoji: '🎨' },
  { value: 'studentisch', label: 'Studentisch', emoji: '📚' },
  { value: 'japanisch', label: 'Japanisch', emoji: '🏯' },
];

const LIGHTING = [
  { value: 'warm', label: '☀️ Warm' },
  { value: 'kalt', label: '❄️ Kalt' },
  { value: 'neon', label: '💜 Neon' },
  { value: 'kerzen', label: '🕯️ Kerzen' },
  { value: 'dunkel', label: '🌑 Dunkel' },
  { value: 'sonnig', label: '🌤️ Sonnig' },
  { value: 'dämmerung', label: '🌅 Dämmerung' },
];

export default function CharacterRoomView({ character }) {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(null);

  const { data: room } = useQuery({
    queryKey: ['character-room', character.id],
    queryFn: async () => {
      const rooms = await base44.entities.CharacterRoom.filter({ character_id: character.id }, '-created_date', 1);
      return rooms[0] || null;
    },
    enabled: !!character.id
  });

  const generateRoom = async () => {
    setIsGenerating(true);
    const style = selectedStyle || room?.room_style || 'modern';

    // Generate description
    const descResp = await base44.integrations.Core.InvokeLLM({
      prompt: `Beschreibe das Zimmer von ${character.name} (${character.personality?.slice(0, 150)}).
Stil: ${style}
Beruf: ${character.occupation || 'unbekannt'}
Hobbys: ${character.interests || 'unbekannt'}
Alter: ${character.age || 'unbekannt'}

Erstelle eine atmosphärische Beschreibung und liste 5-8 typische Gegenstände auf die man im Zimmer finden würde.`,
      response_json_schema: {
        type: "object",
        properties: {
          description: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                emoji: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          mood_lighting: { type: "string", enum: ["warm", "kalt", "neon", "kerzen", "dunkel", "sonnig", "dämmerung"] }
        }
      }
    });

    // Generate room image
    const imgResp = await base44.integrations.Core.GenerateImage({
      prompt: `Interior photo of a ${style} bedroom/room. ${descResp.description.slice(0, 200)}. Cozy atmosphere, ${descResp.mood_lighting || 'warm'} lighting, detailed interior design, photorealistic, high quality.`
    });

    // Save or update
    if (room) {
      await base44.entities.CharacterRoom.update(room.id, {
        room_style: style,
        room_image_url: imgResp.url,
        items: descResp.items,
        description: descResp.description,
        mood_lighting: descResp.mood_lighting
      });
    } else {
      await base44.entities.CharacterRoom.create({
        character_id: character.id,
        room_style: style,
        room_image_url: imgResp.url,
        items: descResp.items,
        description: descResp.description,
        mood_lighting: descResp.mood_lighting
      });
    }

    queryClient.invalidateQueries({ queryKey: ['character-room', character.id] });
    setIsGenerating(false);
  };

  return (
    <div className="space-y-4">
      {room?.room_image_url ? (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden">
            <img src={room.room_image_url} alt="Zimmer" className="w-full h-48 object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <p className="text-xs text-white/80">{ROOM_STYLES.find(s => s.value === room.room_style)?.emoji} {room.room_style}</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-300 leading-relaxed">{room.description}</p>

          {room.items?.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {room.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                  <span className="text-sm">{item.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-300 truncate">{item.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <Home className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-3">Noch kein Zimmer erstellt</p>
        </div>
      )}

      <div className="flex gap-2">
        <Select value={selectedStyle || room?.room_style || ''} onValueChange={setSelectedStyle}>
          <SelectTrigger className="flex-1 bg-[#262626] border-white/10 text-white text-xs h-9">
            <SelectValue placeholder="Stil wählen" />
          </SelectTrigger>
          <SelectContent className="bg-[#262626] border-white/10">
            {ROOM_STYLES.map(s => (
              <SelectItem key={s.value} value={s.value} className="text-white hover:bg-white/10 text-xs">
                {s.emoji} {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={generateRoom} disabled={isGenerating} size="sm" className="bg-emerald-600 hover:bg-emerald-500">
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}