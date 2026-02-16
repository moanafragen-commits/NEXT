import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Send, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function MeetupInvite({ latLng, characters, onClose }) {
  const [selectedCharId, setSelectedCharId] = useState(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const handleInvite = async () => {
    if (!selectedCharId || !user || !latLng) return;
    setSending(true);

    const char = characters.find(c => c.id === selectedCharId);
    if (!char) return;

    // Generate a meetup message via LLM
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Du bist ${char.name}. ${char.personality || ''}
Der User hat dich zu einem Treffpunkt eingeladen (Koordinaten: ${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)}).
Reagiere begeistert/überrascht/neugierig (je nach Persönlichkeit) auf die Einladung. Kurz, 1-2 Sätze, authentisch.
Schreibstil: ${char.writing_style || 'freundlich'}. Sprache: Deutsch.`,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
          emoji: { type: "string", description: "Ein passendes Emoji" }
        }
      }
    });

    // Save as chat message
    await base44.entities.ChatMessage.create({
      character_id: selectedCharId,
      role: 'user',
      content: `📍 Ich lade dich an einen Treffpunkt ein! (${latLng.lat.toFixed(4)}, ${latLng.lng.toFixed(4)})`
    });

    await base44.entities.ChatMessage.create({
      character_id: selectedCharId,
      role: 'assistant',
      content: response.response
    });

    // Save the meetup location
    await base44.entities.CharacterLocation.create({
      character_id: selectedCharId,
      location_name: `Treffpunkt mit dir ${response.emoji || '📌'}`,
      location_type: 'andere',
      emoji: '📌',
      description: `${char.name} ist auf dem Weg zum Treffpunkt!`,
      shared_at: new Date().toISOString(),
      latitude: latLng.lat + (Math.random() - 0.5) * 0.003,
      longitude: latLng.lng + (Math.random() - 0.5) * 0.003,
      city: '',
      address: 'Treffpunkt'
    });

    queryClient.invalidateQueries({ queryKey: ['all-character-locations'] });
    queryClient.invalidateQueries({ queryKey: ['messages', selectedCharId] });

    setSending(false);
    setSent(true);
    toast.success(`${char.name} wurde eingeladen!`);
    setTimeout(onClose, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="absolute bottom-24 left-3 right-3 z-[600] bg-[#111]/95 backdrop-blur-2xl rounded-2xl border border-white/10 p-4 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Treffpunkt einladen</h3>
            <p className="text-[10px] text-gray-500">{latLng.lat.toFixed(4)}, {latLng.lng.toFixed(4)}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-white h-7 w-7">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {sent ? (
        <div className="flex items-center justify-center gap-2 py-4 text-emerald-400">
          <Check className="w-5 h-5" />
          <span className="text-sm font-medium">Einladung gesendet!</span>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            {characters.map(char => {
              const avatar = char.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`;
              const isSelected = selectedCharId === char.id;
              return (
                <button
                  key={char.id}
                  onClick={() => setSelectedCharId(char.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl shrink-0 transition-all border ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-white/[0.02] border-transparent hover:bg-white/5'
                  }`}
                >
                  <img src={avatar} className={`w-10 h-10 rounded-full object-cover ring-2 ${
                    isSelected ? 'ring-emerald-500' : 'ring-white/10'
                  }`} />
                  <span className="text-[10px] text-gray-300 max-w-[56px] truncate">{char.name}</span>
                </button>
              );
            })}
          </div>

          <Button
            onClick={handleInvite}
            disabled={!selectedCharId || sending}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-10 text-sm font-semibold disabled:opacity-40"
          >
            {sending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Einladung wird gesendet...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" /> Einladen</>
            )}
          </Button>
        </>
      )}
    </motion.div>
  );
}