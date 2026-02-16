import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, MessageSquare, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomNav from '@/components/navigation/BottomNav';

export default function CharacterChatSelector({ user, characters }) {
  const [charA, setCharA] = useState(null);
  const [charB, setCharB] = useState(null);
  const [topic, setTopic] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existingConvs = [] } = useQuery({
    queryKey: ['c2c-conversations', user?.email],
    queryFn: () => base44.entities.CharacterConversation.filter({ user_email: user?.email }, '-created_date', 50),
    enabled: !!user
  });

  const activeChars = characters.filter(c => !c.is_archived && !c.is_blocked);

  const startConversation = async () => {
    if (!charA || !charB || !user) return;
    setCreating(true);
    const conv = await base44.entities.CharacterConversation.create({
      character_a_id: charA.id,
      character_b_id: charB.id,
      user_email: user.email,
      topic: topic || null,
      status: 'active'
    });
    queryClient.invalidateQueries({ queryKey: ['c2c-conversations'] });
    navigate(createPageUrl(`CharacterChat?id=${conv.id}`));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5 p-4">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">Charakter-zu-Charakter Chat</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* New Conversation */}
        <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
          <h2 className="font-semibold mb-3 text-sm text-gray-300">Neues Gespräch starten</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Charakter 1</label>
              <select
                value={charA?.id || ''}
                onChange={(e) => setCharA(activeChars.find(c => c.id === e.target.value))}
                className="w-full bg-[#262626] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"
              >
                <option value="">Wählen...</option>
                {activeChars.filter(c => c.id !== charB?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Charakter 2</label>
              <select
                value={charB?.id || ''}
                onChange={(e) => setCharB(activeChars.find(c => c.id === e.target.value))}
                className="w-full bg-[#262626] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"
              >
                <option value="">Wählen...</option>
                {activeChars.filter(c => c.id !== charA?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Thema (optional)..."
            className="bg-[#262626] border-white/10 text-white rounded-xl mb-3 placeholder-gray-600"
          />

          <Button
            onClick={startConversation}
            disabled={!charA || !charB || creating}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />}
            Gespräch starten
          </Button>
        </div>

        {/* Existing Conversations */}
        {existingConvs.length > 0 && (
          <div>
            <h2 className="font-semibold mb-3 text-sm text-gray-300">Bisherige Gespräche</h2>
            <div className="space-y-2">
              {existingConvs.map(conv => {
                const cA = characters.find(c => c.id === conv.character_a_id);
                const cB = characters.find(c => c.id === conv.character_b_id);
                if (!cA || !cB) return null;
                return (
                  <Link
                    key={conv.id}
                    to={createPageUrl(`CharacterChat?id=${conv.id}`)}
                    className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-xl border border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex -space-x-2">
                      <img src={cA.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${cA.name}`} className="w-8 h-8 rounded-full object-cover border-2 border-[#1a1a1a]" />
                      <img src={cB.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${cB.name}`} className="w-8 h-8 rounded-full object-cover border-2 border-[#1a1a1a]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cA.name} & {cB.name}</p>
                      <p className="text-xs text-gray-500 truncate">{conv.topic || `${conv.message_count || 0} Nachrichten`}</p>
                    </div>
                    <span className="text-xs text-gray-600">{conv.message_count || 0} 💬</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <BottomNav user={user} />
    </div>
  );
}