import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CalendarDays, Plus, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';
import NextHeader from '@/components/navigation/NextHeader';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import DayDetail from '@/components/calendar/DayDetail';
import AddEntrySheet from '@/components/calendar/AddEntrySheet';
import CalendarStats from '@/components/calendar/CalendarStats';
import { useUserLevel } from '@/components/gamification/useUserLevel';

export default function Calendar() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({ queryKey: ['user'], queryFn: () => base44.auth.me() });
  const { addXP, spendCoins } = useUserLevel(user?.email);

  // Fetch all entries for current month ±1 month range
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['calendar-entries', user?.email],
    queryFn: () => base44.entities.CalendarEntry.filter({ user_email: user.email }, 'date', 500),
    enabled: !!user
  });

  // Also sync job tasks as calendar entries
  const { data: jobTasks = [] } = useQuery({
    queryKey: ['all-job-tasks', user?.email],
    queryFn: () => base44.entities.JobTask.filter({ user_email: user.email }, '-created_date', 100),
    enabled: !!user
  });

  // Merge job tasks into calendar view
  const allEntries = useMemo(() => {
    const jobCalEntries = jobTasks
      .filter(t => t.deadline && (t.status === 'offen' || t.status === 'in_arbeit'))
      .map(t => ({
        id: `jt-${t.id}`,
        _isJobTask: true,
        _jobTaskId: t.id,
        title: t.title,
        description: t.description,
        date: t.deadline.split('T')[0],
        entry_type: 'job_task',
        status: t.status === 'erledigt' ? 'erledigt' : 'offen',
        priority: t.priority || 'mittel',
        reward_coins: t.reward_coins || 10,
        reward_xp: t.reward_xp || 15,
        penalty_coins: 5,
        penalty_xp: 3,
        emoji: t.emoji || '💼',
        from_manager: t.from_manager,
      }));
    return [...entries, ...jobCalEntries];
  }, [entries, jobTasks]);

  const selectedDayEntries = allEntries.filter(e => e.date === selectedDate);

  const handleChangeMonth = (delta) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const addEntryMutation = useMutation({
    mutationFn: (data) => base44.entities.CalendarEntry.create({ ...data, user_email: user.email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
      setShowAddSheet(false);
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (entry) => {
      if (entry._isJobTask) {
        await base44.entities.JobTask.update(entry._jobTaskId, { status: 'erledigt' });
      } else {
        await base44.entities.CalendarEntry.update(entry.id, { status: 'erledigt' });
      }
      // Award rewards
      if (addXP) addXP({ xp: entry.reward_xp || 10, coins: entry.reward_coins || 5 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
      queryClient.invalidateQueries({ queryKey: ['all-job-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['job-tasks'] });
    }
  });

  const missMutation = useMutation({
    mutationFn: async (entry) => {
      if (entry._isJobTask) {
        await base44.entities.JobTask.update(entry._jobTaskId, { status: 'abgelaufen' });
      } else {
        await base44.entities.CalendarEntry.update(entry.id, { status: 'verpasst' });
      }
      // Apply penalty
      if (spendCoins && (entry.penalty_coins || 0) > 0) {
        await spendCoins(entry.penalty_coins).catch(() => {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
      queryClient.invalidateQueries({ queryKey: ['all-job-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['job-tasks'] });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (entry) => {
      if (entry._isJobTask) return Promise.resolve();
      return base44.entities.CalendarEntry.update(entry.id, { status: 'abgesagt' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar-entries'] })
  });

  // Auto-generate entries from jobs
  const generateMutation = useMutation({
    mutationFn: async () => {
      const jobs = await base44.entities.UserJob.filter({ user_email: user.email, status: 'aktiv' });
      if (jobs.length === 0) return;
      const job = jobs[Math.floor(Math.random() * jobs.length)];

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${job.manager_name} von ${job.employer}. Der User arbeitet als "${job.job_title}".
Generiere einen Termin/eine Aufgabe für die nächsten 1-5 Tage.
Es soll realistisch und zum Job passend sein (Meeting, Deadline, Abgabe, etc.)`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            days_from_now: { type: "number" },
            time: { type: "string" },
            priority: { type: "string", enum: ["niedrig", "mittel", "hoch", "dringend"] },
            entry_type: { type: "string", enum: ["termin", "aufgabe"] },
            reward_coins: { type: "number" },
            reward_xp: { type: "number" },
            emoji: { type: "string" }
          }
        }
      });

      const date = new Date();
      date.setDate(date.getDate() + (result.days_from_now || 2));

      await base44.entities.CalendarEntry.create({
        user_email: user.email,
        title: result.title,
        description: result.description,
        date: date.toISOString().split('T')[0],
        time: result.time || null,
        entry_type: result.entry_type || 'termin',
        priority: result.priority || 'mittel',
        reward_coins: result.reward_coins || 10,
        reward_xp: result.reward_xp || 15,
        penalty_coins: Math.round((result.reward_coins || 10) * 0.5),
        penalty_xp: Math.round((result.reward_xp || 15) * 0.3),
        emoji: result.emoji || '📅',
        related_job_id: job.id,
        status: 'offen'
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['calendar-entries'] })
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-teal-500/3 rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-10 glass border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <NextHeader />
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-bold text-white">Kalender</h1>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8"
            >
              {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAddSheet(true)}
              className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto pt-4 pb-24 relative z-[1]">
        {/* Stats */}
        <CalendarStats entries={allEntries} />

        {/* Calendar Grid */}
        <CalendarGrid
          currentMonth={currentMonth}
          currentYear={currentYear}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onChangeMonth={handleChangeMonth}
          entries={allEntries}
        />

        {/* Day Detail */}
        <DayDetail
          date={selectedDate}
          entries={selectedDayEntries}
          onComplete={(entry) => completeMutation.mutate(entry)}
          onMiss={(entry) => missMutation.mutate(entry)}
          onCancel={(entry) => cancelMutation.mutate(entry)}
        />
      </main>

      {/* Add Entry Sheet */}
      <AnimatePresence>
        {showAddSheet && (
          <AddEntrySheet
            date={selectedDate}
            onClose={() => setShowAddSheet(false)}
            onAdd={(data) => addEntryMutation.mutate(data)}
            isSaving={addEntryMutation.isPending}
          />
        )}
      </AnimatePresence>

      <BottomNav user={user} />
    </div>
  );
}