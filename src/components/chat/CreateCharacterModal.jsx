import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = ["Freund", "Mentor", "Fantasie", "Berühmtheit", "Assistent", "Andere"];

export default function CreateCharacterModal({ open, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    personality: '',
    greeting: '',
    category: 'Andere',
    avatar_url: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const generatePersonality = async () => {
    if (!formData.name) return;
    setIsGenerating(true);
    
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Erstelle eine detaillierte Persönlichkeitsbeschreibung für einen KI-Chatbot-Charakter namens "${formData.name}" in der Kategorie "${formData.category}". 
      
Die Beschreibung soll enthalten:
- Charaktereigenschaften und Verhaltensweisen
- Wie der Charakter spricht (Tonfall, Stil)
- Interessen und Wissen
- Besondere Eigenheiten

Schreibe in der dritten Person. Maximal 200 Wörter. Auf Deutsch.`,
      response_json_schema: {
        type: "object",
        properties: {
          personality: { type: "string" },
          greeting: { type: "string", description: "Eine passende erste Begrüßungsnachricht" }
        }
      }
    });
    
    setFormData(prev => ({
      ...prev,
      personality: result.personality,
      greeting: result.greeting
    }));
    setIsGenerating(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.personality) return;
    
    setIsSaving(true);
    await base44.entities.Character.create(formData);
    setIsSaving(false);
    setFormData({ name: '', personality: '', greeting: '', category: 'Andere', avatar_url: '' });
    onCreated();
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Neuen Charakter erstellen
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="z.B. Albert Einstein"
                className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Kategorie</Label>
              <Select 
                value={formData.category} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
              >
                <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#262626] border-white/10">
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat} className="text-white hover:bg-white/10">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-300">Avatar URL (optional)</Label>
            <Input
              value={formData.avatar_url}
              onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
              placeholder="https://..."
              className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-gray-300">Persönlichkeit *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generatePersonality}
                disabled={!formData.name || isGenerating}
                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                KI generieren
              </Button>
            </div>
            <Textarea
              value={formData.personality}
              onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
              placeholder="Beschreibe die Persönlichkeit, wie der Charakter spricht, seine Interessen..."
              className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[120px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-300">Begrüßung (optional)</Label>
            <Input
              value={formData.greeting}
              onChange={(e) => setFormData(prev => ({ ...prev, greeting: e.target.value }))}
              placeholder="Erste Nachricht des Charakters..."
              className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="flex-1 text-gray-400 hover:text-white hover:bg-white/10"
            >
              Abbrechen
            </Button>
            <Button 
              type="submit"
              disabled={!formData.name || !formData.personality || isSaving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}