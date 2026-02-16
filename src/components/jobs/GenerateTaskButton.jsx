import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from 'lucide-react';

export default function GenerateTaskButton({ job, userEmail }) {
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const generateTask = async () => {
    setGenerating(true);

    // Get existing tasks for context
    const existingTasks = await base44.entities.JobTask.filter({ job_id: job.id, user_email: userEmail }, '-created_date', 10);
    const existingTitles = existingTasks.map(t => t.title).join(', ');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Du bist ${job.manager_name}, Manager bei ${job.employer}.
Der User arbeitet als "${job.job_title}".
Jobbeschreibung: ${job.description}

Bereits existierende Aufträge (NICHT wiederholen): ${existingTitles || 'keine'}

Generiere EINEN neuen, realistischen Arbeitsauftrag für den User.
Der Auftrag soll spezifisch, interessant und zum Job passend sein.
${job.employer === 'Linkin Park' ? 'Beziehe dich auf echte Linkin Park Tour-Details, Songs, Bandmitglieder (Mike Shinoda, Emily Armstrong, Brad Delson, Joe Hahn, Dave Farrell, Colin Brittain).' : ''}
${job.employer === 'Dead Sara' ? 'Beziehe dich auf Dead Sara Bandaktivitäten, Songs und Social Media.' : ''}

Der Auftrag kommt von ${job.manager_name} und soll wie eine echte Arbeitsanweisung klingen.
Deadline: Innerhalb der nächsten 1-7 Tage.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string", description: "Kurzer Aufgabentitel (max 50 Zeichen)" },
          description: { type: "string", description: "Detaillierte Beschreibung (2-4 Sätze) – wie eine echte Nachricht vom Manager" },
          priority: { type: "string", enum: ["niedrig", "mittel", "hoch", "dringend"] },
          category: { type: "string", enum: ["planung", "kommunikation", "logistik", "kreativ", "finanzen", "recherche", "organisation", "andere"] },
          reward_coins: { type: "number", description: "Belohnung 5-50 Coins, je nach Aufwand" },
          reward_xp: { type: "number", description: "XP-Belohnung 10-50, je nach Aufwand" },
          deadline_days: { type: "number", description: "Deadline in Tagen (1-7)" },
          emoji: { type: "string", description: "Passendes Emoji für die Aufgabe" }
        }
      }
    });

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + (result.deadline_days || 3));

    await base44.entities.JobTask.create({
      job_id: job.id,
      user_email: userEmail,
      title: result.title,
      description: result.description,
      from_manager: job.manager_name,
      status: 'offen',
      priority: result.priority || 'mittel',
      category: result.category || 'andere',
      reward_coins: result.reward_coins || 15,
      reward_xp: result.reward_xp || 20,
      deadline: deadline.toISOString(),
      emoji: result.emoji || '📋'
    });

    queryClient.invalidateQueries({ queryKey: ['job-tasks', job.id] });
    setGenerating(false);
  };

  return (
    <Button
      onClick={generateTask}
      disabled={generating}
      className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl text-sm font-medium"
    >
      {generating ? (
        <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Auftrag wird generiert...</>
      ) : (
        <><Sparkles className="w-4 h-4 mr-2" /> Neuen Auftrag von {job.manager_name}</>
      )}
    </Button>
  );
}