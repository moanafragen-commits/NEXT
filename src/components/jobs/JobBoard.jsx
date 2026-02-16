import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Briefcase, ChevronRight, Star, Coins, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const AVAILABLE_JOBS = [
  {
    job_title: 'Tour Assistant',
    employer: 'Linkin Park',
    manager_name: 'Bill Silva',
    description: 'Unterstütze Bill Silva bei der Planung und Organisation der Linkin Park Welttournee. Koordiniere Venues, Logistik, Setlists und Backstage-Anforderungen.',
    category: 'musik',
    salary_coins: 25,
    xp_reward: 30,
    icon_emoji: '🎸'
  },
  {
    job_title: 'Social Media Manager',
    employer: 'Dead Sara',
    manager_name: 'Emily Armstrong',
    description: 'Manage die Social-Media-Kanäle von Dead Sara. Poste Updates, interagiere mit Fans und plane Content rund um Konzerte und Releases.',
    category: 'medien',
    salary_coins: 20,
    xp_reward: 25,
    icon_emoji: '📱'
  },
  {
    job_title: 'Event Koordinator',
    employer: 'Live Nation',
    manager_name: 'Sarah Chen',
    description: 'Koordiniere Großevents und Festivals. Arbeite mit Künstlern, Technikern und Sicherheitsteams zusammen.',
    category: 'entertainment',
    salary_coins: 30,
    xp_reward: 35,
    icon_emoji: '🎪'
  },
  {
    job_title: 'Merch Designer',
    employer: 'Warner Music',
    manager_name: 'Alex Kramer',
    description: 'Entwirf Merchandise-Designs für verschiedene Bands. Von T-Shirts bis Poster – deine Kreativität ist gefragt.',
    category: 'kreativ',
    salary_coins: 20,
    xp_reward: 20,
    icon_emoji: '🎨'
  },
  {
    job_title: 'Roadie / Technik-Assistent',
    employer: 'Linkin Park',
    manager_name: 'Joe Hahn',
    description: 'Hilf beim Aufbau, Soundcheck und der Technik auf der Bühne. Sorge dafür, dass die Show reibungslos läuft.',
    category: 'musik',
    salary_coins: 15,
    xp_reward: 20,
    icon_emoji: '🔊'
  }
];

const CATEGORY_COLORS = {
  musik: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  medien: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  entertainment: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  kreativ: 'from-rose-500/20 to-red-500/20 border-rose-500/30',
  management: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
  andere: 'from-gray-500/20 to-slate-500/20 border-gray-500/30',
};

