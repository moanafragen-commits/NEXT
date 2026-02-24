import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Calendar, MapPin, Plus, Trash2, Edit2, Map, Navigation, CalendarPlus, Camera } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function TourPlanner() {
  const urlParams = new URLSearchParams(window.location.search);
  const characterId = urlParams.get('characterId');
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const [formData, setFormData] = useState({
    tour_name: '',
    date: '',
    time: '',
    city: '',
    country: '',
    venue: '',
    status: 'geplant',
    description: '',
    sync_calendar: false
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: character } = useQuery({
    queryKey: ['character', characterId],
    queryFn: async () => {
      const chars = await base44.entities.Character.filter({ id: characterId });
      return chars[0];
    },
    enabled: !!characterId
  });

  const { data: tourEvents = [] } = useQuery({
    queryKey: ['tourEvents', characterId],
    queryFn: () => base44.entities.TourEvent.filter({ character_id: characterId }, '+date'),
    enabled: !!characterId
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const dateTime = new Date(`${data.date}T${data.time || '00:00'}:00`).toISOString();
      const payload = {
        character_id: characterId,
        tour_name: data.tour_name,
        date: dateTime,
        city: data.city,
        country: data.country,
        venue: data.venue,
        status: data.status,
        description: data.description
      };
      
      if (editingEvent) {
        await base44.entities.TourEvent.update(editingEvent.id, payload);
      } else {
        await base44.entities.TourEvent.create(payload);
        
        if (data.sync_calendar && user) {
          await base44.entities.CalendarEntry.create({
            user_email: user.email,
            title: `Tour: ${character.name} - ${data.city}`,
            description: `${data.tour_name} in ${data.venue || 'TBA'}`,
            date: format(new Date(data.date), 'yyyy-MM-dd'),
            time: data.time || '20:00',
            entry_type: 'event',
            related_character_id: characterId,
            emoji: '🎤',
            color: 'purple'
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tourEvents', characterId] });
      setIsOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.TourEvent.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tourEvents', characterId] });
    }
  });

  const addToCalendarMutation = useMutation({
    mutationFn: async (ev) => {
      if (!user) return;
      const d = new Date(ev.date);
      await base44.entities.CalendarEntry.create({
        user_email: user.email,
        title: `Tour: ${character.name} - ${ev.city}`,
        description: `${ev.tour_name} in ${ev.venue || 'TBA'}`,
        date: format(d, 'yyyy-MM-dd'),
        time: format(d, 'HH:mm'),
        entry_type: 'event',
        related_character_id: characterId,
        emoji: '🎤',
        color: 'purple'
      });
    },
    onSuccess: () => {
      alert("Erfolgreich zum Kalender hinzugefügt!");
    }
  });

  const generatePostMutation = useMutation({
    mutationFn: async (ev) => {
      const prompt = `Du bist ${character.name}. Du bist gerade auf der "${ev.tour_name}" Tour in ${ev.city}. Schreibe einen authentischen Social Media Post für deine Fans aus dem Backstage-Bereich oder kurz vor der Show. Keine Hashtags, schreibe in deinem typischen Stil.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      if (res) {
        await base44.entities.Post.create({
          character_id: characterId,
          content: res,
          likes_count: Math.floor(Math.random() * 500) + 10,
          comments_count: Math.floor(Math.random() * 50) + 2
        });
      }
    },
    onSuccess: () => {
      alert("Backstage Post wurde erfolgreich generiert und geteilt!");
    }
  });

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      tour_name: '',
      date: '',
      time: '',
      city: '',
      country: '',
      venue: '',
      status: 'geplant',
      description: '',
      sync_calendar: false
    });
  };

  const handleEdit = (ev) => {
    setEditingEvent(ev);
    const d = new Date(ev.date);
    setFormData({
      tour_name: ev.tour_name || '',
      date: format(d, 'yyyy-MM-dd'),
      time: format(d, 'HH:mm'),
      city: ev.city || '',
      country: ev.country || '',
      venue: ev.venue || '',
      status: ev.status || 'geplant',
      description: ev.description || '',
      sync_calendar: false
    });
    setIsOpen(true);
  };

  if (!character) return null;

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl(`CharacterInfo?characterId=${characterId}`)}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Tourplaner: {character.name}</h1>
        </div>
        <Button 
          onClick={() => { resetForm(); setIsOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Event
        </Button>
      </header>

      <main className="p-4 max-w-3xl mx-auto space-y-4">
        {tourEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Map className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Keine Tour-Events geplant.</p>
            <p className="text-xs mt-1">Füge Orte hinzu, an denen {character.name} auftreten oder sein wird.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tourEvents.map((ev) => {
              const d = new Date(ev.date);
              const isPast = d < new Date();
              return (
                <div key={ev.id} className={`bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isPast ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="bg-[#262626] rounded-lg p-3 text-center min-w-[64px]">
                      <div className="text-xs text-indigo-400 font-bold uppercase">{format(d, 'MMM', { locale: de })}</div>
                      <div className="text-xl font-bold">{format(d, 'dd')}</div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {ev.tour_name}
                        {ev.status === 'abgesagt' && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">Abgesagt</span>}
                        {ev.status === 'stattgefunden' && <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded">Beendet</span>}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mt-1">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {ev.city}{ev.country ? `, ${ev.country}` : ''}</span>
                        {ev.venue && <span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5" /> {ev.venue}</span>}
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {format(d, 'HH:mm', { locale: de })} Uhr</span>
                      </div>
                      {ev.description && <p className="text-sm text-gray-500 mt-2">{ev.description}</p>}
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 justify-end shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10" title="Backstage Post generieren" onClick={() => generatePostMutation.mutate(ev)} disabled={generatePostMutation.isPending}>
                      <Camera className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" title="Zum Kalender hinzufügen" onClick={() => addToCalendarMutation.mutate(ev)} disabled={addToCalendarMutation.isPending}>
                      <CalendarPlus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => handleEdit(ev)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => {
                      if(window.confirm('Event wirklich löschen?')) deleteMutation.mutate(ev.id);
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Event bearbeiten' : 'Neues Tour-Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label>Tour / Event Name</Label>
              <Input value={formData.tour_name} onChange={e => setFormData({...formData, tour_name: e.target.value})} className="bg-[#111] border-white/10" placeholder="z.B. From Zero World Tour" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum</Label>
                <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-[#111] border-white/10" style={{colorScheme: 'dark'}} />
              </div>
              <div className="space-y-2">
                <Label>Uhrzeit</Label>
                <Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-[#111] border-white/10" style={{colorScheme: 'dark'}} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stadt</Label>
                <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="bg-[#111] border-white/10" placeholder="z.B. Berlin" />
              </div>
              <div className="space-y-2">
                <Label>Land</Label>
                <Input value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="bg-[#111] border-white/10" placeholder="z.B. Deutschland" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location / Venue</Label>
              <Input value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} className="bg-[#111] border-white/10" placeholder="z.B. Mercedes-Benz Arena" />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger className="bg-[#111] border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  <SelectItem value="geplant" className="hover:bg-white/5">Geplant</SelectItem>
                  <SelectItem value="stattgefunden" className="hover:bg-white/5">Stattgefunden</SelectItem>
                  <SelectItem value="abgesagt" className="hover:bg-white/5">Abgesagt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Zusätzliche Infos</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-[#111] border-white/10 min-h-[80px]" placeholder="Weitere Details..." />
            </div>

            {!editingEvent && (
              <div className="flex items-center space-x-2 mt-4 border-t border-white/10 pt-4">
                <Checkbox 
                  id="sync" 
                  checked={formData.sync_calendar} 
                  onCheckedChange={(c) => setFormData({...formData, sync_calendar: c})} 
                />
                <Label htmlFor="sync" className="text-sm font-normal text-gray-300">Auch in meinen Kalender eintragen</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="border-white/10 text-white hover:bg-white/5">Abbrechen</Button>
            <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending || !formData.tour_name || !formData.date || !formData.city} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}