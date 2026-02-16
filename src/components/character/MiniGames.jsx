import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Dices, Sparkles, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const GAMES = [
  { id: 'truth_or_dare', label: 'Wahrheit oder Pflicht', emoji: '🎯', desc: 'Klassiker!' },
  { id: 'would_you_rather', label: 'Würdest du lieber...', emoji: '🤔', desc: 'Schwere Entscheidungen' },
  { id: '20_questions', label: '20 Fragen', emoji: '❓', desc: 'Rate was ich denke' },
  { id: 'story_chain', label: 'Geschichte weiterspinnen', emoji: '📖', desc: 'Abwechselnd erzählen' },
  { id: 'trivia', label: 'Quiz über mich', emoji: '🧠', desc: 'Wie gut kennst du mich?' },
  { id: 'emoji_game', label: 'Emoji-Rätsel', emoji: '😀', desc: 'Errate das Wort' },
];

export default function MiniGames({ character, onSendToChat }) {
  const [activeGame, setActiveGame] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');

  const startGame = async (gameId) => {
    setIsLoading(true);
    setActiveGame(gameId);
    
    const prompts = {
      truth_or_dare: `Du bist ${character.name}. Starte ein "Wahrheit oder Pflicht" Spiel. Frag den User ob er Wahrheit oder Pflicht wählt, und gib direkt beides vor: Eine freche/persönliche Wahrheits-Frage UND eine lustige Pflicht-Aufgabe. Sei kreativ und passend zu deiner Persönlichkeit.`,
      would_you_rather: `Du bist ${character.name}. Stelle eine "Würdest du lieber..." Frage mit zwei schwierigen/lustigen/nachdenklichen Optionen. Sage auch welche du wählen würdest und warum.`,
      '20_questions': `Du bist ${character.name}. Du denkst dir etwas aus (Person, Ding, Ort). Sag dem User dass er 20 Fragen hat um es zu erraten. Du antwortest nur mit Ja/Nein. Sag ihm die Kategorie (Person/Ding/Ort).`,
      story_chain: `Du bist ${character.name}. Starte eine Geschichte mit 2-3 Sätzen. Lass die Geschichte an einer spannenden Stelle enden und fordere den User auf weiterzuerzählen.`,
      trivia: `Du bist ${character.name}. Stelle eine Multiple-Choice Frage über dich selbst (basierend auf deiner Persönlichkeit: ${character.personality?.slice(0, 100)}). 3 Antwortmöglichkeiten, eine richtig.`,
      emoji_game: `Du bist ${character.name}. Beschreibe ein Wort/Film/Song nur mit Emojis und lass den User raten. Gib 3 Hinweise mit steigender Offensichtlichkeit.`,
    };

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${prompts[gameId]}
Schreibstil: ${character.writing_style || 'freundlich'}
Stimmung: ${character.current_mood || 'verspielt'}
Schreibe wie eine echte Chat-Nachricht, nicht formell.`,
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string" }
        }
      }
    });

    setGameResult(response.message);
    setIsLoading(false);
  };

  const sendToChat = () => {
    if (gameResult && onSendToChat) {
      onSendToChat(gameResult);
      setActiveGame(null);
      setGameResult(null);
    }
  };

  if (activeGame && gameResult) {
    return (
      <div className="space-y-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <p className="text-sm text-gray-200 whitespace-pre-wrap">{gameResult}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={sendToChat} size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-500">
            In Chat senden
          </Button>
          <Button onClick={() => { setActiveGame(null); setGameResult(null); }} size="sm" variant="outline" className="border-white/10 text-gray-400">
            Zurück
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          <span className="ml-2 text-sm text-gray-400">{character.name} denkt nach...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {GAMES.map(game => (
            <button
              key={game.id}
              onClick={() => startGame(game.id)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-emerald-500/20 transition-all text-center"
            >
              <span className="text-2xl">{game.emoji}</span>
              <p className="text-xs font-medium text-white">{game.label}</p>
              <p className="text-[10px] text-gray-500">{game.desc}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}