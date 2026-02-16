import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Music, Film, BookOpen, Headphones } from 'lucide-react';

export default function MusicMediaTab({ formData, setFormData }) {
  const u = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-5">
      <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
        <p className="text-xs text-violet-300">🎵 Musik und Medien machen deinen Charakter lebendiger – er kann darüber sprechen und sie im Chat erwähnen.</p>
      </div>

      {/* Musik */}
      <div className="space-y-1 mb-1">
        <h3 className="text-sm font-semibold text-violet-400 flex items-center gap-2">
          <Music className="w-4 h-4" />
          Musik
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Musikgenres</Label>
          <Input value={formData.music_genres || ''} onChange={e => u('music_genres', e.target.value)} placeholder="Hip-Hop, Rock, Classical, K-Pop..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Lieblingskünstler</Label>
          <Input value={formData.favorite_artists || ''} onChange={e => u('favorite_artists', e.target.value)} placeholder="Linkin Park, Billie Eilish, Bach..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Lieblingssongs</Label>
          <Input value={formData.favorite_songs || ''} onChange={e => u('favorite_songs', e.target.value)} placeholder="z.B. Numb, Bohemian Rhapsody..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Aktueller Ohrwurm</Label>
          <Input value={formData.current_song || ''} onChange={e => u('current_song', e.target.value)} placeholder="Song den er gerade hört..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Musik & Stimmung</Label>
        <Textarea value={formData.music_mood_link || ''} onChange={e => u('music_mood_link', e.target.value)} placeholder="z.B. 'Hört bei Traurigkeit immer Radiohead, bei guter Laune Dua Lipa. Musik ist sein Ventil.'" className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
        <p className="text-xs text-gray-500">Wie beeinflusst Musik die Stimmung des Charakters?</p>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Spotify-Playlists</Label>
        <Input value={formData.spotify_playlists || ''} onChange={e => u('spotify_playlists', e.target.value)} placeholder="z.B. 'Sad Hours', 'Workout Beast', 'Late Night Vibes'" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
      </div>

      {/* Filme & Serien */}
      <div className="space-y-1 mt-4 mb-1">
        <h3 className="text-sm font-semibold text-violet-400 flex items-center gap-2">
          <Film className="w-4 h-4" />
          Filme, Serien & Bücher
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Lieblingsfilme</Label>
          <Textarea value={formData.favorite_movies || ''} onChange={e => u('favorite_movies', e.target.value)} placeholder="Fight Club, Spirited Away, Der Pate..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Lieblingsserien</Label>
          <Textarea value={formData.favorite_shows || ''} onChange={e => u('favorite_shows', e.target.value)} placeholder="Breaking Bad, Attack on Titan, The Office..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">Lieblingsbücher</Label>
          <Textarea value={formData.favorite_books || ''} onChange={e => u('favorite_books', e.target.value)} placeholder="Harry Potter, 1984, Der kleine Prinz..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Lieblingsspiele</Label>
          <Textarea value={formData.favorite_games || ''} onChange={e => u('favorite_games', e.target.value)} placeholder="Minecraft, Elden Ring, Stardew Valley..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300">Podcasts & YouTube</Label>
        <Input value={formData.favorite_podcasts || ''} onChange={e => u('favorite_podcasts', e.target.value)} placeholder="z.B. True Crime Podcasts, Tech-YouTuber, ASMR..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
      </div>
    </div>
  );
}