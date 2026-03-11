import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Calendar, Users, MapPin, Trash2, Edit2, AlertTriangle, CheckCircle2, UserCircle, Crown, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Simple city coordinate lookup (could be expanded or replaced by API)
const CITY_COORDS = {
  'Berlin': [52.52, 13.405], 'München': [48.1351, 11.582], 'Hamburg': [53.5511, 9.9937],
  'Köln': [50.9375, 6.9603], 'Frankfurt': [50.1109, 8.6821], 'Stuttgart': [48.7758, 9.1829],
  'Düsseldorf': [51.2277, 6.7735], 'Leipzig': [51.3397, 12.3731], 'Dortmund': [51.5136, 7.4653],
  'Wien': [48.2082, 16.3738], 'Zürich': [47.3769, 8.5417], 'London': [51.5074, -0.1278],
  'Paris': [48.8566, 2.3522], 'New York': [40.7128, -74.006], 'Los Angeles': [34.0522, -118.2437],
  'Tokyo': [35.6762, 139.6503], 'Seoul': [37.5665, 126.978], 'Rom': [41.9028, 12.4964],
  'Barcelona': [41.3874, 2.1686], 'Amsterdam': [52.3676, 4.9041]
};

export default function TourDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const tourId = urlParams.get('tourId');
  const queryClient = useQueryClient();

  const [isEventOpen, setIsEventOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [formData, setFormData] = useState({
    tour_name: '', date: '', time: '', city: '', country: '', venue: '',
    status: 'geplant', event_type: 'konzert', description: '', cancellation_reason: '', sync_calendar: false
  });

  const { data: tour } = useQuery({
    queryKey: ['tour', tourId],
    queryFn: async () => {
      const res = await base44.entities.Tour.filter({ id: tourId });
      return res[0];
    },
    enabled: !!tourId
  });

  const { data: events = [] } = useQuery({
    queryKey: ['tour-events', tourId],
    queryFn: () => base44.entities.TourEvent.filter({ tour_id: tourId }, '+date'),
    enabled: !!tourId
  });

  const { data: allCharacters = [] } = useQuery({
    queryKey: ['all-characters'],
    queryFn: () => base44.entities.Character.list()
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const saveEventMutation = useMutation({
    mutationFn: async (data) => {
      const coords = CITY_COORDS[data.city] || [0, 0];
      const dateTime = new Date(`${data.date}T${data.time || '00:00'}:00`).toISOString();
      const payload = {
        tour_id: tourId,
        tour_name: tour?.name || data.tour_name,
        date: dateTime,
        city: data.city,
        country: data.country,
        venue: data.venue,
        status: data.status,
        event_type: data.event_type,
        description: data.description,
        cancellation_reason: data.cancellation_reason,
        latitude: coords[0],
        longitude: coords[1]
      };
      
      if (editingEvent) {
        await base44.entities.TourEvent.update(editingEvent.id, payload);
        
        if ((data.status === 'abgesagt' || data.status === 'verschoben') && editingEvent.status !== data.status) {
          await base44.entities.Post.create({
            content: `🚨 Update zum Tour-Stop in ${data.city}: Das Event wurde ${data.status}. Grund: ${data.cancellation_reason || 'Keine Angaben'}`,
            is_user_post: false,
            likes_count: 0,
            comments_count: 0
          });
        }
      } else {
        await base44.entities.TourEvent.create(payload);
        if (data.sync_calendar && user) {
          // Add to calendar logic here if needed
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-events', tourId] });
      setIsEventOpen(false);
      setEditingEvent(null);
    }
  });

  const updateMembersMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Tour.update(tourId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      setIsMembersOpen(false);
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.TourEvent.delete(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tour-events', tourId] })
  });

  const handleEditEvent = (ev) => {
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
      event_type: ev.event_type || 'konzert',
      description: ev.description || '',
      cancellation_reason: ev.cancellation_reason || '',
      sync_calendar: false
    });
    setIsEventOpen(true);
  };

  const handleOpenNewEvent = () => {
    setEditingEvent(null);
    setFormData({
      tour_name: tour?.name || '',
      date: '', time: '', city: '', country: '', venue: '',
      status: 'geplant', event_type: 'konzert', description: '', cancellation_reason: '', sync_calendar: false
    });
    setIsEventOpen(true);
  };

  if (!tour) return null;

  const routePositions = events
    .filter(e => e.latitude && e.longitude && e.latitude !== 0)
    .map(e => [e.latitude, e.longitude]);

  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col md:flex-row">
      
      {/* Sidebar / List View */}
      <div className="w-full md:w-[400px] flex flex-col border-r border-white/5 bg-[#1a1a1a] h-screen overflow-hidden">
        <header className="p-4 border-b border-white/5 bg-[#222]">
          <div className="flex items-center gap-3 mb-4">
            <Link to={createPageUrl('Tours')}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-lg leading-tight">{tour.name}</h1>
              <span className={`text-xs px-1.5 py-0.5 rounded ${tour.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {tour.is_active ? 'Aktiv' : 'Beendet'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5" onClick={() => setIsMembersOpen(true)}>
              <Users className="w-4 h-4 mr-2" /> Crew
            </Button>
            <Link to={createPageUrl(`TourFinance?tourId=${tour.id}`)} className="flex-1">
              <Button size="sm" variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                <DollarSign className="w-4 h-4 mr-2" /> Finanzen
              </Button>
            </Link>
          </div>
          <div className="flex gap-2 mt-2">
            <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" onClick={handleOpenNewEvent}>
              <Plus className="w-4 h-4 mr-2" /> Neuer Termin
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {events.length === 0 ? (
            <div className="text-center text-gray-500 py-10">Keine Termine geplant.</div>
          ) : (
            events.map(ev => {
              const d = new Date(ev.date);
              const isPast = d < new Date();
              return (
                <div key={ev.id} className={`bg-[#262626] rounded-lg p-3 border border-white/5 ${isPast ? 'opacity-60' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#111] px-2 py-1 rounded text-center min-w-[40px]">
                        <div className="text-[10px] text-gray-400 uppercase">{format(d, 'MMM', {locale: de})}</div>
                        <div className="font-bold text-sm">{format(d, 'dd')}</div>
                      </div>
                      <div>
                        <div className="font-bold text-sm">{ev.city}</div>
                        <div className="text-xs text-gray-400">
                           {ev.event_type === 'meet_and_greet' ? 'VIP Meet & Greet' :
                            ev.event_type === 'interview' ? 'Interview' :
                            ev.event_type === 'autogrammstunde' ? 'Autogrammstunde' :
                            ev.event_type === 'freier_tag' ? 'Freier Tag' : 'Konzert'} • {ev.venue}
                        </div>
                      </div>
                    </div>
                    {ev.status === 'abgesagt' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {ev.status === 'stattgefunden' && <CheckCircle2 className="w-4 h-4 text-gray-500" />}
                  </div>
                  
                  {ev.cancellation_reason && (
                    <div className="text-xs bg-red-500/10 text-red-400 p-2 rounded mb-2">
                      Abgesagt: {ev.cancellation_reason}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/5">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => handleEditEvent(ev)}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-300" onClick={() => {
                        if(window.confirm('Termin löschen?')) deleteEventMutation.mutate(ev.id);
                    }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 h-[50vh] md:h-screen relative bg-[#050505]">
        <MapContainer center={[51.1657, 10.4515]} zoom={5} style={{ height: '100%', width: '100%' }} className="z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {events.map(ev => {
            if (!ev.latitude || !ev.longitude) return null;
            return (
              <Marker key={ev.id} position={[ev.latitude, ev.longitude]}>
                <Popup className="text-black">
                  <strong>{ev.city}</strong><br/>
                  {format(new Date(ev.date), 'dd.MM.yyyy')}<br/>
                  {ev.venue}
                </Popup>
              </Marker>
            );
          })}

          {routePositions.length > 1 && (
            <Polyline positions={routePositions} color={tour.color || "#ef4444"} weight={3} dashArray="5, 10" />
          )}
        </MapContainer>
      </div>

      {/* Members Dialog */}
      <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Tour-Besetzung</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Crown className="w-4 h-4 text-amber-400" /> Manager / Lead</Label>
              <Select 
                value={tour.manager_id || ''} 
                onValueChange={(val) => updateMembersMutation.mutate({ manager_id: val })}
              >
                <SelectTrigger className="bg-[#111] border-white/10"><SelectValue placeholder="Wähle Manager" /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {allCharacters.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><UserCircle className="w-4 h-4 text-indigo-400" /> Bandmitglieder</Label>
              <div className="bg-[#111] border border-white/10 rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                {allCharacters.map(char => {
                  const isSelected = (tour.band_members || []).includes(char.id);
                  return (
                    <div key={char.id} className="flex items-center justify-between gap-2 p-1">
                      <div className="flex items-center gap-2">
                          <Checkbox 
                            id={`char-${char.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const current = tour.band_members || [];
                              const next = checked 
                                ? [...current, char.id]
                                : current.filter(id => id !== char.id);
                              updateMembersMutation.mutate({ band_members: next });
                            }}
                          />
                          <label htmlFor={`char-${char.id}`} className="text-sm cursor-pointer select-none">{char.name}</label>
                      </div>
                      {isSelected && (
                          <div className="flex items-center gap-3 text-xs">
                              <span className="text-red-400" title="Stresslevel">Stress: {char.tour_stress_level || 0}%</span>
                              <span className="text-green-400" title="Moral">Moral: {char.tour_morale ?? 100}%</span>
                          </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Dialog */}
      <Dialog open={isEventOpen} onOpenChange={setIsEventOpen}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
          <DialogHeader><DialogTitle>{editingEvent ? 'Termin bearbeiten' : 'Neuer Termin'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
             {/* Fields same as TourPlanner but adapted */}
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Datum</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-[#111] border-white/10" style={{colorScheme: 'dark'}} /></div>
                <div className="space-y-2"><Label>Uhrzeit</Label><Input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-[#111] border-white/10" style={{colorScheme: 'dark'}} /></div>
             </div>
             <div className="space-y-2"><Label>Stadt (für Karte)</Label><Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="bg-[#111] border-white/10" placeholder="Wichtig für Map-Position" /></div>
             <div className="space-y-2"><Label>Venue</Label><Input value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} className="bg-[#111] border-white/10" /></div>
             <div className="space-y-2"><Label>Typ</Label>
               <Select value={formData.event_type} onValueChange={v => setFormData({...formData, event_type: v})}>
                 <SelectTrigger className="bg-[#111] border-white/10"><SelectValue /></SelectTrigger>
                 <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                   <SelectItem value="konzert">Konzert</SelectItem>
                   <SelectItem value="meet_and_greet">Meet & Greet</SelectItem>
                   <SelectItem value="interview">Interview</SelectItem>
                   <SelectItem value="autogrammstunde">Autogrammstunde</SelectItem>
                   <SelectItem value="freier_tag">Freier Tag</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="space-y-2"><Label>Status</Label>
               <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                 <SelectTrigger className="bg-[#111] border-white/10"><SelectValue /></SelectTrigger>
                 <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                   <SelectItem value="geplant">Geplant</SelectItem>
                   <SelectItem value="stattgefunden">Stattgefunden</SelectItem>
                   <SelectItem value="abgesagt">Abgesagt</SelectItem>
                   <SelectItem value="verschoben">Verschoben</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             {(formData.status === 'abgesagt' || formData.status === 'verschoben') && (
               <div className="space-y-2">
                 <Label>Grund (wird im Feed gepostet)</Label>
                 <Input 
                   value={formData.cancellation_reason || ''} 
                   onChange={e => setFormData({...formData, cancellation_reason: e.target.value})} 
                   className="bg-[#111] border-white/10" 
                   placeholder="z.B. Krankheit, Unwetter, Logistik..." 
                 />
               </div>
             )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventOpen(false)} className="border-white/10 hover:bg-white/5 text-white">Abbrechen</Button>
            <Button onClick={() => saveEventMutation.mutate(formData)} className="bg-indigo-600 hover:bg-indigo-500 text-white">Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}