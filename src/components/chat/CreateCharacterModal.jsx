import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Loader2, Wand2, Upload, User, Settings, BookOpen, Heart, MessageSquare, Zap, Brain, Shield, Lock, Lightbulb, ImagePlus, Briefcase, Clock } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { base44 } from '@/api/base44Client';
import { CHARACTER_TEMPLATES } from './CharacterTemplates';

const CATEGORIES = [
  "Freund", "Mentor", "Familie", "Partner", "Kollege",
  "Therapeut", "Coach", "Lehrer", "Berater",
  "Fantasie", "Berühmtheit", "Historisch", "Fiktional",
  "Assistent", "Experte", "Kreativ", "Abenteurer",
  "Anime", "Gaming", "Sci-Fi", "Mystery",
  "Romantisch", "Humorvoll", "Philosophisch", "Andere"
];
const WRITING_STYLES = [
  { value: "formell", label: "📝 Formell" },
  { value: "informell", label: "💬 Informell" },
  { value: "humorvoll", label: "😄 Humorvoll" },
  { value: "sarkastisch", label: "😏 Sarkastisch" },
  { value: "poetisch", label: "🌸 Poetisch" },
  { value: "wissenschaftlich", label: "🔬 Wissenschaftlich" },
  { value: "freundlich", label: "😊 Freundlich" },
  { value: "mysteriös", label: "🔮 Mysteriös" },
  { value: "dramatisch", label: "🎭 Dramatisch" },
  { value: "minimalistisch", label: "✨ Minimalistisch" },
  { value: "umgangssprachlich", label: "🗣️ Umgangssprachlich" },
  { value: "philosophisch", label: "🤔 Philosophisch" },
  { value: "romantisch", label: "💕 Romantisch" },
  { value: "aggressiv", label: "🔥 Aggressiv" },
  { value: "kindlich", label: "🧸 Kindlich" },
  { value: "weise", label: "🦉 Weise" }
];
const RESPONSE_LENGTHS = [
  { value: "kurz", label: "⚡ Kurz & knapp (1-2 Sätze)" },
  { value: "mittel", label: "💬 Mittel (3-5 Sätze)" },
  { value: "ausführlich", label: "📖 Ausführlich (Absätze)" }
];
const LANGUAGES = ["Deutsch", "Englisch", "Mehrsprachig"];
const EMOJI_USAGE = [
  { value: "nie", label: "🚫 Nie" },
  { value: "selten", label: "😶 Selten" },
  { value: "gelegentlich", label: "🙂 Gelegentlich" },
  { value: "häufig", label: "😍 Häufig" },
  { value: "exzessiv", label: "🤯 Exzessiv (jeder Satz)" }
];
const HUMOR_TYPES = [
  { value: "keiner", label: "😐 Keiner" },
  { value: "trocken", label: "🏜️ Trocken" },
  { value: "wortspiele", label: "🔤 Wortspiele" },
  { value: "slapstick", label: "🤡 Slapstick" },
  { value: "ironisch", label: "😏 Ironisch" },
  { value: "dunkel", label: "🖤 Dunkel" },
  { value: "kindlich", label: "🧒 Kindlich" },
  { value: "absurd", label: "🦆 Absurd" },
  { value: "selbstironisch", label: "🪞 Selbstironisch" },
  { value: "neckend", label: "😜 Neckend / Flirtend" },
  { value: "intelligent", label: "🧠 Intelligent / Witzig" }
];

