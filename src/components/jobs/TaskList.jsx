import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import moment from 'moment';

const PRIORITY_STYLES = {
  niedrig: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
  mittel: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  hoch: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  dringend: 'bg-red-500/10 border-red-500/20 text-red-400',
};

const STATUS_ICONS = {
  offen: <Clock className="w-4 h-4 text-gray-400" />,
  in_arbeit: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
  erledigt: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  abgelaufen: <AlertTriangle className="w-4 h-4 text-red-400" />,
};

export default function TaskList({ jobId, userEmail, onTaskComplete }) {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['job-tasks', jobId],
    queryFn: () => base44.entities.JobTask.filter({ job_id: jobId, user_email: userEmail }, '-created_date', 50),
    enabled: !!jobId && !!userEmail
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      await base44.entities.JobTask.update(taskId, { status: 'erledigt' });
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['job-tasks', jobId] });
      const task = tasks.find(t => t.id === taskId);
      if (task && onTaskComplete) {
        onTaskComplete(task);
      }
    }
  });

  const startTaskMutation = useMutation({
    mutationFn: async (taskId) => {
      await base44.entities.JobTask.update(taskId, { status: 'in_arbeit' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-tasks', jobId] });
    }
  });

  const openTasks = tasks.filter(t => t.status === 'offen' || t.status === 'in_arbeit');
  const doneTasks = tasks.filter(t => t.status === 'erledigt');

  if (isLoading) {
    return <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /></div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-gray-500">Keine Aufträge vorhanden.</p>
        <p className="text-xs text-gray-600 mt-1">Neue Aufträge werden automatisch generiert.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Open Tasks */}
      {openTasks.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Offene Aufträge ({openTasks.length})</h4>
          <div className="space-y-2">
            {openTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{task.emoji || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-white">{task.title}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${PRIORITY_STYLES[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mb-2">{task.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                      <span>Von: {task.from_manager}</span>
                      {task.deadline && (
                        <span className={moment(task.deadline).isBefore() ? 'text-red-400' : ''}>
                          ⏰ {moment(task.deadline).fromNow()}
                        </span>
                      )}
                      <span className="text-amber-400">🪙 {task.reward_coins}</span>
                      <span className="text-emerald-400">+{task.reward_xp} XP</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {task.status === 'offen' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startTaskMutation.mutate(task.id)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-xs h-7 px-2"
                      >
                        Starten
                      </Button>
                    )}
                    {(task.status === 'offen' || task.status === 'in_arbeit') && (
                      <Button
                        size="sm"
                        onClick={() => completeTaskMutation.mutate(task.id)}
                        disabled={completeTaskMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-500 text-xs h-7 px-2"
                      >
                        ✓ Erledigt
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Done Tasks */}
      {doneTasks.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Erledigt ({doneTasks.length})</h4>
          <div className="space-y-1.5">
            {doneTasks.slice(0, 5).map(task => (
              <div key={task.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-2 opacity-60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-xs text-gray-400 line-through flex-1">{task.title}</span>
                <span className="text-[10px] text-amber-400">+{task.reward_coins} 🪙</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}