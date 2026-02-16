import React, { useState, useEffect } from 'react';
import { Music, Disc3, Headphones, Radio, ExternalLink, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function SpotifyEmbed({ query }) {
  const searchUrl = `spotify:search:${encodeURIComponent(query)}`;
  return (
    <a 
      href={searchUrl}
      className="flex items-center gap-2 text-xs text-[#1DB954] hover:underline"
    >
      <ExternalLink className="w-3 h-3" />
      Auf Spotify suchen
    </a>
  );
}

function NowPlaying({ song, characterName }) {
  if (!song) return null;
  const parts = song.split(' - ');
  const title = parts[0]?.trim();
  const artist = parts[1]?.trim() || '';
  
  return (
    <div className="bg-gradient-to-r from-[#1DB954]/10 to-[#191414]/50 border border-[#1DB954]/20 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-lg bg-[#1DB954]/20 flex items-center justify-center">
            <Disc3 className="w-6 h-6 text-[#1DB954] animate-[spin_3s_linear_infinite]" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#1DB954] rounded-full animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-[#1DB954] font-semibold uppercase tracking-wider">Hört gerade</p>
          <p className="text-sm font-semibold text-white truncate">{title}</p>
          {artist && <p className="text-xs text-gray-400 truncate">{artist}</p>}
        </div>
        <SpotifyEmbed query={song} />
      </div>
    </div>
  );
}

function SongItem({ song, index }) {
  const parts = song.trim().split(' - ');
  const title = parts[0]?.trim();
  const artist = parts[1]?.trim() || '';
  
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors group">
      <span className="text-xs text-gray-500 w-5 text-right">{index + 1}</span>
      <div className="w-8 h-8 rounded bg-[#262626] flex items-center justify-center group-hover:bg-[#1DB954]/20 transition-colors">
        <Music className="w-4 h-4 text-gray-500 group-hover:text-[#1DB954] transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{title}</p>
        {artist && <p className="text-xs text-gray-500 truncate">{artist}</p>}
      </div>
      <a 
        href={`spotify:search:${encodeURIComponent(song.trim())}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ExternalLink className="w-3.5 h-3.5 text-gray-500 hover:text-[#1DB954]" />
      </a>
    </div>
  );
}

function ArtistChip({ artist }) {
  return (
    <a 
      href={`spotify:search:${encodeURIComponent(artist.trim())}`}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#262626] hover:bg-[#1DB954]/15 border border-white/5 hover:border-[#1DB954]/30 transition-all text-sm text-gray-300 hover:text-white"
    >
      <Headphones className="w-3 h-3 text-[#1DB954]" />
      {artist.trim()}
    </a>
  );
}

export default function SpotifyMusicPanel({ character }) {
  const [generatedMusic, setGeneratedMusic] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSong, setCurrentSong] = useState(character.current_song);
  const [isChangingSong, setIsChangingSong] = useState(false);

  const hasMusic = character.favorite_artists || character.favorite_songs || character.current_song || character.music_genres;

  // Auto-rotate current song on mount
  useEffect(() => {
    if (!hasMusic || !character.id) return;
    const shouldRotate = Math.random() < 0.6; // 60% chance to change song
    if (!shouldRotate) return;
    
    let cancelled = false;
    const rotateSong = async () => {
      setIsChangingSong(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist "${character.name}". Stimmung: ${character.current_mood || character.mood_default || 'neutral'}. Persönlichkeit: ${(character.personality || '').slice(0, 150)}. Lieblingskünstler: ${character.favorite_artists || 'verschiedene'}. Lieblingsgenres: ${character.music_genres || 'verschiedene'}. Lieblingssongs: ${character.favorite_songs || 'verschiedene'}.

Welchen ECHTEN Song hörst du gerade? Wähle einen passenden Song basierend auf deiner aktuellen Stimmung. Es kann ein Song von deinen Lieblingskünstlern sein, oder auch mal etwas anderes das zur Stimmung passt. Gib NUR einen Song zurück.`,
        response_json_schema: {
          type: "object",
          properties: {
            song: { type: "string", description: "Format: Songname - Künstler" }
          }
        }
      });
      if (cancelled) return;
      if (result?.song) {
        setCurrentSong(result.song);
        await base44.entities.Character.update(character.id, { current_song: result.song });
      }
      setIsChangingSong(false);
    };
    rotateSong();
    return () => { cancelled = true; };
  }, [character.id]);

  const handleGenerateMusic = async () => {
    setIsGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Du bist "${character.name}". Persönlichkeit: ${character.personality?.slice(0, 200) || ''}.
Interessen: ${character.interests || 'keine angegeben'}. Stimmung: ${character.current_mood || character.mood_default || 'neutral'}. Alter: ${character.age || 'unbekannt'}.

Erstelle eine realistische Musiksammlung für diesen Charakter. Verwende ECHTE Künstler und Songs die zu dieser Persönlichkeit passen.`,
      response_json_schema: {
        type: "object",
        properties: {
          current_song: { type: "string", description: "Ein Song den der Charakter gerade hört (Format: Song - Künstler)" },
          favorite_artists: { type: "string", description: "5-8 echte Lieblingskünstler, kommasepariert" },
          favorite_songs: { type: "string", description: "6-10 echte Lieblingssongs (Format: Song - Künstler), kommasepariert" },
          music_genres: { type: "string", description: "3-5 Genres, kommasepariert" }
        }
      }
    });
    setGeneratedMusic(result);
    await base44.entities.Character.update(character.id, {
      current_song: result.current_song,
      favorite_artists: result.favorite_artists,
      favorite_songs: result.favorite_songs,
      music_genres: result.music_genres
    });
    setIsGenerating(false);
  };

  const data = generatedMusic || character;
  const artists = data.favorite_artists ? data.favorite_artists.split(',').filter(a => a.trim()) : [];
  const songs = data.favorite_songs ? data.favorite_songs.split(',').filter(s => s.trim()) : [];
  const genres = data.music_genres ? data.music_genres.split(',').filter(g => g.trim()) : [];

  return (
    <div className="space-y-4">
      {/* Spotify Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#1DB954] flex items-center justify-center">
            <Music className="w-3.5 h-3.5 text-black" />
          </div>
          <span className="text-sm font-semibold text-[#1DB954]">Musik</span>
        </div>
        {!hasMusic && !generatedMusic && (
          <Button
            size="sm"
            onClick={handleGenerateMusic}
            disabled={isGenerating}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-semibold"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Music className="w-3.5 h-3.5 mr-1.5" />
            )}
            Musik generieren
          </Button>
        )}
      </div>

      {/* Now Playing */}
      <NowPlaying song={data.current_song} characterName={character.name} />

      {/* Genres */}
      {genres.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Genres</p>
          <div className="flex flex-wrap gap-1.5">
            {genres.map((genre, i) => (
              <Badge key={i} className="bg-[#262626] text-gray-300 border border-white/5 hover:border-[#1DB954]/30 text-xs">
                {genre.trim()}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Artists */}
      {artists.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Lieblingskünstler</p>
          <div className="flex flex-wrap gap-2">
            {artists.map((artist, i) => (
              <ArtistChip key={i} artist={artist} />
            ))}
          </div>
        </div>
      )}

      {/* Favorite Songs */}
      {songs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Lieblingssongs</p>
          <div className="bg-[#1a1a1a] rounded-xl border border-white/5 divide-y divide-white/5">
            {songs.map((song, i) => (
              <SongItem key={i} song={song} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasMusic && !generatedMusic && !isGenerating && (
        <div className="text-center py-6 text-gray-500">
          <Radio className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Noch keine Musik hinterlegt.</p>
          <p className="text-xs mt-1">Klicke auf "Musik generieren" für passende Vorschläge.</p>
        </div>
      )}

      {isGenerating && (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 text-[#1DB954] animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500">Musikgeschmack wird analysiert...</p>
        </div>
      )}
    </div>
  );
}