import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Calendar, Users, Map as MapIcon, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';

export default function Tours() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTourName, setNewTourName] = useState('');

  const { data: tours = [] } = useQuery({
    queryKey: ['tours'],
    queryFn: () => base44.entities.Tour.list('-start_date')
  });

  const createTourMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Tour.create({
        name: newTourName,
        is_active: true,
        start_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      setIsCreateOpen(false);
      setNewTourName('');
    }
  });

  const deleteTourMutation = useMutation({
    mutationFn: async (tour) => {
      const events = await base44.entities.TourEvent.filter({ tour_id: tour.id });
      await Promise.all(events.map(ev => base44.entities.TourEvent.delete(ev.id)));
      await base44.entities.Tour.delete(tour.id);

      await base44.entities.Post.create({
        content: `Die Tour "${tour.name}" wurde soeben offiziell abgesagt und alle Pläne wurden storniert. 😔`,
        is_user_post: false,
        likes_count: 0,
        comments_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
    }
  });

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Touren & Events</h1>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white" size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Neue Tour
        </Button>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-4">
        {tours.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MapIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Keine Touren angelegt.</p>
            <p className="text-xs mt-1">Erstelle eine Tour, um Bandmitglieder und Termine zu verwalten.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {tours.map(tour => (
              <Link key={tour.id} to={createPageUrl(`TourDetail?tourId=${tour.id}`)}>
                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 hover:bg-[#222] transition-colors flex items-center justify-between group">
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">{tour.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {(tour.band_members || []).length} Mitglieder</span>
                      {tour.is_active ? (
                        <span className="text-emerald-400 text-xs px-1.5 py-0.5 bg-emerald-500/10 rounded">Aktiv</span>
                      ) : (
                        <span className="text-gray-500 text-xs px-1.5 py-0.5 bg-gray-500/10 rounded">Beendet</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 z-10" 
                      onClick={(e) => {
                        e.preventDefault();
                        if(window.confirm(`Die Tour "${tour.name}" und alle Termine wirklich löschen?`)) {
                          deleteTourMutation.mutate(tour);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Neue Tour erstellen</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Name der Tour</Label>
            <Input 
              value={newTourName} 
              onChange={e => setNewTourName(e.target.value)} 
              placeholder="z.B. World Tour 2026" 
              className="bg-[#111] border-white/10 mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="border-white/10 hover:bg-white/5 text-white">Abbrechen</Button>
            <Button onClick={() => createTourMutation.mutate()} className="bg-indigo-600 hover:bg-indigo-500 text-white">Erstellen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}