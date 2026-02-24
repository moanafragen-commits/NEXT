import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Plane, Edit2 } from 'lucide-react';

export default function HomeAddressPanel({ character }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    home_address: character.home_address || '',
    home_city: character.home_city || '',
    travel_status: character.travel_status || 'zuhause',
    travel_destination: character.travel_destination || ''
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Character.update(character.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['character', character.id] });
      setIsOpen(false);
    }
  });

  const travelLabels = {
    zuhause: '🏠 Zuhause',
    auf_tour: '🎤 Auf Tour',
    urlaub: '🏖️ Im Urlaub',
    geschäftsreise: '💼 Geschäftsreise',
    umzug: '📦 Umzug',
    unterwegs: '🚶 Unterwegs'
  };

  return (
    <div className="bg-[#262626] rounded-xl p-4 border border-white/5 relative group">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
        onClick={() => setIsOpen(true)}
      >
        <Edit2 className="w-4 h-4" />
      </Button>

      <div className="space-y-4">
        <div>
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> Wohnort
          </div>
          <div className="text-sm text-white">
            {character.home_address ? `${character.home_address}, ` : ''}
            {character.home_city || 'Nicht festgelegt'}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-1 flex items-center gap-1.5">
            <Plane className="w-3 h-3" /> Aktueller Status
          </div>
          <div className="text-sm text-white flex items-center gap-2">
            <span className="bg-white/10 px-2 py-0.5 rounded text-xs">
              {travelLabels[character.travel_status || 'zuhause']}
            </span>
            {character.travel_status !== 'zuhause' && character.travel_destination && (
              <span className="text-gray-400">→ {character.travel_destination}</span>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Wohnort & Reisen bearbeiten</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Stadt</Label>
              <Input 
                value={formData.home_city}
                onChange={e => setFormData(p => ({...p, home_city: e.target.value}))}
                placeholder="z.B. Los Angeles, Berlin"
                className="bg-[#111] border-white/10 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Genaue Adresse (Optional)</Label>
              <Input 
                value={formData.home_address}
                onChange={e => setFormData(p => ({...p, home_address: e.target.value}))}
                placeholder="z.B. Sunset Blvd 42"
                className="bg-[#111] border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Aktueller Reise-Status</Label>
              <Select 
                value={formData.travel_status}
                onValueChange={v => setFormData(p => ({...p, travel_status: v}))}
              >
                <SelectTrigger className="bg-[#111] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {Object.entries(travelLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="hover:bg-white/5">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.travel_status !== 'zuhause' && (
              <div className="space-y-2">
                <Label className="text-gray-300">Reiseziel</Label>
                <Input 
                  value={formData.travel_destination}
                  onChange={e => setFormData(p => ({...p, travel_destination: e.target.value}))}
                  placeholder="z.B. Tokyo"
                  className="bg-[#111] border-white/10 text-white"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="border-white/10 text-white hover:bg-white/5">
              Abbrechen
            </Button>
            <Button 
              onClick={() => mutation.mutate(formData)}
              disabled={mutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}