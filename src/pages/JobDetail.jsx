import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Loader2, Briefcase, Coins, Star, XCircle, MessageCircle, ListTodo } from 'lucide-react';
import { Button } from "@/components/ui/button";
import BottomNav from '@/components/navigation/BottomNav';
import TaskList from '@/components/jobs/TaskList';
import GenerateTaskButton from '@/components/jobs/GenerateTaskButton';
import JobChat from '@/components/jobs/JobChat';
import { useUserLevel } from '@/components/gamification/useUserLevel';

export default function JobDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('jobId');
  const [activeTab, setActiveTab] = useState('tasks');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { addXP } = useUserLevel(user?.email);

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const jobs = await base44.entities.UserJob.filter({ id: jobId });
      return jobs[0];
    },
    enabled: !!jobId
  });

  const { data: completedCount = 0 } = useQuery({
    queryKey: ['completed-tasks-count', jobId],
    queryFn: async () => {
      const tasks = await base44.entities.JobTask.filter({ job_id: jobId, status: 'erledigt' });
      return tasks.length;
    },
    enabled: !!jobId
  });

  const quitJobMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.UserJob.update(jobId, { status: 'beendet' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-jobs'] });
      window.location.href = createPageUrl('Jobs');
    }
  });

  const handleTaskComplete = async (task) => {
    if (addXP) {
      addXP({ xp: task.reward_xp || 15, coins: task.reward_coins || 10 });
    }
    queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
    queryClient.invalidateQueries({ queryKey: ['all-job-tasks'] });
  };

  if (isLoading || !job) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const totalEarned = completedCount * (job.salary_coins || 15);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-10 glass border-b border-white/5">
        <div className="flex items-center gap-3 p-4">
          <Link to={createPageUrl('Jobs')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-white">{job.job_title}</h1>
            <p className="text-xs text-gray-400">{job.employer}</p>
          </div>
          <span className="text-2xl">{job.icon_emoji || '💼'}</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 pb-24">
        {/* Job Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-amber-400">🪙 {totalEarned}</p>
            <p className="text-[10px] text-gray-500">Verdient</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-emerald-400">✓ {completedCount}</p>
            <p className="text-[10px] text-gray-500">Aufträge</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-purple-400">👤</p>
            <p className="text-[10px] text-gray-500">{job.manager_name}</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-300 leading-relaxed">{job.description}</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'tasks'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            Aufträge
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Arbeitschat
          </button>
        </div>

        {activeTab === 'tasks' ? (
          <>
            {/* Generate Task Button */}
            <div className="mb-4">
              <GenerateTaskButton job={job} userEmail={user?.email} />
            </div>

            {/* Task List */}
            <TaskList jobId={jobId} userEmail={user?.email} onTaskComplete={handleTaskComplete} />
          </>
        ) : (
          <JobChat job={job} userEmail={user?.email} />
        )}

        {/* Quit Job */}
        <div className="mt-8 pt-4 border-t border-white/5">
          <Button
            variant="ghost"
            onClick={() => {
              if (confirm('Job wirklich kündigen?')) quitJobMutation.mutate();
            }}
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm"
          >
            <XCircle className="w-4 h-4 mr-2" /> Job kündigen
          </Button>
        </div>
      </main>

      <BottomNav user={user} />
    </div>
  );
}