export default function JobBoard({ userEmail }) {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState(null);

  const { data: activeJobs = [] } = useQuery({
    queryKey: ['user-jobs', userEmail],
    queryFn: () => base44.entities.UserJob.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const acceptJobMutation = useMutation({
    mutationFn: async (job) => {
      const createdJob = await base44.entities.UserJob.create({
        user_email: userEmail,
        job_title: job.job_title,
        employer: job.employer,
        manager_name: job.manager_name,
        description: job.description,
        category: job.category,
        salary_coins: job.salary_coins,
        xp_reward: job.xp_reward,
        icon_emoji: job.icon_emoji,
        status: 'aktiv'
      });

      // Auto-generate initial calendar entries for this job
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${job.manager_name} von ${job.employer}. Ein neuer Mitarbeiter wurde als "${job.job_title}" eingestellt.
Jobbeschreibung: ${job.description}

Generiere 3-5 realistische Termine/Aufgaben für die erste Arbeitswoche (nächste 7 Tage).
Es sollte eine Mischung sein aus:
- Einführungstreffen / Onboarding
- Erste echte Aufgaben passend zum Job
- Meetings mit dem Manager
- Deadlines für erste Abgaben

Jeder Eintrag braucht: Titel, Beschreibung, Tag (1-7 = Tage ab heute), Uhrzeit, Priorität, Typ, Belohnung.`,
        response_json_schema: {
          type: "object",
          properties: {
            entries: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  days_from_now: { type: "number" },
                  time: { type: "string", description: "z.B. 10:00" },
                  priority: { type: "string", enum: ["niedrig", "mittel", "hoch", "dringend"] },
                  entry_type: { type: "string", enum: ["termin", "aufgabe"] },
                  reward_coins: { type: "number" },
                  reward_xp: { type: "number" },
                  emoji: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (result.entries && result.entries.length > 0) {
        const calendarEntries = result.entries.map(entry => {
          const date = new Date();
          date.setDate(date.getDate() + (entry.days_from_now || 1));
          return {
            user_email: userEmail,
            title: entry.title,
            description: entry.description || '',
            date: date.toISOString().split('T')[0],
            time: entry.time || null,
            entry_type: entry.entry_type || 'termin',
            related_job_id: createdJob.id,
            status: 'offen',
            priority: entry.priority || 'mittel',
            reward_coins: entry.reward_coins || Math.round(job.salary_coins * 0.5),
            reward_xp: entry.reward_xp || Math.round(job.xp_reward * 0.5),
            penalty_coins: Math.round((entry.reward_coins || 5) * 0.5),
            penalty_xp: Math.round((entry.reward_xp || 5) * 0.3),
            emoji: entry.emoji || job.icon_emoji || '💼',
            color: 'purple'
          };
        });
        await base44.entities.CalendarEntry.bulkCreate(calendarEntries);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
      setSelectedJob(null);
      toast.success('Job angenommen! Termine wurden im Kalender erstellt.');
    }
  });

  const activeJobTitles = activeJobs.filter(j => j.status === 'aktiv').map(j => j.job_title);
  const availableJobs = AVAILABLE_JOBS.filter(j => !activeJobTitles.includes(j.job_title));

  return (
    <div className="space-y-4">
      {/* Active Jobs */}
      {activeJobs.filter(j => j.status === 'aktiv').length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Deine Jobs</h3>
          {activeJobs.filter(j => j.status === 'aktiv').map(job => (
            <Link key={job.id} to={createPageUrl(`JobDetail?jobId=${job.id}`)}>
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-2 flex items-center gap-3 hover:border-emerald-500/40 transition-colors">
                <span className="text-2xl">{job.icon_emoji || '💼'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white">{job.job_title}</p>
                  <p className="text-xs text-gray-400">{job.employer} • {job.manager_name}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Available Jobs */}
      {availableJobs.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Verfügbare Jobs</h3>
          <div className="space-y-2">
            {availableJobs.map((job, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedJob(job)}
                className={`bg-gradient-to-r ${CATEGORY_COLORS[job.category] || CATEGORY_COLORS.andere} border rounded-2xl p-4 cursor-pointer hover:scale-[1.01] transition-transform`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{job.icon_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white">{job.job_title}</p>
                    <p className="text-xs text-gray-400">{job.employer} • Manager: {job.manager_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-amber-400 font-medium">🪙 {job.salary_coins}/Auftrag</p>
                    <p className="text-[10px] text-emerald-400">+{job.xp_reward} XP</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      <AnimatePresence>
        {selectedJob && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setSelectedJob(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1a] rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
            >
              <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
              <div className="text-center mb-4">
                <span className="text-4xl">{selectedJob.icon_emoji}</span>
                <h2 className="text-xl font-bold text-white mt-2">{selectedJob.job_title}</h2>
                <p className="text-gray-400 text-sm">{selectedJob.employer}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 mb-4">
                <p className="text-sm text-gray-300 leading-relaxed">{selectedJob.description}</p>
              </div>
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-center">
                  <p className="text-lg font-bold text-amber-400">🪙 {selectedJob.salary_coins}</p>
                  <p className="text-[10px] text-gray-500">Coins/Auftrag</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-400">⭐ {selectedJob.xp_reward}</p>
                  <p className="text-[10px] text-gray-500">XP/Auftrag</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-400">👤 {selectedJob.manager_name}</p>
                  <p className="text-[10px] text-gray-500">Manager</p>
                </div>
              </div>
              <Button
                onClick={() => acceptJobMutation.mutate(selectedJob)}
                disabled={acceptJobMutation.isPending}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-base font-semibold"
              >
                {acceptJobMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Termine werden erstellt...
                  </span>
                ) : 'Job annehmen'}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}