import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, DollarSign, TrendingUp, TrendingDown, Trash2, PieChart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const CATEGORY_LABELS = {
  tickets: 'Ticketverkäufe',
  merch: 'Merchandise',
  travel: 'Reisekosten',
  venue: 'Venue-Miete',
  crew: 'Crew & Personal',
  marketing: 'Marketing',
  other: 'Sonstiges'
};

export default function TourFinance() {
  const urlParams = new URLSearchParams(window.location.search);
  const tourId = urlParams.get('tourId');
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income',
    category: 'tickets',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const { data: tour } = useQuery({
    queryKey: ['tour', tourId],
    queryFn: async () => {
      const res = await base44.entities.Tour.filter({ id: tourId });
      return res[0];
    },
    enabled: !!tourId
  });

  const { data: entries = [] } = useQuery({
    queryKey: ['tour-finance', tourId],
    queryFn: () => base44.entities.TourFinanceEntry.filter({ tour_id: tourId }, '-date'),
    enabled: !!tourId
  });

  const addEntryMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.TourFinanceEntry.create({
        tour_id: tourId,
        type: data.type,
        category: data.category,
        amount: parseFloat(data.amount),
        description: data.description,
        date: data.date
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour-finance', tourId] });
      setIsAddOpen(false);
      setFormData({
        type: 'income',
        category: 'tickets',
        amount: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
    }
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.TourFinanceEntry.delete(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tour-finance', tourId] })
  });

  if (!tour) return null;

  const totalIncome = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-[#111] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl(`TourDetail?tourId=${tourId}`)}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white bg-[#1a1a1a] hover:bg-[#222]">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Finanzen: {tour.name}</h1>
              <p className="text-sm text-gray-400">Übersicht der Einnahmen und Ausgaben</p>
            </div>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white">
            <Plus className="w-4 h-4 mr-2" /> Neue Buchung
          </Button>
        </header>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
              <h3 className="font-semibold">Einnahmen</h3>
            </div>
            <p className="text-3xl font-bold">{totalIncome.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2 text-red-400">
              <TrendingDown className="w-5 h-5" />
              <h3 className="font-semibold">Ausgaben</h3>
            </div>
            <p className="text-3xl font-bold">{totalExpense.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2 text-indigo-400">
              <PieChart className="w-5 h-5" />
              <h3 className="font-semibold">Nettogewinn</h3>
            </div>
            <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {netProfit.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
        </div>

        {/* Entries List */}
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 font-semibold text-lg">Buchungsverlauf</div>
          {entries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Keine Finanzbuchungen vorhanden.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {entries.map(entry => (
                <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-[#222] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${entry.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                      {entry.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{entry.description || CATEGORY_LABELS[entry.category]}</h4>
                      <div className="flex gap-2 text-xs text-gray-400 mt-1">
                        <span>{format(new Date(entry.date), 'dd.MM.yyyy')}</span>
                        <span>•</span>
                        <span>{CATEGORY_LABELS[entry.category]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-bold ${entry.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {entry.type === 'income' ? '+' : '-'}{entry.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </span>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-400" onClick={() => {
                      if(window.confirm('Eintrag löschen?')) deleteEntryMutation.mutate(entry.id);
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
          <DialogHeader><DialogTitle>Neue Finanzbuchung</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Typ</Label>
                <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v, category: v === 'income' ? 'tickets' : 'travel'})}>
                  <SelectTrigger className="bg-[#111] border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    <SelectItem value="income">Einnahme</SelectItem>
                    <SelectItem value="expense">Ausgabe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                  <SelectTrigger className="bg-[#111] border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                    {formData.type === 'income' ? (
                      <>
                        <SelectItem value="tickets">Ticketverkäufe</SelectItem>
                        <SelectItem value="merch">Merchandise</SelectItem>
                        <SelectItem value="other">Sonstige Einnahmen</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="travel">Reisekosten</SelectItem>
                        <SelectItem value="venue">Venue-Miete</SelectItem>
                        <SelectItem value="crew">Crew & Personal</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="other">Sonstige Ausgaben</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Betrag (€)</Label>
              <Input 
                type="number" 
                step="0.01"
                min="0"
                value={formData.amount} 
                onChange={e => setFormData({...formData, amount: e.target.value})} 
                className="bg-[#111] border-white/10" 
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Beschreibung (optional)</Label>
              <Input 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="bg-[#111] border-white/10" 
                placeholder="z.B. T-Shirts Berlin Show"
              />
            </div>

            <div className="space-y-2">
              <Label>Datum</Label>
              <Input 
                type="date" 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
                className="bg-[#111] border-white/10" 
                style={{colorScheme: 'dark'}}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} className="border-white/10 hover:bg-white/5 text-white">Abbrechen</Button>
            <Button onClick={() => addEntryMutation.mutate(formData)} disabled={!formData.amount} className="bg-indigo-600 hover:bg-indigo-500 text-white">Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}