import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Loader2, ShoppingBag, ChevronRight, Sparkles, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import BottomNav from '@/components/navigation/BottomNav';
import NextHeader from '@/components/navigation/NextHeader';
import JobMarketFilters, { SALARY_RANGES } from '@/components/jobs/JobMarketFilters';
import JobListingCard from '@/components/jobs/JobListingCard';
import JobListingDetail from '@/components/jobs/JobListingDetail';

export default function JobMarket() {
  const queryClient = useQueryClient();
  const [selectedListing, setSelectedListing] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'alle',
    salaryRange: 'alle'
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['job-listings'],
    queryFn: () => base44.entities.JobListing.filter({ is_active: true }, '-created_date', 100),
  });

  const { data: activeJobs = [] } = useQuery({
    queryKey: ['user-jobs', user?.email],
    queryFn: () => base44.entities.UserJob.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  const activeJobTitles = activeJobs.filter(j => j.status === 'aktiv').map(j => `${j.job_title}::${j.employer}`);

  // Filter listings
  const filteredListings = listings.filter(listing => {
    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match = (listing.job_title || '').toLowerCase().includes(q)
        || (listing.employer || '').toLowerCase().includes(q)
        || (listing.category || '').toLowerCase().includes(q)
        || (listing.manager_name || '').toLowerCase().includes(q)
        || (listing.description || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    // Category
    if (filters.category !== 'alle' && listing.category !== filters.category) return false;
    // Salary
    if (filters.salaryRange !== 'alle') {
      const range = SALARY_RANGES.find(r => r.key === filters.salaryRange);
      if (range) {
        if (range.min && (listing.salary_coins || 0) < range.min) return false;
        if (range.max && (listing.salary_coins || 0) > range.max) return false;
      }
    }
    return true;
  });

  // Sort: featured first, then by salary
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return (b.salary_coins || 0) - (a.salary_coins || 0);
  });

  const applyMutation = useMutation({
    mutationFn: async (listing) => {
      const createdJob = await base44.entities.UserJob.create({
        user_email: user.email,
        job_title: listing.job_title,
        employer: listing.employer,
        manager_name: listing.manager_name || 'Manager',
        description: listing.description,
        category: listing.category,
        salary_coins: listing.salary_coins || 15,
        xp_reward: listing.xp_reward || 20,
        icon_emoji: listing.icon_emoji || '💼',
        status: 'aktiv'
      });

      // Update applicant count
      await base44.entities.JobListing.update(listing.id, {
        current_applicants: (listing.current_applicants || 0) + 1
      });

      // Auto-generate initial calendar entries
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Du bist ${listing.manager_name || 'der Manager'} von ${listing.employer}. Ein neuer Mitarbeiter wurde als "${listing.job_title}" eingestellt.
Jobbeschreibung: ${listing.description}
${listing.requirements ? `Anforderungen: ${listing.requirements}` : ''}

Generiere 3-5 realistische Termine/Aufgaben für die erste Arbeitswoche (nächste 7 Tage).
Mischung aus Onboarding, echten Aufgaben, Meetings und Deadlines.`,
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
                  time: { type: "string" },
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

      if (result.entries?.length > 0) {
        const calendarEntries = result.entries.map(entry => {
          const date = new Date();
          date.setDate(date.getDate() + (entry.days_from_now || 1));
          return {
            user_email: user.email,
            title: entry.title,
            description: entry.description || '',
            date: date.toISOString().split('T')[0],
            time: entry.time || null,
            entry_type: entry.entry_type || 'termin',
            related_job_id: createdJob.id,
            status: 'offen',
            priority: entry.priority || 'mittel',
            reward_coins: entry.reward_coins || Math.round((listing.salary_coins || 15) * 0.5),
            reward_xp: entry.reward_xp || Math.round((listing.xp_reward || 20) * 0.5),
            penalty_coins: Math.round((entry.reward_coins || 5) * 0.5),
            penalty_xp: Math.round((entry.reward_xp || 5) * 0.3),
            emoji: entry.emoji || listing.icon_emoji || '💼',
            color: 'purple'
          };
        });
        await base44.entities.CalendarEntry.bulkCreate(calendarEntries);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job-listings'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-entries'] });
      setSelectedListing(null);
      toast.success('Bewerbung erfolgreich! Termine wurden im Kalender erstellt. 🎉');
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-pink-500/3 rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-10 glass border-b border-white/5">
        <div className="flex items-center gap-3 p-4">
          <Link to={createPageUrl('Jobs')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <ShoppingBag className="w-5 h-5 text-purple-400" />
          <h1 className="text-lg font-bold flex-1">Job-Marktplatz</h1>
          <span className="text-xs text-gray-500">{filteredListings.length} Jobs</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 pb-24 relative z-[1] space-y-4">
        {/* Filters */}
        <JobMarketFilters filters={filters} onFilterChange={setFilters} />

        {/* Active Jobs Quick Access */}
        {activeJobs.filter(j => j.status === 'aktiv').length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Deine aktiven Jobs</h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {activeJobs.filter(j => j.status === 'aktiv').map(job => (
                <Link key={job.id} to={createPageUrl(`JobDetail?jobId=${job.id}`)}>
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 whitespace-nowrap hover:border-emerald-500/40 transition-colors">
                    <span>{job.icon_emoji || '💼'}</span>
                    <span className="text-xs font-medium text-white">{job.job_title}</span>
                    <ChevronRight className="w-3 h-3 text-gray-500" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Job Listings */}
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : sortedListings.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Keine Jobs gefunden</p>
            <p className="text-xs text-gray-600 mt-1">Versuche andere Filter</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedListings.map((listing, i) => (
              <JobListingCard
                key={listing.id}
                listing={listing}
                index={i}
                onClick={() => setSelectedListing(listing)}
                isApplied={activeJobTitles.includes(`${listing.job_title}::${listing.employer}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedListing && (
          <JobListingDetail
            listing={selectedListing}
            onApply={(listing) => applyMutation.mutate(listing)}
            isApplying={applyMutation.isPending}
            onClose={() => setSelectedListing(null)}
          />
        )}
      </AnimatePresence>

      <BottomNav user={user} />
    </div>
  );
}