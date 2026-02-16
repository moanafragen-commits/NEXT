import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, BookOpen, MessageCircle, Settings, Sparkles, Plus, Brain, Heart, Target, TrendingUp, Dumbbell, Camera, Upload, Loader2, Music, CalendarHeart, Gift, Home, Trophy, BarChart3, Gamepad2, MapPin, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from 'framer-motion';
import EditMemoryModal from '@/components/memory/EditMemoryModal';
import MemoryList from '@/components/memory/MemoryList';
import MoodBadge from '@/components/character/MoodBadge';
import RelationshipPanel from '@/components/character/RelationshipPanel';
import MoodMotivationPanel from '@/components/character/MoodMotivationPanel';
import SpotifyMusicPanel from '@/components/character/SpotifyMusicPanel';
import ActivityFeed from '@/components/character/ActivityFeed';
import ImportantDatesPanel from '@/components/character/ImportantDatesPanel';
import DailySchedulePanel from '@/components/character/DailySchedulePanel';
import GiftSystem from '@/components/character/GiftSystem';
import CharacterRoomView from '@/components/character/CharacterRoomView';
import AchievementDisplay from '@/components/character/AchievementSystem';
import RelationshipStats from '@/components/character/RelationshipStats';
import MiniGames from '@/components/character/MiniGames';
import LocationSharing from '@/components/character/LocationSharing';

