import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, MessageCircle, Heart, MapPin, Calendar, Music, Briefcase, Grid, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import MoodBadge from '@/components/character/MoodBadge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function CharacterSocial() {
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('characterId');
  const [activeTab, setActiveTab] = useState('posts');

  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      const chars = await base44.entities.Character.filter({ id: characterId });
      return chars[0];
    },
    enabled: !!characterId
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['character-posts', characterId],
    queryFn: () => base44.entities.Post.filter({ character_id: characterId }, '-created_date'),
    enabled: !!characterId
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages-count', characterId],
    queryFn: () => base44.entities.ChatMessage.filter({ character_id: characterId }),
    enabled: !!characterId
  });

  const { data: memories = [] } = useQuery({
    queryKey: ['memories-count', characterId],
    queryFn: () => base44.entities.CharacterMemory.filter({ character_id: characterId }),
    enabled: !!characterId
  });

  const { data: location } = useQuery({
    queryKey: ['character-location', characterId],
    queryFn: async () => {
      const locs = await base44.entities.CharacterLocation.filter({ character_id: characterId }, '-created_date', 1);
      return locs[0] || null;
    },
    enabled: !!characterId
  });

  if (!character) return null;

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3 p-3">
          <button onClick={() => window.history.back()}>
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <h1 className="text-base font-bold">{character.name}</h1>
        </div>
      </header>

      {/* Profile Section */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start gap-4">
          <img
            src={character.avatar_url || defaultAvatar}
            alt={character.name}
            className="w-20 h-20 rounded-full object-cover ring-2 ring-emerald-500/30"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold">{character.name}</h2>
              {character.current_mood && <MoodBadge mood={character.current_mood} size="sm" />}
            </div>
            {character.occupation && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> {character.occupation}
              </p>
            )}
            {location && (
              <p className="text-xs text-blue-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" /> {location.emoji} {location.location_name}
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-gray-300 mt-3 leading-relaxed">
          {character.status || character.personality?.slice(0, 150) + '...'}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {character.category && (
            <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30 text-[10px]">
              {character.category}
            </Badge>
          )}
          {character.gender && (
            <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30 text-[10px]">
              {character.gender}
            </Badge>
          )}
          {character.age && (
            <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-[10px]">
              {character.age}
            </Badge>
          )}
          {character.zodiac_sign && (
            <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30 text-[10px]">
              {character.zodiac_sign}
            </Badge>
          )}
          {character.mbti_type && (
            <Badge className="bg-pink-600/20 text-pink-400 border-pink-600/30 text-[10px]">
              {character.mbti_type}
            </Badge>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="text-center">
            <p className="text-lg font-bold">{posts.length}</p>
            <p className="text-[10px] text-gray-500">Beiträge</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{messages.length}</p>
            <p className="text-[10px] text-gray-500">Nachrichten</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{memories.length}</p>
            <p className="text-[10px] text-gray-500">Erinnerungen</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{character.trust_level || 5}</p>
            <p className="text-[10px] text-gray-500">Vertrauen</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Link to={createPageUrl(`Chat?characterId=${characterId}`)} className="flex-1">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 h-9 text-sm">
              <MessageCircle className="w-4 h-4 mr-1.5" />
              Nachricht
            </Button>
          </Link>
          <Link to={createPageUrl(`CharacterInfo?characterId=${characterId}`)} className="flex-1">
            <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/10 h-9 text-sm">
              Profil
            </Button>
          </Link>
        </div>

        {/* Current Song */}
        {character.current_song && (
          <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-[#1DB954]/10 border border-[#1DB954]/20">
            <Music className="w-4 h-4 text-[#1DB954]" />
            <span className="text-xs text-[#1DB954]">🎧 {character.current_song}</span>
          </div>
        )}
      </div>

      <Separator className="bg-white/5" />

      {/* Tab Bar */}
      <div className="flex border-b border-white/5">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === 'posts' ? 'text-white border-b-2 border-emerald-500' : 'text-gray-500'}`}
        >
          <Grid className="w-4 h-4 mx-auto" />
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === 'about' ? 'text-white border-b-2 border-emerald-500' : 'text-gray-500'}`}
        >
          <BookOpen className="w-4 h-4 mx-auto" />
        </button>
      </div>

      {/* Content */}
      <div className="pb-20">
        {activeTab === 'posts' && (
          posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-0.5">
              {posts.map(post => (
                <div key={post.id} className="aspect-square bg-[#1a1a1a] relative overflow-hidden">
                  {post.image_url ? (
                    <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <p className="text-[10px] text-gray-400 text-center line-clamp-4">{post.content}</p>
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5">
                    <Heart className="w-2.5 h-2.5 text-white" />
                    <span className="text-[9px] text-white">{post.likes_count || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Grid className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Noch keine Beiträge</p>
            </div>
          )
        )}

        {activeTab === 'about' && (
          <div className="p-4 space-y-4">
            {character.biography && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 mb-1">Biografie</h3>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{character.biography}</p>
              </div>
            )}
            {character.interests && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 mb-1">Interessen</h3>
                <p className="text-sm text-gray-300">{character.interests}</p>
              </div>
            )}
            {character.favorite_topics && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 mb-1">Lieblingsthemen</h3>
                <p className="text-sm text-gray-300">{character.favorite_topics}</p>
              </div>
            )}
            {character.values && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 mb-1">Werte</h3>
                <p className="text-sm text-gray-300">{character.values}</p>
              </div>
            )}
            {character.living_situation && (
              <div>
                <h3 className="text-xs font-semibold text-gray-400 mb-1">Wohnsituation</h3>
                <p className="text-sm text-gray-300">{character.living_situation}</p>
              </div>
            )}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 mb-1">Erstellt am</h3>
              <p className="text-sm text-gray-300">
                {character.created_date ? format(new Date(character.created_date), 'dd. MMMM yyyy', { locale: de }) : 'Unbekannt'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}