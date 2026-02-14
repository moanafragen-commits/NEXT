import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Loader2, Wand2, Upload, User, Settings, BookOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = ["Freund", "Mentor", "Fantasie", "Berühmtheit", "Assistent", "Andere"];
const WRITING_STYLES = [
  { value: "formell", label: "Formell" },
  { value: "informell", label: "Informell" },
  { value: "humorvoll", label: "Humorvoll" },
  { value: "sarkastisch", label: "Sarkastisch" },
  { value: "poetisch", label: "Poetisch" },
  { value: "wissenschaftlich", label: "Wissenschaftlich" },
  { value: "freundlich", label: "Freundlich" },
  { value: "mysteriös", label: "Mysteriös" }
];
const RESPONSE_LENGTHS = [
  { value: "kurz", label: "Kurz & knapp" },
  { value: "mittel", label: "Mittel" },
  { value: "ausführlich", label: "Ausführlich" }
];
const LANGUAGES = ["Deutsch", "Englisch", "Mehrsprachig"];

export default function CreateCharacterModal({ open, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    personality: '',
    greeting: '',
    status: '',
    category: 'Andere',
    avatar_url: '',
    biography: '',
    writing_style: 'freundlich',
    response_length: 'mittel',
    creativity: 50,
    language_preference: 'Deutsch',
    custom_instructions: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, avatar_url: file_url }));
    setIsUploading(false);
  };
  
  const generatePersonality = async () => {
    if (!formData.name) return;
    setIsGenerating(true);
    
    const styleHint = formData.writing_style ? `Der Charakter soll ${formData.writing_style} kommunizieren.` : '';
    const bioHint = formData.biography ? `Hintergrund: ${formData.biography}` : '';
    
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Erstelle eine detaillierte Persönlichkeitsbeschreibung für einen KI-Chatbot-Charakter namens "${formData.name}" in der Kategorie "${formData.category}". 
${styleHint}
${bioHint}

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
          greeting: { type: "string", description: "Eine passende erste Begrüßungsnachricht" },
          status: { type: "string", description: "Ein kurzer Status (max 50 Zeichen)" }
        }
      }
    });
    
    setFormData(prev => ({
      ...prev,
      personality: result.personality,
      greeting: result.greeting,
      status: result.status
    }));
    setIsGenerating(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.personality) return;
    
    setIsSaving(true);
    await base44.entities.Character.create(formData);
    setIsSaving(false);
    setFormData({
      name: '', personality: '', greeting: '', status: '', category: 'Andere',
      avatar_url: '', biography: '', writing_style: 'freundlich', response_length: 'mittel',
      creativity: 50, language_preference: 'Deutsch', custom_instructions: ''
    });
    onCreated();
    onClose();
  };
  
  const defaultAvatar = formData.name ? `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${formData.name}` : '';
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Neuen Charakter erstellen
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="w-full bg-[#262626] mb-4">
              <TabsTrigger value="basic" className="flex-1 data-[state=active]:bg-emerald-600">
                <User className="w-4 h-4 mr-2" />
                Basis
              </TabsTrigger>
              <TabsTrigger value="biography" className="flex-1 data-[state=active]:bg-emerald-600">
                <BookOpen className="w-4 h-4 mr-2" />
                Biografie
              </TabsTrigger>
              <TabsTrigger value="behavior" className="flex-1 data-[state=active]:bg-emerald-600">
                <Settings className="w-4 h-4 mr-2" />
                Verhalten
              </TabsTrigger>
            </TabsList>
            
            {/* Basic Tab */}
            <TabsContent value="basic" className="space-y-5">
              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <img 
                    src={formData.avatar_url || defaultAvatar || 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=default'}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover ring-2 ring-emerald-500/30"
                  />
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-gray-300">Oder Avatar-URL eingeben</Label>
                  <Input
                    value={formData.avatar_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                    placeholder="https://..."
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
                  />
                </div>
              </div>
              
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
                <Label className="text-gray-300">Status</Label>
                <Input
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  placeholder="z.B. Immer bereit für tiefgründige Gespräche..."
                  maxLength={100}
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
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">Begrüßung</Label>
                <Input
                  value={formData.greeting}
                  onChange={(e) => setFormData(prev => ({ ...prev, greeting: e.target.value }))}
                  placeholder="Erste Nachricht des Charakters..."
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
                />
              </div>
            </TabsContent>
            
            {/* Biography Tab */}
            <TabsContent value="biography" className="space-y-5">
              <div className="space-y-2">
                <Label className="text-gray-300">Detaillierte Biografie & Hintergrundgeschichte</Label>
                <p className="text-xs text-gray-500">Diese Informationen helfen der KI, den Charakter besser zu verstehen und authentischer zu reagieren.</p>
                <Textarea
                  value={formData.biography}
                  onChange={(e) => setFormData(prev => ({ ...prev, biography: e.target.value }))}
                  placeholder="Erzähle die Geschichte des Charakters: Wo kommt er her? Was hat er erlebt? Was sind seine Ziele, Ängste, Träume? Welche wichtigen Ereignisse haben ihn geprägt?"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[250px]"
                />
              </div>
            </TabsContent>
            
            {/* Behavior Tab */}
            <TabsContent value="behavior" className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Schreibstil</Label>
                  <Select 
                    value={formData.writing_style} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, writing_style: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10">
                      {WRITING_STYLES.map(style => (
                        <SelectItem key={style.value} value={style.value} className="text-white hover:bg-white/10">
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Antwortlänge</Label>
                  <Select 
                    value={formData.response_length} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, response_length: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10">
                      {RESPONSE_LENGTHS.map(len => (
                        <SelectItem key={len.value} value={len.value} className="text-white hover:bg-white/10">
                          {len.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">Sprache</Label>
                <Select 
                  value={formData.language_preference} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, language_preference: val }))}
                >
                  <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#262626] border-white/10">
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang} value={lang} className="text-white hover:bg-white/10">
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-300">Kreativität</Label>
                  <span className="text-sm text-emerald-400">{formData.creativity}%</span>
                </div>
                <Slider
                  value={[formData.creativity]}
                  onValueChange={([val]) => setFormData(prev => ({ ...prev, creativity: val }))}
                  max={100}
                  step={1}
                  className="[&_[role=slider]]:bg-emerald-500"
                />
                <p className="text-xs text-gray-500">Niedrig = präzise & vorhersehbar, Hoch = kreativ & überraschend</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">Benutzerdefinierte Anweisungen</Label>
                <Textarea
                  value={formData.custom_instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_instructions: e.target.value }))}
                  placeholder="Zusätzliche Anweisungen für die KI, z.B. 'Verwende oft Metaphern' oder 'Stelle häufig Gegenfragen'..."
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[100px]"
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex gap-3 pt-6 mt-4 border-t border-white/10">
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