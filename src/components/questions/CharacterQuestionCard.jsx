import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send, SkipForward } from 'lucide-react';

export default function CharacterQuestionCard({ characterId, userEmail, characterName, personality }) {
  const [answer, setAnswer] = useState('');
  const [reaction, setReaction] = useState(null);
  const queryClient = useQueryClient();

  const { data: pendingQuestions = [] } = useQuery({
    queryKey: ['character-questions', characterId, 'pending'],
    queryFn: () => base44.entities.CharacterQuestion.filter({ 
      character_id: characterId, 
      user_email: userEmail, 
      status: 'pending' 
    }),
    enabled: !!characterId && !!userEmail
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const answered = await base44.entities.CharacterQuestion.filter({ 
        character_id: characterId, user_email: userEmail, status: 'answered' 
      });
      const answeredQuestions = answered.map(q => q.question).join(', ');
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${characterName} (${personality}).
Stelle dem Nutzer eine persönliche Frage, die du wirklich wissen willst.
Die Frage sollte authentisch zu deiner Persönlichkeit passen.
Bereits gestellte Fragen: ${answeredQuestions || 'keine'}
Stelle KEINE dieser Fragen erneut. Sei kreativ.`,
        response_json_schema: {
          type: "object",
          properties: {
            question: { type: "string" },
            category: { type: "string", enum: ["persönlich", "philosophisch", "lustig", "deep_talk", "alltag", "beziehung", "träume", "vergangenheit", "zukunft"] },
            emoji: { type: "string" }
          }
        }
      });

      return base44.entities.CharacterQuestion.create({
        character_id: characterId,
        user_email: userEmail,
        question: result.question,
        category: result.category || 'persönlich',
        emoji: result.emoji || '🔮',
        status: 'pending'
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['character-questions', characterId, 'pending'] })
  });

  const answerMutation = useMutation({
    mutationFn: async ({ questionId, userAnswer }) => {
      const q = pendingQuestions.find(q => q.id === questionId);
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${characterName} (${personality}).
Du hast gefragt: "${q.question}"
Der Nutzer antwortet: "${userAnswer}"
Reagiere authentisch (1-2 Sätze). Merke dir die Antwort.`,
        response_json_schema: {
          type: "object",
          properties: {
            reaction: { type: "string" },
            emoji: { type: "string" }
          }
        }
      });

      await base44.entities.CharacterQuestion.update(questionId, {
        user_answer: userAnswer,
        character_reaction: result.reaction,
        status: 'answered'
      });

      // Save as memory
      await base44.entities.CharacterMemory.create({
        character_id: characterId,
        user_email: userEmail,
        memory_text: `Auf die Frage "${q.question}" antwortete der Nutzer: "${userAnswer}"`,
        memory_type: 'fact',
        memory_category: 'personal',
        importance_level: 'hoch',
        strength: 85,
        source: 'question'
      });

      return result;
    },
    onSuccess: (result) => {
      setReaction(result);
      setAnswer('');
      queryClient.invalidateQueries({ queryKey: ['character-questions', characterId, 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      setTimeout(() => setReaction(null), 5000);
    }
  });

  const skipMutation = useMutation({
    mutationFn: (questionId) => base44.entities.CharacterQuestion.update(questionId, { status: 'skipped' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['character-questions', characterId, 'pending'] })
  });

  const currentQuestion = pendingQuestions[0];

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {currentQuestion ? (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20"
          >
            <p className="text-sm text-gray-300 mb-1 flex items-center gap-1.5">
              <span>{currentQuestion.emoji}</span>
              <span className="text-purple-400 font-medium">{characterName} fragt:</span>
            </p>
            <p className="text-white font-medium mb-3">"{currentQuestion.question}"</p>
            
            <div className="flex gap-2">
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Deine Antwort..."
                className="bg-white/5 border-white/10 text-white placeholder-gray-500 flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && answer.trim()) {
                    answerMutation.mutate({ questionId: currentQuestion.id, userAnswer: answer });
                  }
                }}
              />
              <Button
                onClick={() => answerMutation.mutate({ questionId: currentQuestion.id, userAnswer: answer })}
                disabled={!answer.trim() || answerMutation.isPending}
                size="icon"
                className="bg-purple-600 hover:bg-purple-500 h-9 w-9"
              >
                {answerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => skipMutation.mutate(currentQuestion.id)}
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-300 h-9 w-9"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            variant="outline"
            className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            {generateMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <span className="mr-2">🔮</span>
            )}
            {characterName} soll dich etwas fragen
          </Button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reaction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20"
          >
            <p className="text-sm text-white">{reaction.emoji} {reaction.reaction}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}