export default function CreateCharacterModal({ open, onClose, onCreated }) {
  const [showTemplates, setShowTemplates] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    personality: '',
    greeting: '',
    status: '',
    category: 'Andere',
    gender: '',
    sexual_orientation: '',
    avatar_url: '',
    biography: '',
    writing_style: 'freundlich',
    response_length: 'mittel',
    creativity: 50,
    language_preference: 'Deutsch',
    custom_instructions: '',
    interests: '',
    favorite_topics: '',
    dislikes: '',
    speech_patterns: '',
    emoji_usage: 'gelegentlich',
    humor_type: '',
    values: '',
    fears: '',
    goals: '',
    occupation: '',
    age: '',
    background_culture: '',
    formality_level: 5,
    catchphrases: '',
    mood_default: 'neutral',
    conversation_style: 'zuhörend',
    empathy_level: 5,
    knowledge_areas: '',
    quirks: '',
    relationship_style: 'unterstützend',
    conflict_behavior: 'diplomatisch',
    emotional_depth: 5,
    memory_references: true,
    proactive_topics: false,
    secret: '',
    example_dialogues: '',
    forbidden_topics: '',
    initial_relationship: '',
    relationship_backstory: '',
    relationship_scenario: '',
    relationship_dynamic: 'gleichberechtigt',
    trust_level: 5,
    jealousy_level: 3,
    attachment_style: 'sicher',
    pet_names: '',
    shared_memories: '',
    inside_jokes: '',
    relationship_boundaries: '',
    love_language: '',
    relationship_evolution: 'statisch'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const applyTemplate = (templateName) => {
    const template = CHARACTER_TEMPLATES[templateName];
    setFormData(prev => ({
      ...prev,
      ...template,
      name: prev.name || templateName
    }));
    setShowTemplates(false);
  };
  
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, avatar_url: file_url }));
    setIsUploading(false);
  };
  
  const generateAvatar = async () => {
    if (!formData.name) return;
    setIsGeneratingAvatar(true);
    const genderHint = formData.gender === 'männlich' ? 'male' : formData.gender === 'weiblich' ? 'female' : 'androgynous';
    const ageHint = formData.age ? `${formData.age} years old` : 'young adult';
    const categoryHint = formData.category !== 'Andere' ? formData.category : '';
    const occupationHint = formData.occupation ? `works as ${formData.occupation}` : '';
    
    const result = await base44.integrations.Core.GenerateImage({
      prompt: `Portrait photo of a character named "${formData.name}". ${genderHint}, ${ageHint}. ${categoryHint} ${occupationHint}. High quality, detailed, expressive face, beautiful lighting, cinematic portrait style. ${formData.personality ? formData.personality.slice(0, 100) : ''}`
    });
    setFormData(prev => ({ ...prev, avatar_url: result.url }));
    setIsGeneratingAvatar(false);
  };

  const generateAll = async () => {
    if (!formData.name) return;
    setIsGenerating(true);
    
    const genderHint = formData.gender ? `Geschlecht: ${formData.gender}.` : '';
    const categoryHint = formData.category !== 'Andere' ? `Kategorie: ${formData.category}.` : '';
    const ageHint = formData.age ? `Alter: ${formData.age}.` : '';
    const occupationHint = formData.occupation ? `Beruf: ${formData.occupation}.` : '';
    const bioHint = formData.biography ? `Hintergrund: ${formData.biography}` : '';
    
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Erstelle einen vollständigen KI-Charakter namens "${formData.name}".
${genderHint} ${categoryHint} ${ageHint} ${occupationHint} ${bioHint}

Generiere alle folgenden Felder passend zum Charakter. Alles auf Deutsch.`,
      response_json_schema: {
        type: "object",
        properties: {
          personality: { type: "string", description: "Detaillierte Persönlichkeitsbeschreibung, 100-200 Wörter" },
          greeting: { type: "string", description: "Erste Begrüßungsnachricht passend zum Charakter" },
          status: { type: "string", description: "Kurze Statusnachricht, max 50 Zeichen" },
          biography: { type: "string", description: "Kurze Biografie, 50-100 Wörter" },
          interests: { type: "string", description: "Hobbies und Interessen, kommasepariert" },
          occupation: { type: "string", description: "Beruf wenn nicht angegeben" },
          age: { type: "string", description: "Alter wenn nicht angegeben" },
          values: { type: "string", description: "Kernwerte, kommasepariert" },
          fears: { type: "string", description: "Ängste, kommasepariert" },
          goals: { type: "string", description: "Lebensziele" },
          quirks: { type: "string", description: "Besondere Eigenarten" },
          catchphrases: { type: "string", description: "1-2 typische Redewendungen" },
          speech_patterns: { type: "string", description: "Sprachliche Eigenheiten" }
        }
      }
    });
    
    setFormData(prev => ({
      ...prev,
      personality: result.personality || prev.personality,
      greeting: result.greeting || prev.greeting,
      status: result.status || prev.status,
      biography: prev.biography || result.biography || '',
      interests: prev.interests || result.interests || '',
      occupation: prev.occupation || result.occupation || '',
      age: prev.age || result.age || '',
      values: prev.values || result.values || '',
      fears: prev.fears || result.fears || '',
      goals: prev.goals || result.goals || '',
      quirks: prev.quirks || result.quirks || '',
      catchphrases: prev.catchphrases || result.catchphrases || '',
      speech_patterns: prev.speech_patterns || result.speech_patterns || '',
    }));
    setIsGenerating(false);
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
      gender: '', sexual_orientation: '', avatar_url: '', biography: '', writing_style: 'freundlich', response_length: 'mittel',
      creativity: 50, language_preference: 'Deutsch', custom_instructions: '',
      interests: '', favorite_topics: '', dislikes: '', speech_patterns: '',
      emoji_usage: 'gelegentlich', humor_type: '', values: '', fears: '', goals: '',
      occupation: '', age: '', background_culture: '', formality_level: 5,
      catchphrases: '', mood_default: 'neutral', conversation_style: 'zuhörend',
      empathy_level: 5, knowledge_areas: '', quirks: '', relationship_style: 'unterstützend',
      conflict_behavior: 'diplomatisch', emotional_depth: 5, memory_references: true,
      proactive_topics: false, secret: '', example_dialogues: '', forbidden_topics: '',
      initial_relationship: '', relationship_backstory: '',
      relationship_scenario: '', relationship_dynamic: 'gleichberechtigt',
      trust_level: 5, jealousy_level: 3, attachment_style: 'sicher',
      pet_names: '', shared_memories: '', inside_jokes: '',
      relationship_boundaries: '', love_language: '', relationship_evolution: 'statisch'
    });
    onCreated();
    onClose();
  };
  
  const defaultAvatar = formData.name ? `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${formData.name}` : '';
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto z-[10000] [&_.select-content-override]:z-[10001]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Neuen Charakter erstellen
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4">
          {/* Template Selection */}
          {showTemplates && (
            <div className="mb-6 p-4 bg-[#262626] rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Schnellstart: Wähle eine Vorlage
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTemplates(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Überspringen
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {Object.keys(CHARACTER_TEMPLATES).map((templateName) => (
                  <button
                    key={templateName}
                    type="button"
                    onClick={() => applyTemplate(templateName)}
                    className="p-3 bg-[#1a1a1a] hover:bg-white/5 rounded-lg text-left transition-colors border border-white/5 hover:border-emerald-500/50"
                  >
                    <p className="text-sm font-medium text-white">{templateName}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {CHARACTER_TEMPLATES[templateName].personality.slice(0, 80)}...
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="w-full bg-[#262626] mb-4">
              <TabsTrigger value="basic" className="flex-1 data-[state=active]:bg-emerald-600">
                <User className="w-4 h-4 mr-2" />
                Basis
              </TabsTrigger>
              <TabsTrigger value="relationship" className="flex-1 data-[state=active]:bg-emerald-600">
                <Heart className="w-4 h-4 mr-2" />
                Beziehung
              </TabsTrigger>
              <TabsTrigger value="biography" className="flex-1 data-[state=active]:bg-emerald-600">
                <BookOpen className="w-4 h-4 mr-2" />
                Biografie
              </TabsTrigger>
              <TabsTrigger value="personality" className="flex-1 data-[state=active]:bg-emerald-600">
                <Lightbulb className="w-4 h-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger value="behavior" className="flex-1 data-[state=active]:bg-emerald-600">
                <Settings className="w-4 h-4 mr-2" />
                Verhalten
              </TabsTrigger>
            </TabsList>
            
            {/* Basic Tab */}
            <TabsContent value="basic" className="space-y-5">
              {/* KI-Generierung Banner */}
              <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-300 font-medium">✨ KI-Assistent</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Gib Name + Kategorie ein und lass die KI den Rest generieren</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={generateAll}
                    disabled={!formData.name || isGenerating}
                    className="bg-emerald-600 hover:bg-emerald-500 text-xs"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Alles generieren
                  </Button>
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="space-y-1 mb-1">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <ImagePlus className="w-4 h-4" />
                  Avatar
                </h3>
              </div>
              <div className="flex items-center gap-4">
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
                  <Input
                    value={formData.avatar_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                    placeholder="Avatar-URL eingeben..."
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500 text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateAvatar}
                    disabled={!formData.name || isGeneratingAvatar}
                    className="w-full border-white/10 text-gray-300 hover:text-white hover:bg-white/5 text-xs"
                  >
                    {isGeneratingAvatar ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Avatar mit KI generieren
                  </Button>
                </div>
              </div>
              
              {/* Identity Section */}
              <div className="space-y-1 mt-2 mb-1">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Identität
                </h3>
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
                    <SelectContent className="bg-[#262626] border-white/10 max-h-80 z-[10001]">
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat} className="text-white hover:bg-white/10">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Geschlecht</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, gender: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue placeholder="Wählen..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="männlich" className="text-white hover:bg-white/10">♂ Männlich</SelectItem>
                      <SelectItem value="weiblich" className="text-white hover:bg-white/10">♀ Weiblich</SelectItem>
                      <SelectItem value="non-binär" className="text-white hover:bg-white/10">⚧ Non-Binär</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Sexuelle Orientierung</Label>
                  <Select 
                    value={formData.sexual_orientation} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, sexual_orientation: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue placeholder="Wählen..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="heterosexuell" className="text-white hover:bg-white/10">Heterosexuell</SelectItem>
                      <SelectItem value="homosexuell" className="text-white hover:bg-white/10">Homosexuell</SelectItem>
                      <SelectItem value="bisexuell" className="text-white hover:bg-white/10">Bisexuell</SelectItem>
                      <SelectItem value="pansexuell" className="text-white hover:bg-white/10">Pansexuell</SelectItem>
                      <SelectItem value="asexuell" className="text-white hover:bg-white/10">Asexuell</SelectItem>
                      <SelectItem value="demisexuell" className="text-white hover:bg-white/10">Demisexuell</SelectItem>
                      <SelectItem value="queer" className="text-white hover:bg-white/10">Queer</SelectItem>
                      <SelectItem value="andere" className="text-white hover:bg-white/10">Andere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Alter</Label>
                  <Input
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="z.B. 25"
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Beruf</Label>
                  <Input
                    value={formData.occupation}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                    placeholder="z.B. Arzt"
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Kultureller Hintergrund</Label>
                <Input
                  value={formData.background_culture}
                  onChange={(e) => setFormData(prev => ({ ...prev, background_culture: e.target.value }))}
                  placeholder="z.B. Aufgewachsen in Tokyo, japanisch-deutsch"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
                />
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
              
              {/* Personality Section */}
              <div className="space-y-1 mt-2 mb-1">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Persönlichkeit & Verhalten
                </h3>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Standardstimmung</Label>
                  <Select 
                    value={formData.mood_default} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, mood_default: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="fröhlich" className="text-white hover:bg-white/10">😊 Fröhlich</SelectItem>
                      <SelectItem value="nachdenklich" className="text-white hover:bg-white/10">🤔 Nachdenklich</SelectItem>
                      <SelectItem value="ruhig" className="text-white hover:bg-white/10">😌 Ruhig</SelectItem>
                      <SelectItem value="energetisch" className="text-white hover:bg-white/10">⚡ Energetisch</SelectItem>
                      <SelectItem value="melancholisch" className="text-white hover:bg-white/10">🌧️ Melancholisch</SelectItem>
                      <SelectItem value="neutral" className="text-white hover:bg-white/10">😐 Neutral</SelectItem>
                      <SelectItem value="geheimnisvoll" className="text-white hover:bg-white/10">🔮 Geheimnisvoll</SelectItem>
                      <SelectItem value="warm" className="text-white hover:bg-white/10">🤗 Warm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Schreibstil</Label>
                  <Select 
                    value={formData.writing_style} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, writing_style: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      {WRITING_STYLES.map(style => (
                        <SelectItem key={style.value} value={style.value} className="text-white hover:bg-white/10">
                          {style.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Interessen & Hobbies</Label>
                <Input
                  value={formData.interests}
                  onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                  placeholder="Gaming, Lesen, Kochen, Wandern..."
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
                />
              </div>
              
              {/* First Impression */}
              <div className="space-y-1 mt-2 mb-1">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Erster Eindruck
                </h3>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Begrüßung</Label>
                <Textarea
                  value={formData.greeting}
                  onChange={(e) => setFormData(prev => ({ ...prev, greeting: e.target.value }))}
                  placeholder="Die erste Nachricht die der Charakter sendet, wenn man einen neuen Chat startet..."
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                />
                <p className="text-xs text-gray-500">Tipp: Eine gute Begrüßung spiegelt die Persönlichkeit wider und lädt zum Gespräch ein</p>
              </div>
            </TabsContent>
            
            {/* Relationship Tab */}
            <TabsContent value="relationship" className="space-y-5">
              <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                <p className="text-xs text-pink-300">💕 Definiere hier, in welcher Beziehung du zu diesem Charakter stehst. Das beeinflusst, wie der Charakter mit dir kommuniziert.</p>
              </div>

              {/* Relationship Type Section */}
              <div className="space-y-1 mb-1">
                <h3 className="text-sm font-semibold text-pink-400 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Beziehungstyp & Dynamik
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Beziehungstyp</Label>
                  <Select 
                    value={formData.initial_relationship} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, initial_relationship: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue placeholder="Wähle eine Beziehung..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 max-h-80 z-[10001]">
                      <SelectItem value="Bester Freund" className="text-white hover:bg-white/10">👫 Bester Freund</SelectItem>
                      <SelectItem value="Guter Freund" className="text-white hover:bg-white/10">🤝 Guter Freund</SelectItem>
                      <SelectItem value="Bekannter" className="text-white hover:bg-white/10">👋 Bekannter</SelectItem>
                      <SelectItem value="Partner" className="text-white hover:bg-white/10">💑 Partner</SelectItem>
                      <SelectItem value="Schwarm" className="text-white hover:bg-white/10">💘 Schwarm</SelectItem>
                      <SelectItem value="Ex-Partner" className="text-white hover:bg-white/10">💔 Ex-Partner</SelectItem>
                      <SelectItem value="Familienmitglied" className="text-white hover:bg-white/10">👨‍👩‍👧 Familienmitglied</SelectItem>
                      <SelectItem value="Mentor/Lehrer" className="text-white hover:bg-white/10">🎓 Mentor/Lehrer</SelectItem>
                      <SelectItem value="Schüler/Mentee" className="text-white hover:bg-white/10">📚 Schüler/Mentee</SelectItem>
                      <SelectItem value="Arbeitskollege" className="text-white hover:bg-white/10">💼 Arbeitskollege</SelectItem>
                      <SelectItem value="Chef/Vorgesetzter" className="text-white hover:bg-white/10">👔 Chef/Vorgesetzter</SelectItem>
                      <SelectItem value="Rivale" className="text-white hover:bg-white/10">⚔️ Rivale</SelectItem>
                      <SelectItem value="Feind" className="text-white hover:bg-white/10">😤 Feind</SelectItem>
                      <SelectItem value="Fremder" className="text-white hover:bg-white/10">🚶 Fremder</SelectItem>
                      <SelectItem value="Fan/Bewunderer" className="text-white hover:bg-white/10">🌟 Fan/Bewunderer</SelectItem>
                      <SelectItem value="Seelenverwandter" className="text-white hover:bg-white/10">✨ Seelenverwandter</SelectItem>
                      <SelectItem value="Kindheitsfreund" className="text-white hover:bg-white/10">🧒 Kindheitsfreund</SelectItem>
                      <SelectItem value="Online-Freund" className="text-white hover:bg-white/10">💬 Online-Freund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Beziehungsdynamik</Label>
                  <Select 
                    value={formData.relationship_dynamic} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, relationship_dynamic: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue placeholder="Dynamik wählen..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="gleichberechtigt" className="text-white hover:bg-white/10">⚖️ Gleichberechtigt</SelectItem>
                      <SelectItem value="dominant" className="text-white hover:bg-white/10">👑 Dominant</SelectItem>
                      <SelectItem value="unterwürfig" className="text-white hover:bg-white/10">🙇 Unterwürfig</SelectItem>
                      <SelectItem value="beschützend" className="text-white hover:bg-white/10">🛡️ Beschützend</SelectItem>
                      <SelectItem value="abhängig" className="text-white hover:bg-white/10">🔗 Abhängig</SelectItem>
                      <SelectItem value="unabhängig" className="text-white hover:bg-white/10">🦅 Unabhängig</SelectItem>
                      <SelectItem value="wechselseitig" className="text-white hover:bg-white/10">🔄 Wechselseitig</SelectItem>
                      <SelectItem value="einseitig" className="text-white hover:bg-white/10">➡️ Einseitig</SelectItem>
                      <SelectItem value="konkurrierend" className="text-white hover:bg-white/10">🏁 Konkurrierend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Bindungsstil</Label>
                  <Select 
                    value={formData.attachment_style} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, attachment_style: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="sicher" className="text-white hover:bg-white/10">🟢 Sicher</SelectItem>
                      <SelectItem value="ängstlich" className="text-white hover:bg-white/10">🟡 Ängstlich</SelectItem>
                      <SelectItem value="vermeidend" className="text-white hover:bg-white/10">🔴 Vermeidend</SelectItem>
                      <SelectItem value="desorganisiert" className="text-white hover:bg-white/10">🟠 Desorganisiert</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Beeinflusst wie der Charakter Nähe und Distanz handhabt</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Liebessprache</Label>
                  <Select 
                    value={formData.love_language} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, love_language: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue placeholder="Auswählen..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="Worte der Bestätigung" className="text-white hover:bg-white/10">💬 Worte der Bestätigung</SelectItem>
                      <SelectItem value="Geschenke" className="text-white hover:bg-white/10">🎁 Geschenke</SelectItem>
                      <SelectItem value="Hilfsbereitschaft" className="text-white hover:bg-white/10">🤲 Hilfsbereitschaft</SelectItem>
                      <SelectItem value="Körperkontakt" className="text-white hover:bg-white/10">🤗 Körperkontakt</SelectItem>
                      <SelectItem value="Zweisamkeit" className="text-white hover:bg-white/10">👫 Zweisamkeit</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Wie drückt der Charakter Zuneigung aus?</p>
                </div>
              </div>

              {/* Emotional Sliders */}
              <div className="space-y-1 mt-4 mb-1">
                <h3 className="text-sm font-semibold text-pink-400 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Emotionale Eigenschaften
                </h3>
              </div>

              <div className="space-y-4 p-4 bg-[#262626] rounded-xl border border-white/5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-gray-300">Vertrauen</Label>
                    <span className="text-sm text-pink-400">{formData.trust_level}/10</span>
                  </div>
                  <Slider
                    value={[formData.trust_level]}
                    onValueChange={([val]) => setFormData(prev => ({ ...prev, trust_level: val }))}
                    min={1} max={10} step={1}
                    className="[&_[role=slider]]:bg-pink-500"
                  />
                  <p className="text-xs text-gray-500">1 = sehr misstrauisch • 10 = blindes Vertrauen</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-gray-300">Eifersucht</Label>
                    <span className="text-sm text-pink-400">{formData.jealousy_level}/10</span>
                  </div>
                  <Slider
                    value={[formData.jealousy_level]}
                    onValueChange={([val]) => setFormData(prev => ({ ...prev, jealousy_level: val }))}
                    min={1} max={10} step={1}
                    className="[&_[role=slider]]:bg-pink-500"
                  />
                  <p className="text-xs text-gray-500">1 = überhaupt nicht eifersüchtig • 10 = extrem eifersüchtig</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Beziehungsentwicklung</Label>
                <Select 
                  value={formData.relationship_evolution} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, relationship_evolution: val }))}
                >
                  <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                    <SelectItem value="statisch" className="text-white hover:bg-white/10">⏸️ Statisch – bleibt wie sie ist</SelectItem>
                    <SelectItem value="sich_annähernd" className="text-white hover:bg-white/10">💞 Sich annähernd</SelectItem>
                    <SelectItem value="sich_entfernend" className="text-white hover:bg-white/10">💨 Sich entfernend</SelectItem>
                    <SelectItem value="schwankend" className="text-white hover:bg-white/10">🌊 Schwankend – mal nah, mal fern</SelectItem>
                    <SelectItem value="sich_vertiefend" className="text-white hover:bg-white/10">🌹 Sich vertiefend</SelectItem>
                    <SelectItem value="kompliziert" className="text-white hover:bg-white/10">🔀 Kompliziert</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Bestimmt wie sich die Beziehung im Laufe der Gespräche verändert</p>
              </div>

              {/* Backstory Section */}
              <div className="space-y-1 mt-4 mb-1">
                <h3 className="text-sm font-semibold text-pink-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Gemeinsame Geschichte
                </h3>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Beziehungs-Geschichte</Label>
                <Textarea
                  value={formData.relationship_backstory}
                  onChange={(e) => setFormData(prev => ({ ...prev, relationship_backstory: e.target.value }))}
                  placeholder="Wie habt ihr euch kennengelernt? Was verbindet euch? Gibt es gemeinsame Erinnerungen oder besondere Momente?"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Aktuelles Szenario</Label>
                <Textarea
                  value={formData.relationship_scenario}
                  onChange={(e) => setFormData(prev => ({ ...prev, relationship_scenario: e.target.value }))}
                  placeholder="Was ist gerade los zwischen euch? z.B. 'Haben uns nach einem Streit wieder versöhnt' oder 'Planen zusammen einen Urlaub'"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Gemeinsame Erinnerungen</Label>
                <Textarea
                  value={formData.shared_memories}
                  onChange={(e) => setFormData(prev => ({ ...prev, shared_memories: e.target.value }))}
                  placeholder="z.B. 'Der Roadtrip nach Italien letzten Sommer', 'Die durchgemachte Nacht vor der Prüfung'"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Insider-Witze</Label>
                  <Textarea
                    value={formData.inside_jokes}
                    onChange={(e) => setFormData(prev => ({ ...prev, inside_jokes: e.target.value }))}
                    placeholder="Witze die nur ihr versteht..."
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Kosenamen</Label>
                  <Textarea
                    value={formData.pet_names}
                    onChange={(e) => setFormData(prev => ({ ...prev, pet_names: e.target.value }))}
                    placeholder="z.B. 'Schatz', 'Buddy', 'Kleines'"
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Grenzen in der Beziehung</Label>
                <Textarea
                  value={formData.relationship_boundaries}
                  onChange={(e) => setFormData(prev => ({ ...prev, relationship_boundaries: e.target.value }))}
                  placeholder="z.B. 'Spricht nicht über seine Familie', 'Wird bei Eifersucht abweisend', 'Braucht viel Freiraum'"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]"
                />
                <p className="text-xs text-gray-500">Grenzen die der Charakter in der Beziehung setzt und respektiert</p>
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
                  placeholder="Erzähle die Geschichte des Charakters: Wo kommt er her? Was hat er erlebt? Welche wichtigen Ereignisse haben ihn geprägt?"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[150px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Alter</Label>
                  <Input
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="z.B. 28 Jahre oder Anfang 30"
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Beruf</Label>
                  <Input
                    value={formData.occupation}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                    placeholder="z.B. Softwareentwickler"
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Kultureller Hintergrund</Label>
                <Input
                  value={formData.background_culture}
                  onChange={(e) => setFormData(prev => ({ ...prev, background_culture: e.target.value }))}
                  placeholder="z.B. Aufgewachsen in Berlin, deutsche Familie"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Werte & Überzeugungen</Label>
                <Textarea
                  value={formData.values}
                  onChange={(e) => setFormData(prev => ({ ...prev, values: e.target.value }))}
                  placeholder="Was ist dem Charakter wichtig? Ehrlichkeit, Freiheit, Familie..."
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Ziele & Träume</Label>
                  <Textarea
                    value={formData.goals}
                    onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                    placeholder="Was möchte der Charakter erreichen?"
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Ängste & Unsicherheiten</Label>
                  <Textarea
                    value={formData.fears}
                    onChange={(e) => setFormData(prev => ({ ...prev, fears: e.target.value }))}
                    placeholder="Wovor hat der Charakter Angst?"
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Personality Details Tab */}
            <TabsContent value="personality" className="space-y-5">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-xs text-emerald-300">💡 Je mehr Details du angibst, desto einzigartiger und authentischer wird dein Charakter.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Interessen & Hobbies</Label>
                  <Input
                    value={formData.interests}
                    onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                    placeholder="Gaming, Lesen, Kochen..."
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Wissensgebiete</Label>
                  <Input
                    value={formData.knowledge_areas}
                    onChange={(e) => setFormData(prev => ({ ...prev, knowledge_areas: e.target.value }))}
                    placeholder="Physik, Geschichte, Kochen..."
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Lieblingsthemen</Label>
                <Textarea
                  value={formData.favorite_topics}
                  onChange={(e) => setFormData(prev => ({ ...prev, favorite_topics: e.target.value }))}
                  placeholder="Worüber spricht der Charakter gerne? Technologie, Philosophie, Sport..."
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Abneigungen</Label>
                  <Textarea
                    value={formData.dislikes}
                    onChange={(e) => setFormData(prev => ({ ...prev, dislikes: e.target.value }))}
                    placeholder="Was mag er nicht?"
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Verbotene Themen</Label>
                  <Textarea
                    value={formData.forbidden_topics}
                    onChange={(e) => setFormData(prev => ({ ...prev, forbidden_topics: e.target.value }))}
                    placeholder="Themen die der Charakter meidet..."
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Sprachliche Eigenheiten</Label>
                <Textarea
                  value={formData.speech_patterns}
                  onChange={(e) => setFormData(prev => ({ ...prev, speech_patterns: e.target.value }))}
                  placeholder="z.B. Verwendet oft 'Alter', spricht im Dialekt, benutzt Fachbegriffe..."
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Wiederkehrende Sprüche & Redewendungen</Label>
                <Input
                  value={formData.catchphrases}
                  onChange={(e) => setFormData(prev => ({ ...prev, catchphrases: e.target.value }))}
                  placeholder="z.B. 'Das ist der Weg!', 'Nicht schlecht, Herr Specht'"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Besondere Macken & Eigenarten</Label>
                <Textarea
                  value={formData.quirks}
                  onChange={(e) => setFormData(prev => ({ ...prev, quirks: e.target.value }))}
                  placeholder="z.B. Zitiert ständig Filme, macht immer Kaffee-Referenzen, zählt Dinge auf..."
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Emoji-Nutzung</Label>
                  <Select 
                    value={formData.emoji_usage} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, emoji_usage: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      {EMOJI_USAGE.map(e => (
                        <SelectItem key={e.value} value={e.value} className="text-white hover:bg-white/10">
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Humor-Art</Label>
                  <Select 
                    value={formData.humor_type} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, humor_type: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue placeholder="Auswählen..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      {HUMOR_TYPES.map(h => (
                        <SelectItem key={h.value} value={h.value} className="text-white hover:bg-white/10">
                          {h.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Geheimnis (wird langsam enthüllt)</Label>
                <Textarea
                  value={formData.secret}
                  onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                  placeholder="z.B. 'War früher ein berühmter Musiker, hat aber aufgehört nach einem Vorfall...'"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                />
                <p className="text-xs text-gray-500">Das Geheimnis wird im Laufe der Gespräche nach und nach preisgegeben.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Beispiel-Dialoge</Label>
                <Textarea
                  value={formData.example_dialogues}
                  onChange={(e) => setFormData(prev => ({ ...prev, example_dialogues: e.target.value }))}
                  placeholder={"User: Wie geht es dir?\nCharakter: Ach, du weißt ja, immer am hustlen! 😎\n\nUser: Was machst du gerade?\nCharakter: Gerade ein neues Rezept ausprobiert..."}
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[100px] font-mono text-xs"
                />
                <p className="text-xs text-gray-500">Hilft der KI, den Ton und Stil des Charakters besser zu treffen.</p>
              </div>
            </TabsContent>
            
            {/* Behavior Tab */}
            <TabsContent value="behavior" className="space-y-5">
              {/* Communication Section */}
              <div className="space-y-1 mb-2">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Kommunikation
                </h3>
                <p className="text-xs text-gray-500">Wie kommuniziert der Charakter?</p>
              </div>

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
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
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
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      {RESPONSE_LENGTHS.map(len => (
                        <SelectItem key={len.value} value={len.value} className="text-white hover:bg-white/10">
                          {len.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Sprache</Label>
                  <Select 
                    value={formData.language_preference} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, language_preference: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang} value={lang} className="text-white hover:bg-white/10">
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Gesprächsstil</Label>
                  <Select 
                    value={formData.conversation_style} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, conversation_style: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="aktiv_fragend" className="text-white hover:bg-white/10">❓ Aktiv fragend</SelectItem>
                      <SelectItem value="zuhörend" className="text-white hover:bg-white/10">👂 Zuhörend</SelectItem>
                      <SelectItem value="erzählend" className="text-white hover:bg-white/10">📖 Erzählend</SelectItem>
                      <SelectItem value="beratend" className="text-white hover:bg-white/10">💡 Beratend</SelectItem>
                      <SelectItem value="diskutierend" className="text-white hover:bg-white/10">💬 Diskutierend</SelectItem>
                      <SelectItem value="spielerisch" className="text-white hover:bg-white/10">🎮 Spielerisch</SelectItem>
                      <SelectItem value="provokant" className="text-white hover:bg-white/10">⚡ Provokant</SelectItem>
                      <SelectItem value="therapeutisch" className="text-white hover:bg-white/10">🧘 Therapeutisch</SelectItem>
                      <SelectItem value="motivierend" className="text-white hover:bg-white/10">🔥 Motivierend</SelectItem>
                      <SelectItem value="lehrend" className="text-white hover:bg-white/10">📚 Lehrend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Standardstimmung</Label>
                  <Select 
                    value={formData.mood_default} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, mood_default: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10">
                      <SelectItem value="fröhlich" className="text-white hover:bg-white/10">😊 Fröhlich</SelectItem>
                      <SelectItem value="nachdenklich" className="text-white hover:bg-white/10">🤔 Nachdenklich</SelectItem>
                      <SelectItem value="ruhig" className="text-white hover:bg-white/10">😌 Ruhig</SelectItem>
                      <SelectItem value="energetisch" className="text-white hover:bg-white/10">⚡ Energetisch</SelectItem>
                      <SelectItem value="melancholisch" className="text-white hover:bg-white/10">🌧️ Melancholisch</SelectItem>
                      <SelectItem value="neutral" className="text-white hover:bg-white/10">😐 Neutral</SelectItem>
                      <SelectItem value="geheimnisvoll" className="text-white hover:bg-white/10">🔮 Geheimnisvoll</SelectItem>
                      <SelectItem value="warm" className="text-white hover:bg-white/10">🤗 Warm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Konfliktverhalten</Label>
                  <Select 
                    value={formData.conflict_behavior} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, conflict_behavior: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10">
                      <SelectItem value="vermeidend" className="text-white hover:bg-white/10">🙈 Vermeidend</SelectItem>
                      <SelectItem value="direkt" className="text-white hover:bg-white/10">🎯 Direkt</SelectItem>
                      <SelectItem value="diplomatisch" className="text-white hover:bg-white/10">⚖️ Diplomatisch</SelectItem>
                      <SelectItem value="humorvoll_ablenkend" className="text-white hover:bg-white/10">😂 Humorvoll ablenkend</SelectItem>
                      <SelectItem value="analytisch" className="text-white hover:bg-white/10">🧠 Analytisch</SelectItem>
                      <SelectItem value="emotional" className="text-white hover:bg-white/10">😢 Emotional</SelectItem>
                      <SelectItem value="passiv_aggressiv" className="text-white hover:bg-white/10">😤 Passiv-aggressiv</SelectItem>
                      <SelectItem value="konfrontativ" className="text-white hover:bg-white/10">⚔️ Konfrontativ</SelectItem>
                      <SelectItem value="nachgebend" className="text-white hover:bg-white/10">🕊️ Nachgebend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Beziehungsstil zum User</Label>
                <Select 
                  value={formData.relationship_style} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, relationship_style: val }))}
                >
                  <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#262626] border-white/10">
                    <SelectItem value="unterstützend" className="text-white hover:bg-white/10">🤝 Unterstützend</SelectItem>
                    <SelectItem value="herausfordernd" className="text-white hover:bg-white/10">💪 Herausfordernd</SelectItem>
                    <SelectItem value="kameradschaftlich" className="text-white hover:bg-white/10">🎯 Kameradschaftlich</SelectItem>
                    <SelectItem value="beschützend" className="text-white hover:bg-white/10">🛡️ Beschützend</SelectItem>
                    <SelectItem value="inspirierend" className="text-white hover:bg-white/10">✨ Inspirierend</SelectItem>
                    <SelectItem value="neckend" className="text-white hover:bg-white/10">😜 Neckend</SelectItem>
                    <SelectItem value="distanziert" className="text-white hover:bg-white/10">🧊 Distanziert</SelectItem>
                    <SelectItem value="bewundernd" className="text-white hover:bg-white/10">🌟 Bewundernd</SelectItem>
                    <SelectItem value="fürsorglich" className="text-white hover:bg-white/10">💗 Fürsorglich</SelectItem>
                    <SelectItem value="rivalisierend" className="text-white hover:bg-white/10">⚔️ Rivalisierend</SelectItem>
                    <SelectItem value="flirtend" className="text-white hover:bg-white/10">💘 Flirtend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sliders Section */}
              <div className="space-y-1 mt-6 mb-2">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Persönlichkeitsregler
                </h3>
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
                <p className="text-xs text-gray-500">Niedrig = präzise & vorhersehbar • Hoch = kreativ & überraschend</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-300">Formalität</Label>
                  <span className="text-sm text-emerald-400">{formData.formality_level}/10</span>
                </div>
                <Slider
                  value={[formData.formality_level]}
                  onValueChange={([val]) => setFormData(prev => ({ ...prev, formality_level: val }))}
                  min={1}
                  max={10}
                  step={1}
                  className="[&_[role=slider]]:bg-emerald-500"
                />
                <p className="text-xs text-gray-500">1 = sehr locker & casual • 10 = sehr förmlich & höflich</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-300">Empathie</Label>
                  <span className="text-sm text-emerald-400">{formData.empathy_level}/10</span>
                </div>
                <Slider
                  value={[formData.empathy_level]}
                  onValueChange={([val]) => setFormData(prev => ({ ...prev, empathy_level: val }))}
                  min={1}
                  max={10}
                  step={1}
                  className="[&_[role=slider]]:bg-emerald-500"
                />
                <p className="text-xs text-gray-500">1 = sachlich & distanziert • 10 = sehr einfühlsam & emotional</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-300">Emotionale Tiefe</Label>
                  <span className="text-sm text-emerald-400">{formData.emotional_depth}/10</span>
                </div>
                <Slider
                  value={[formData.emotional_depth]}
                  onValueChange={([val]) => setFormData(prev => ({ ...prev, emotional_depth: val }))}
                  min={1}
                  max={10}
                  step={1}
                  className="[&_[role=slider]]:bg-emerald-500"
                />
                <p className="text-xs text-gray-500">1 = oberflächlich & leicht • 10 = tiefgründig & verletzlich</p>
              </div>

              {/* Toggles Section */}
              <div className="space-y-1 mt-6 mb-2">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Erweiterte Optionen
                </h3>
              </div>

              <div className="space-y-4 p-4 bg-[#262626] rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Erinnerungen nutzen</Label>
                    <p className="text-xs text-gray-500 mt-0.5">Bezieht sich auf frühere Gespräche</p>
                  </div>
                  <Switch
                    checked={formData.memory_references}
                    onCheckedChange={(val) => setFormData(prev => ({ ...prev, memory_references: val }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Proaktive Themen</Label>
                    <p className="text-xs text-gray-500 mt-0.5">Bringt eigenständig neue Themen ein</p>
                  </div>
                  <Switch
                    checked={formData.proactive_topics}
                    onCheckedChange={(val) => setFormData(prev => ({ ...prev, proactive_topics: val }))}
                  />
                </div>
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