export default function CharacterInfo() {
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('characterId');
  const queryClient = useQueryClient();
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  
  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      const chars = await base44.entities.Character.filter({ id: characterId });
      return chars[0];
    },
    enabled: !!characterId
  });
  
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', characterId],
    queryFn: () => base44.entities.ChatMessage.filter({ character_id: characterId }),
    enabled: !!characterId
  });
  
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: memories = [] } = useQuery({
    queryKey: ['memories', characterId],
    queryFn: () => base44.entities.CharacterMemory.filter({ character_id: characterId }),
    enabled: !!characterId
  });
  
  const handleEditMemory = (memory) => {
    setEditingMemory(memory);
    setShowMemoryModal(true);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !character) return;
    setIsUploadingAvatar(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Character.update(character.id, { avatar_url: file_url });
    queryClient.invalidateQueries({ queryKey: ['character', characterId] });
    queryClient.invalidateQueries({ queryKey: ['characters'] });
    setIsUploadingAvatar(false);
  };

  const handleGenerateAvatar = async () => {
    if (!character) return;
    setIsGeneratingAvatar(true);
    const genderHint = character.gender === 'männlich' ? 'male' : character.gender === 'weiblich' ? 'female' : 'androgynous';
    const ageHint = character.age ? `${character.age} years old` : 'young adult';
    const result = await base44.integrations.Core.GenerateImage({
      prompt: `Portrait photo of a character named "${character.name}". ${genderHint}, ${ageHint}. ${character.category || ''} ${character.occupation || ''}. High quality, detailed, expressive face, beautiful lighting, cinematic portrait style. ${character.personality ? character.personality.slice(0, 100) : ''}`
    });
    await base44.entities.Character.update(character.id, { avatar_url: result.url });
    queryClient.invalidateQueries({ queryKey: ['character', characterId] });
    queryClient.invalidateQueries({ queryKey: ['characters'] });
    setIsGeneratingAvatar(false);
  };
  
  if (!character) return null;
  
  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;
  

  
  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5 p-4">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl(`Chat?characterId=${characterId}`)}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Charakter-Info</h1>
        </div>
      </header>
      
      <div className="pb-6">
        {/* Avatar & Name Section */}
        <div className="bg-[#1a1a1a] py-8 flex flex-col items-center">
          <div className="relative group mb-4">
            <img 
              src={character.avatar_url || defaultAvatar}
              alt={character.name}
              className="w-32 h-32 rounded-full object-cover ring-4 ring-emerald-500/30"
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              {isUploadingAvatar ? (
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUploadingAvatar}
              />
            </label>
          </div>
          <div className="flex gap-2 mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateAvatar}
              disabled={isGeneratingAvatar}
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs"
            >
              {isGeneratingAvatar ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              )}
              Avatar generieren
            </Button>
          </div>
          <h2 className="text-2xl font-bold">{character.name}</h2>
          <p className="text-gray-400 mt-1">{character.status || 'Kein Status'}</p>
          <div className="flex items-center gap-2 mt-3">
            <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">
              {character.category}
            </Badge>
            {character.current_mood && <MoodBadge mood={character.current_mood} />}
          </div>
        </div>
        
        <Separator className="bg-white/5" />
        
        {/* Stats */}
        <div className="bg-[#1a1a1a] py-4 px-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{messages.length}</div>
            <div className="text-xs text-gray-500">Nachrichten</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{memories.length}</div>
            <div className="text-xs text-gray-500">Erinnerungen</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{character.creativity || 50}%</div>
            <div className="text-xs text-gray-500">Kreativität</div>
          </div>
        </div>
        
        <Separator className="bg-white/5" />
        
        {/* Personality Section */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold">Persönlichkeit</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {character.personality}
          </p>
        </div>
        
        {character.biography && (
          <>
            <Separator className="bg-white/5" />
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-semibold">Biografie</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {character.biography}
              </p>
            </div>
          </>
        )}
        
        <Separator className="bg-white/5" />
        
        {/* Mood & Motivation */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Target className="w-5 h-5" />
            <h3 className="font-semibold">Stimmung & Ziele</h3>
          </div>
          <MoodMotivationPanel character={character} />
        </div>

        <Separator className="bg-white/5" />
        
        {/* Relationship */}
        {user && (
          <>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Heart className="w-5 h-5" />
                <h3 className="font-semibold">Beziehung definieren</h3>
              </div>
              <RelationshipPanel 
                characterId={characterId}
                userEmail={user.email}
                memories={memories}
              />
            </div>
            <Separator className="bg-white/5" />
          </>
        )}

        {/* Spotify / Music Section */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#1DB954]">
            <Music className="w-5 h-5" />
            <h3 className="font-semibold">Spotify & Musik</h3>
          </div>
          <SpotifyMusicPanel character={character} />
        </div>

        <Separator className="bg-white/5" />

        {/* Important Dates */}
        {user && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-pink-400">
              <CalendarHeart className="w-5 h-5" />
              <h3 className="font-semibold">Wichtige Daten & Ereignisse</h3>
            </div>
            <ImportantDatesPanel characterId={characterId} userEmail={user.email} />
          </div>
        )}

        <Separator className="bg-white/5" />

        {/* Daily Activities */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-semibold">Tagesaktivitäten</h3>
          </div>
          <ActivityFeed characterId={characterId} />
        </div>

        <Separator className="bg-white/5" />

        {/* Development & Diary Links */}
        <div className="px-6 py-4 space-y-3">
          <Link to={createPageUrl(`CharacterDiary?characterId=${characterId}`)}>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white mb-3">
              <BookOpen className="w-4 h-4 mr-2" />
              Tagebuch lesen
            </Button>
          </Link>
          <Link to={createPageUrl(`CharacterDevelopment?characterId=${characterId}`)}>
            <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Charakterentwicklung ansehen
            </Button>
          </Link>
        </div>

        <Separator className="bg-white/5" />

        {/* Behavior Settings */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Settings className="w-5 h-5" />
            <h3 className="font-semibold">Verhaltenseinstellungen</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Schreibstil</span>
              <span className="text-white capitalize">{character.writing_style}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Antwortlänge</span>
              <span className="text-white capitalize">{character.response_length}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Sprache</span>
              <span className="text-white">{character.language_preference}</span>
            </div>
          </div>
        </div>
        
        {/* Memories Section */}
        <Separator className="bg-white/5" />
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <Brain className="w-5 h-5" />
              <h3 className="font-semibold">Erinnerungen & Beziehung</h3>
            </div>
            <div className="flex items-center gap-2">
              <Link to={createPageUrl(`MemoryTraining?characterId=${characterId}`)}>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Dumbbell className="w-4 h-4 mr-1.5" />
                  Training
                </Button>
              </Link>
              <Button
                onClick={() => { setEditingMemory(null); setShowMemoryModal(true); }}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Hinzufügen
              </Button>
            </div>
          </div>
          
          {memories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Noch keine Erinnerungen vorhanden.</p>
              <p className="text-xs mt-1">Definiere deine Beziehung zu {character.name}.</p>
            </div>
          ) : (
            <MemoryList 
              memories={memories} 
              characterId={characterId}
              onEdit={handleEditMemory}
            />
          )}
        </div>
        
        {character.greeting && (
          <>
            <Separator className="bg-white/5" />
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-semibold">Begrüßung</h3>
              </div>
              <p className="text-gray-300 text-sm italic">"{character.greeting}"</p>
            </div>
          </>
        )}
      </div>

      {user && (
        <EditMemoryModal
          open={showMemoryModal}
          onClose={() => { setShowMemoryModal(false); setEditingMemory(null); }}
          memory={editingMemory}
          characterId={characterId}
          userEmail={user.email}
        />
      )}
    </div>
  );
}