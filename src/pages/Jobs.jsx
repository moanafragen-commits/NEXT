import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Briefcase, Loader2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import BottomNav from '@/components/navigation/BottomNav';
import NextHeader from '@/components/navigation/NextHeader';
import JobBoard from '@/components/jobs/JobBoard';

export default function Jobs() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-pink-500/3 rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-10 glass border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <NextHeader />
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <h1 className="text-lg font-bold text-white">Jobs</h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 pb-24 relative z-[1]">
        {/* Marketplace Banner */}
        <Link to={createPageUrl('JobMarket')}>
          <div className="bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-500/25 rounded-2xl p-4 mb-4 flex items-center gap-3 hover:border-purple-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-white">Job-Marktplatz</p>
              <p className="text-xs text-gray-400">Entdecke neue Jobangebote & bewirb dich</p>
            </div>
            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10">
              Öffnen →
            </Button>
          </div>
        </Link>

        <JobBoard userEmail={user?.email} />
      </main>

      <BottomNav user={user} />
    </div>
  );
}