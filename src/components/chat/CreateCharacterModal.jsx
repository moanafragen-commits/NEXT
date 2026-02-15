import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Loader2, Wand2, Upload, User, Settings, BookOpen, Heart, MessageSquare, Zap, Brain, Shield, Lock, Lightbulb, ImagePlus, Briefcase, Clock, HeartCrack, Flame, Eye, Battery, Moon, Palette, Globe, Sword } from 'lucide-react';
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
  { value: "weise", label: "🦉 Weise" },
  { value: "melancholisch", label: "🌧️ Melancholisch" },
  { value: "provokant", label: "⚡ Provokant" },
  { value: "motivierend", label: "💪 Motivierend" },
  { value: "therapeutisch", label: "🧘 Therapeutisch" },
  { value: "erzählerisch", label: "📖 Erzählerisch" },
  { value: "flirtend", label: "😘 Flirtend" },
  { value: "gothic", label: "🖤 Gothic" },
  { value: "slang", label: "🤙 Slang / Jugendsprache" },
  { value: "eloquent", label: "🎩 Eloquent / Gehoben" },
  { value: "chaotisch", label: "🌀 Chaotisch" },
  { value: "trocken", label: "🏜️ Trocken / Deadpan" },
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
const MOOD_OPTIONS = [
  { value: "fröhlich", label: "😊 Fröhlich" },
  { value: "nachdenklich", label: "🤔 Nachdenklich" },
  { value: "ruhig", label: "😌 Ruhig" },
  { value: "energetisch", label: "⚡ Energetisch" },
  { value: "melancholisch", label: "🌧️ Melancholisch" },
  { value: "neutral", label: "😐 Neutral" },
  { value: "geheimnisvoll", label: "🔮 Geheimnisvoll" },
  { value: "warm", label: "🤗 Warm" },
  { value: "schüchtern", label: "😳 Schüchtern" },
  { value: "selbstbewusst", label: "😎 Selbstbewusst" },
  { value: "zynisch", label: "🙄 Zynisch" },
  { value: "liebevoll", label: "💗 Liebevoll" },
  { value: "rebellisch", label: "🤘 Rebellisch" },
  { value: "verträumt", label: "🌙 Verträumt" },
  { value: "stoisch", label: "🗿 Stoisch" },
  { value: "chaotisch", label: "🌀 Chaotisch" },
  { value: "beschützend", label: "🛡️ Beschützend" },
  { value: "distanziert", label: "🧊 Distanziert" },
  { value: "verspielt", label: "🎮 Verspielt" },
  { value: "düster", label: "🖤 Düster" },
  { value: "hoffnungsvoll", label: "🌅 Hoffnungsvoll" },
  { value: "nostalgisch", label: "📷 Nostalgisch" },
  { value: "wütend", label: "🔥 Wütend" },
  { value: "eifersüchtig", label: "😠 Eifersüchtig" },
  { value: "verletzlich", label: "🥺 Verletzlich" },
  { value: "übermütig", label: "🤪 Übermütig" },
  { value: "dankbar", label: "🙏 Dankbar" },
  { value: "einsam", label: "🥀 Einsam" },
  { value: "verwirrt", label: "😵‍💫 Verwirrt" },
  { value: "entschlossen", label: "✊ Entschlossen" },
  { value: "gleichgültig", label: "🫥 Gleichgültig" },
  { value: "euphorisch", label: "🥳 Euphorisch" },
  { value: "besorgt", label: "😟 Besorgt" },
  { value: "trotzig", label: "😤 Trotzig" },
  { value: "sehnsüchtig", label: "💭 Sehnsüchtig" },
  { value: "zufrieden", label: "☺️ Zufrieden" },
  { value: "misstrauisch", label: "🤨 Misstrauisch" },
  { value: "überwältigt", label: "😫 Überwältigt" },
  { value: "verlegen", label: "😳 Verlegen" },
  { value: "stolz", label: "💪 Stolz" },
  { value: "neidisch", label: "😒 Neidisch" },
  { value: "erleichtert", label: "😮‍💨 Erleichtert" },
  { value: "verzweifelt", label: "😩 Verzweifelt" },
  { value: "albern", label: "🤭 Albern" },
  { value: "dramatisch", label: "🎭 Dramatisch" },
  { value: "gelassen", label: "🧘 Gelassen" },
  { value: "aggressiv", label: "👊 Aggressiv" },
  { value: "flirtend", label: "😘 Flirtend" },
  { value: "müde", label: "😴 Müde" },
  { value: "hyperfokussiert", label: "🎯 Hyperfokussiert" },
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

const DEFAULT_FORM_DATA = {
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
    trauma: '',
    mental_health: '',
    medications: '',
    therapist_info: '',
    clinic_stays: '',
    diagnosis_age: '',
    therapy_attitude: '',
    self_harm_history: '',
    suicidality_history: '',
    dissociation: 'keine',
    dissociation_details: '',
    eating_disorder: '',
    psychosis_symptoms: '',
    self_image: '',
    external_image: '',
    recovery_status: 'nicht_zutreffend',
    support_system: 'mittel',
    support_system_details: '',
    body_image: '',
    introversion_level: 5,
    honesty_level: 7,
    loyalty_level: 7,
    patience_level: 5,
    energy_level: 'mittel',
    mood_cycle: 'stabil',
    addictions: '',
    phobias: '',
    nervous_ticks: '',
    triggers: '',
    coping_mechanisms: '',
    self_esteem: 5,
    stubbornness_level: 5,
    impulsivity_level: 5,
    social_battery: 'mittel',
    moral_compass: 'moralisch',
    sleeping_pattern: 'normal',
    stress_response: 'fight',
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
    relationship_evolution: 'statisch',
    // Aussehen
    height: '',
    body_type: '',
    hair_color: '',
    hair_style: '',
    eye_color: '',
    skin_tone: '',
    tattoos_piercings: '',
    scars_marks: '',
    clothing_style: '',
    distinctive_features: '',
    voice_description: '',
    scent: '',
    physical_fitness: 'durchschnittlich',
    // Persönlichkeitstypen
    mbti_type: '',
    zodiac_sign: '',
    enneagram_type: '',
    // Soziales
    languages_spoken: '',
    accent_dialect: '',
    education: '',
    living_situation: '',
    family_status: '',
    children: '',
    pets: '',
    political_stance: '',
    religion_spirituality: '',
    substance_use: '',
    social_media_behavior: '',
    // Intimität
    flirt_style: '',
    intimacy_experience: '',
    dom_sub_preference: '',
    kinks_preferences: '',
    intimacy_taboos: '',
    physical_description_intimate: '',
    intimacy_personality: '',
    turn_ons: '',
    turn_offs: '',
    aftercare_style: '',
    // Story
    storyline: '',
    world_setting: 'real_modern',
    npcs_in_life: ''
};

export default function CreateCharacterModal({ open, onClose, onCreated, editCharacter }) {
  const [showTemplates, setShowTemplates] = useState(!editCharacter);
  const [formData, setFormData] = useState(editCharacter ? { ...DEFAULT_FORM_DATA, ...editCharacter } : { ...DEFAULT_FORM_DATA });
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
  
  // Reset form when editCharacter changes
  React.useEffect(() => {
    if (editCharacter) {
      setFormData({ ...DEFAULT_FORM_DATA, ...editCharacter });
      setShowTemplates(false);
    } else {
      setFormData({ ...DEFAULT_FORM_DATA });
      setShowTemplates(true);
    }
  }, [editCharacter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.personality) return;
    
    setIsSaving(true);
    if (editCharacter) {
      const { id, created_date, updated_date, created_by, ...updateData } = formData;
      await base44.entities.Character.update(editCharacter.id, updateData);
    } else {
      await base44.entities.Character.create(formData);
    }
    setIsSaving(false);
    setFormData({ ...DEFAULT_FORM_DATA });
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
            {editCharacter ? 'Charakter bearbeiten' : 'Neuen Charakter erstellen'}
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
            <TabsList className="w-full bg-[#262626] mb-4 flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="basic" className="flex-1 min-w-[80px] data-[state=active]:bg-emerald-600 text-xs">
                <User className="w-3 h-3 mr-1" />
                Basis
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex-1 min-w-[80px] data-[state=active]:bg-emerald-600 text-xs">
                <Palette className="w-3 h-3 mr-1" />
                Aussehen
              </TabsTrigger>
              <TabsTrigger value="relationship" className="flex-1 min-w-[80px] data-[state=active]:bg-emerald-600 text-xs">
                <Heart className="w-3 h-3 mr-1" />
                Beziehung
              </TabsTrigger>
              <TabsTrigger value="biography" className="flex-1 min-w-[80px] data-[state=active]:bg-emerald-600 text-xs">
                <BookOpen className="w-3 h-3 mr-1" />
                Biografie
              </TabsTrigger>
              <TabsTrigger value="personality" className="flex-1 min-w-[80px] data-[state=active]:bg-emerald-600 text-xs">
                <Lightbulb className="w-3 h-3 mr-1" />
                Details
              </TabsTrigger>
              <TabsTrigger value="behavior" className="flex-1 min-w-[80px] data-[state=active]:bg-emerald-600 text-xs">
                <Settings className="w-3 h-3 mr-1" />
                Verhalten
              </TabsTrigger>
              <TabsTrigger value="intimacy" className="flex-1 min-w-[80px] data-[state=active]:bg-emerald-600 text-xs">
                <Flame className="w-3 h-3 mr-1" />
                Intimität
              </TabsTrigger>
              <TabsTrigger value="world" className="flex-1 min-w-[80px] data-[state=active]:bg-emerald-600 text-xs">
                <Globe className="w-3 h-3 mr-1" />
                Welt
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
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001] max-h-80">
                      {MOOD_OPTIONS.map(m => (
                        <SelectItem key={m.value} value={m.value} className="text-white hover:bg-white/10">{m.label}</SelectItem>
                      ))}
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

              <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Interessen & Hobbies</Label>
                <Input
                  value={formData.interests}
                  onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                  placeholder="Gaming, Lesen, Kochen, Wandern..."
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
              <Input
                value={formData.favorite_topics}
                onChange={(e) => setFormData(prev => ({ ...prev, favorite_topics: e.target.value }))}
                placeholder="Worüber spricht der Charakter gerne? Technologie, Philosophie, Sport..."
                className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Abneigungen</Label>
              <Input
                value={formData.dislikes}
                onChange={(e) => setFormData(prev => ({ ...prev, dislikes: e.target.value }))}
                placeholder="Was mag der Charakter nicht?"
                className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
              />
            </div>

            {/* Kommunikation Section */}
            <div className="space-y-1 mt-2 mb-1">
              <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Kommunikation
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label className="text-gray-300">Gesprächsstil</Label>
                <Select 
                  value={formData.conversation_style} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, conversation_style: val }))}
                >
                  <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#262626] border-white/10 z-[10001] max-h-80">
                    <SelectItem value="aktiv_fragend" className="text-white hover:bg-white/10">❓ Aktiv fragend</SelectItem>
                    <SelectItem value="zuhörend" className="text-white hover:bg-white/10">👂 Zuhörend</SelectItem>
                    <SelectItem value="erzählend" className="text-white hover:bg-white/10">📖 Erzählend</SelectItem>
                    <SelectItem value="beratend" className="text-white hover:bg-white/10">💡 Beratend</SelectItem>
                    <SelectItem value="diskutierend" className="text-white hover:bg-white/10">💬 Diskutierend</SelectItem>
                    <SelectItem value="spielerisch" className="text-white hover:bg-white/10">🎮 Spielerisch</SelectItem>
                    <SelectItem value="provokant" className="text-white hover:bg-white/10">⚡ Provokant</SelectItem>
                    <SelectItem value="therapeutisch" className="text-white hover:bg-white/10">🧘 Therapeutisch</SelectItem>
                    <SelectItem value="flirtend" className="text-white hover:bg-white/10">😘 Flirtend</SelectItem>
                    <SelectItem value="sarkastisch_neckend" className="text-white hover:bg-white/10">😏 Sarkastisch neckend</SelectItem>
                    <SelectItem value="tröstend" className="text-white hover:bg-white/10">🤗 Tröstend</SelectItem>
                    <SelectItem value="konfrontativ" className="text-white hover:bg-white/10">⚔️ Konfrontativ</SelectItem>
                    <SelectItem value="chaotisch_sprunghaft" className="text-white hover:bg-white/10">🌀 Chaotisch / Sprunghaft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              <Label className="text-gray-300">Sprachliche Eigenheiten</Label>
              <Input
                value={formData.speech_patterns}
                onChange={(e) => setFormData(prev => ({ ...prev, speech_patterns: e.target.value }))}
                placeholder="z.B. Verwendet oft 'Alter', spricht im Dialekt, benutzt Fachbegriffe..."
                className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Wiederkehrende Sprüche</Label>
              <Input
                value={formData.catchphrases}
                onChange={(e) => setFormData(prev => ({ ...prev, catchphrases: e.target.value }))}
                placeholder="z.B. 'Das ist der Weg!', 'Nicht schlecht, Herr Specht'"
                className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
              />
            </div>
              
            {/* Erster Eindruck */}
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
                      {/* Romantisch */}
                      <SelectItem value="Partner/in" className="text-white hover:bg-white/10">💑 Partner/in</SelectItem>
                      <SelectItem value="Schwarm" className="text-white hover:bg-white/10">💘 Schwarm</SelectItem>
                      <SelectItem value="Ex-Partner/in" className="text-white hover:bg-white/10">💔 Ex-Partner/in</SelectItem>
                      <SelectItem value="Ehemann/Ehefrau" className="text-white hover:bg-white/10">💍 Ehemann/Ehefrau</SelectItem>
                      <SelectItem value="Verlobte/r" className="text-white hover:bg-white/10">💎 Verlobte/r</SelectItem>
                      <SelectItem value="Affäre" className="text-white hover:bg-white/10">🔥 Affäre</SelectItem>
                      <SelectItem value="Sandkastenliebe" className="text-white hover:bg-white/10">🏖️ Sandkastenliebe</SelectItem>
                      <SelectItem value="Jugendliebe" className="text-white hover:bg-white/10">💞 Jugendliebe</SelectItem>
                      {/* Freundschaft */}
                      <SelectItem value="Bester Freund/Beste Freundin" className="text-white hover:bg-white/10">👫 Beste/r Freund/in</SelectItem>
                      <SelectItem value="Guter Freund/Gute Freundin" className="text-white hover:bg-white/10">🤝 Gute/r Freund/in</SelectItem>
                      <SelectItem value="Bekannte/r" className="text-white hover:bg-white/10">👋 Bekannte/r</SelectItem>
                      <SelectItem value="Kindheitsfreund/in" className="text-white hover:bg-white/10">🧒 Kindheitsfreund/in</SelectItem>
                      <SelectItem value="Online-Freund/in" className="text-white hover:bg-white/10">💬 Online-Freund/in</SelectItem>
                      <SelectItem value="Brieffreund/in" className="text-white hover:bg-white/10">✉️ Brieffreund/in</SelectItem>
                      <SelectItem value="Ex-beste/r Freund/in" className="text-white hover:bg-white/10">💫 Ex-beste/r Freund/in</SelectItem>
                      <SelectItem value="Seelenverwandte/r" className="text-white hover:bg-white/10">✨ Seelenverwandte/r</SelectItem>
                      {/* Familie */}
                      <SelectItem value="Mutter" className="text-white hover:bg-white/10">👩 Mutter</SelectItem>
                      <SelectItem value="Vater" className="text-white hover:bg-white/10">👨 Vater</SelectItem>
                      <SelectItem value="Schwester" className="text-white hover:bg-white/10">👧 Schwester</SelectItem>
                      <SelectItem value="Bruder" className="text-white hover:bg-white/10">👦 Bruder</SelectItem>
                      <SelectItem value="Tochter" className="text-white hover:bg-white/10">👶 Tochter</SelectItem>
                      <SelectItem value="Sohn" className="text-white hover:bg-white/10">👶 Sohn</SelectItem>
                      <SelectItem value="Großmutter/Großvater" className="text-white hover:bg-white/10">👴 Großmutter/Großvater</SelectItem>
                      <SelectItem value="Cousin/Cousine" className="text-white hover:bg-white/10">🧑‍🤝‍🧑 Cousin/Cousine</SelectItem>
                      <SelectItem value="Tante/Onkel" className="text-white hover:bg-white/10">👨‍👩‍👧 Tante/Onkel</SelectItem>
                      <SelectItem value="Stiefmutter/Stiefvater" className="text-white hover:bg-white/10">👤 Stiefmutter/Stiefvater</SelectItem>
                      <SelectItem value="Stiefschwester/Stiefbruder" className="text-white hover:bg-white/10">👥 Stiefschwester/Stiefbruder</SelectItem>
                      <SelectItem value="Adoptivmutter/Adoptivvater" className="text-white hover:bg-white/10">🫶 Adoptivmutter/Adoptivvater</SelectItem>
                      <SelectItem value="Adoptivschwester/Adoptivbruder" className="text-white hover:bg-white/10">🤗 Adoptivschwester/Adoptivbruder</SelectItem>
                      <SelectItem value="Schwiegermutter/Schwiegervater" className="text-white hover:bg-white/10">👩‍👦 Schwiegermutter/Schwiegervater</SelectItem>
                      <SelectItem value="Schwager/Schwägerin" className="text-white hover:bg-white/10">👨‍👩‍👦 Schwager/Schwägerin</SelectItem>
                      <SelectItem value="Patenonkel/Patentante" className="text-white hover:bg-white/10">🌟 Patenonkel/Patentante</SelectItem>
                      <SelectItem value="Patenkind" className="text-white hover:bg-white/10">👼 Patenkind</SelectItem>
                      {/* Beruflich */}
                      <SelectItem value="Arbeitskollege/Arbeitskollegin" className="text-white hover:bg-white/10">💼 Arbeitskollege/in</SelectItem>
                      <SelectItem value="Chef/in" className="text-white hover:bg-white/10">👔 Chef/in</SelectItem>
                      <SelectItem value="Mitarbeiter/in" className="text-white hover:bg-white/10">🏢 Mitarbeiter/in</SelectItem>
                      <SelectItem value="Geschäftspartner/in" className="text-white hover:bg-white/10">🤝 Geschäftspartner/in</SelectItem>
                      <SelectItem value="Praktikant/in" className="text-white hover:bg-white/10">📋 Praktikant/in</SelectItem>
                      <SelectItem value="Azubi" className="text-white hover:bg-white/10">🔧 Azubi</SelectItem>
                      <SelectItem value="Mentor/in" className="text-white hover:bg-white/10">🎓 Mentor/in</SelectItem>
                      <SelectItem value="Schüler/in" className="text-white hover:bg-white/10">📚 Schüler/in</SelectItem>
                      <SelectItem value="Lehrer/in" className="text-white hover:bg-white/10">📖 Lehrer/in</SelectItem>
                      <SelectItem value="Professor/in" className="text-white hover:bg-white/10">🎩 Professor/in</SelectItem>
                      {/* Konflikte */}
                      <SelectItem value="Rivale/Rivalin" className="text-white hover:bg-white/10">⚔️ Rivale/Rivalin</SelectItem>
                      <SelectItem value="Feind/in" className="text-white hover:bg-white/10">😤 Feind/in</SelectItem>
                      <SelectItem value="Erzfeind/in" className="text-white hover:bg-white/10">💀 Erzfeind/in</SelectItem>
                      <SelectItem value="Nemesis" className="text-white hover:bg-white/10">🔥 Nemesis</SelectItem>
                      {/* Zusammenleben */}
                      <SelectItem value="Nachbar/in" className="text-white hover:bg-white/10">🏠 Nachbar/in</SelectItem>
                      <SelectItem value="Mitbewohner/in" className="text-white hover:bg-white/10">🏡 Mitbewohner/in</SelectItem>
                      <SelectItem value="WG-Mitbewohner/in" className="text-white hover:bg-white/10">🛋️ WG-Mitbewohner/in</SelectItem>
                      {/* Freizeit & Sport */}
                      <SelectItem value="Trainingspartner/in" className="text-white hover:bg-white/10">🏋️ Trainingspartner/in</SelectItem>
                      <SelectItem value="Teamkamerad/in" className="text-white hover:bg-white/10">⚽ Teamkamerad/in</SelectItem>
                      <SelectItem value="Bandkollege/in" className="text-white hover:bg-white/10">🎸 Bandkollege/in</SelectItem>
                      <SelectItem value="Reisebekanntschaft" className="text-white hover:bg-white/10">✈️ Reisebekanntschaft</SelectItem>
                      {/* Betreuung & Hilfe */}
                      <SelectItem value="Therapeut/in" className="text-white hover:bg-white/10">🧘 Therapeut/in</SelectItem>
                      <SelectItem value="Patient/in" className="text-white hover:bg-white/10">🏥 Patient/in</SelectItem>
                      <SelectItem value="Arzt/Ärztin" className="text-white hover:bg-white/10">🩺 Arzt/Ärztin</SelectItem>
                      <SelectItem value="Babysitter/in" className="text-white hover:bg-white/10">👶 Babysitter/in</SelectItem>
                      <SelectItem value="Au-pair" className="text-white hover:bg-white/10">🌍 Au-pair</SelectItem>
                      <SelectItem value="Nanny" className="text-white hover:bg-white/10">🍼 Nanny</SelectItem>
                      <SelectItem value="Bodyguard" className="text-white hover:bg-white/10">🕶️ Bodyguard</SelectItem>
                      <SelectItem value="Butler/Haushälterin" className="text-white hover:bg-white/10">🎩 Butler/Haushälterin</SelectItem>
                      {/* Besonders & Vertrauen */}
                      <SelectItem value="Vertraute/r" className="text-white hover:bg-white/10">🤫 Vertraute/r</SelectItem>
                      <SelectItem value="Beichtvater/Beichtmutter" className="text-white hover:bg-white/10">🙏 Beichtvater/Beichtmutter</SelectItem>
                      <SelectItem value="Fan/Bewunderer/in" className="text-white hover:bg-white/10">🌟 Fan/Bewunderer/in</SelectItem>
                      <SelectItem value="Stalker/in" className="text-white hover:bg-white/10">👁️ Stalker/in</SelectItem>
                      <SelectItem value="Fremde/r" className="text-white hover:bg-white/10">🚶 Fremde/r</SelectItem>
                      <SelectItem value="Lebensretter/in" className="text-white hover:bg-white/10">🦸 Lebensretter/in</SelectItem>
                      {/* Dunkel & Kriminell */}
                      <SelectItem value="Dealer/in" className="text-white hover:bg-white/10">🧪 Dealer/in</SelectItem>
                      <SelectItem value="Komplize/Komplizin" className="text-white hover:bg-white/10">🤐 Komplize/Komplizin</SelectItem>
                      <SelectItem value="Gefängnismitinsasse/in" className="text-white hover:bg-white/10">⛓️ Gefängnismitinsasse/in</SelectItem>
                      <SelectItem value="Kriegskamerad/in" className="text-white hover:bg-white/10">🎖️ Kriegskamerad/in</SelectItem>
                      {/* Fantasy & Übernatürlich */}
                      <SelectItem value="Verlorene/r Zwilling" className="text-white hover:bg-white/10">🪞 Verlorene/r Zwilling</SelectItem>
                      <SelectItem value="Geist/Phantom" className="text-white hover:bg-white/10">👻 Geist/Phantom</SelectItem>
                      <SelectItem value="Imaginäre/r Freund/in" className="text-white hover:bg-white/10">🌈 Imaginäre/r Freund/in</SelectItem>
                      <SelectItem value="Zeitreisende/r" className="text-white hover:bg-white/10">⏳ Zeitreisende/r</SelectItem>
                      <SelectItem value="Paralleluniversum-Ich" className="text-white hover:bg-white/10">🌀 Paralleluniversum-Ich</SelectItem>
                      {/* Tier-Bezogen */}
                      <SelectItem value="Haustierbesitzer/in" className="text-white hover:bg-white/10">🐾 Haustierbesitzer/in</SelectItem>
                      <SelectItem value="Tierflüsterer/in" className="text-white hover:bg-white/10">🦊 Tierflüsterer/in</SelectItem>
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
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001] max-h-80">
                      <SelectItem value="gleichberechtigt" className="text-white hover:bg-white/10">⚖️ Gleichberechtigt</SelectItem>
                      <SelectItem value="dominant" className="text-white hover:bg-white/10">👑 Dominant</SelectItem>
                      <SelectItem value="unterwürfig" className="text-white hover:bg-white/10">🙇 Unterwürfig</SelectItem>
                      <SelectItem value="beschützend" className="text-white hover:bg-white/10">🛡️ Beschützend</SelectItem>
                      <SelectItem value="abhängig" className="text-white hover:bg-white/10">🔗 Abhängig</SelectItem>
                      <SelectItem value="unabhängig" className="text-white hover:bg-white/10">🦅 Unabhängig</SelectItem>
                      <SelectItem value="wechselseitig" className="text-white hover:bg-white/10">🔄 Wechselseitig</SelectItem>
                      <SelectItem value="einseitig" className="text-white hover:bg-white/10">➡️ Einseitig</SelectItem>
                      <SelectItem value="konkurrierend" className="text-white hover:bg-white/10">🏁 Konkurrierend</SelectItem>
                      <SelectItem value="co-abhängig" className="text-white hover:bg-white/10">🪢 Co-abhängig</SelectItem>
                      <SelectItem value="toxisch" className="text-white hover:bg-white/10">☠️ Toxisch</SelectItem>
                      <SelectItem value="heilend" className="text-white hover:bg-white/10">💚 Heilend</SelectItem>
                      <SelectItem value="spielerisch" className="text-white hover:bg-white/10">🎲 Spielerisch</SelectItem>
                      <SelectItem value="intellektuell" className="text-white hover:bg-white/10">🧠 Intellektuell</SelectItem>
                      <SelectItem value="elterlich" className="text-white hover:bg-white/10">👨‍👧 Elterlich</SelectItem>
                      <SelectItem value="geschwisterlich" className="text-white hover:bg-white/10">👫 Geschwisterlich</SelectItem>
                      <SelectItem value="romantisch_spannend" className="text-white hover:bg-white/10">🔥 Romantisch-spannend</SelectItem>
                      <SelectItem value="kalt_distanziert" className="text-white hover:bg-white/10">🧊 Kalt & distanziert</SelectItem>
                      <SelectItem value="bewundernd" className="text-white hover:bg-white/10">🌟 Bewundernd</SelectItem>
                      <SelectItem value="manipulativ" className="text-white hover:bg-white/10">🎭 Manipulativ</SelectItem>
                      <SelectItem value="aufopfernd" className="text-white hover:bg-white/10">🕊️ Aufopfernd</SelectItem>
                      <SelectItem value="rebellisch" className="text-white hover:bg-white/10">🤘 Rebellisch</SelectItem>
                      <SelectItem value="symbiotisch" className="text-white hover:bg-white/10">🔗 Symbiotisch</SelectItem>
                      <SelectItem value="mentor_schüler" className="text-white hover:bg-white/10">🎓 Mentor-Schüler</SelectItem>
                      <SelectItem value="kumpelhaft" className="text-white hover:bg-white/10">🍻 Kumpelhaft</SelectItem>
                      <SelectItem value="formell_höflich" className="text-white hover:bg-white/10">🎩 Formell & höflich</SelectItem>
                      <SelectItem value="leidenschaftlich" className="text-white hover:bg-white/10">💘 Leidenschaftlich</SelectItem>
                      <SelectItem value="vertrauensvoll" className="text-white hover:bg-white/10">🤝 Vertrauensvoll</SelectItem>
                      <SelectItem value="misstrauisch_vorsichtig" className="text-white hover:bg-white/10">🤨 Misstrauisch & vorsichtig</SelectItem>
                      <SelectItem value="neckend_flirtend" className="text-white hover:bg-white/10">😜 Neckend & flirtend</SelectItem>
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
              {/* Lebensgeschichte Section */}
              <div className="space-y-1 mb-1">
                <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Lebensgeschichte
                </h3>
                <p className="text-xs text-gray-500">Diese Informationen helfen der KI, den Charakter besser zu verstehen und authentischer zu reagieren.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Detaillierte Biografie & Hintergrundgeschichte</Label>
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

              {/* Innenwelt Section */}
              <div className="space-y-1 mt-4 mb-1">
                <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Innenwelt & Überzeugungen
                </h3>
                <p className="text-xs text-gray-500">Was treibt den Charakter an? Woran glaubt er?</p>
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

              {/* Psyche Section */}
              <div className="space-y-1 mt-4 mb-1">
                <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                  <HeartCrack className="w-4 h-4" />
                  Psyche & Gesundheit
                </h3>
                <p className="text-xs text-gray-500">Diese Details machen den Charakter tiefgründiger und realistischer.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Trauma & prägende Erlebnisse</Label>
                <Textarea
                  value={formData.trauma}
                  onChange={(e) => setFormData(prev => ({ ...prev, trauma: e.target.value }))}
                  placeholder="z.B. Verlust eines Elternteils, Mobbing in der Schulzeit, schwerer Unfall..."
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]"
                />
                <p className="text-xs text-gray-500">Beeinflusst emotionale Reaktionen und Trigger des Charakters</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Psychische Erkrankungen</Label>
                <Textarea
                  value={formData.mental_health}
                  onChange={(e) => setFormData(prev => ({ ...prev, mental_health: e.target.value }))}
                  placeholder="z.B. Depression, Angststörung, ADHS, PTBS, Bipolare Störung..."
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]"
                />
                <p className="text-xs text-gray-500">Der Charakter wird diese realistisch in Gesprächen widerspiegeln</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Medikamente</Label>
                <Textarea
                  value={formData.medications}
                  onChange={(e) => setFormData(prev => ({ ...prev, medications: e.target.value }))}
                  placeholder="z.B. Antidepressiva, Ritalin, Schlafmittel – und wie der Charakter dazu steht..."
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                />
                <p className="text-xs text-gray-500">Kann Nebenwirkungen und Verhaltensänderungen beeinflussen</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Therapeut/in</Label>
                <Textarea
                  value={formData.therapist_info}
                  onChange={(e) => setFormData(prev => ({ ...prev, therapist_info: e.target.value }))}
                  placeholder="z.B. 'Geht seit 2 Jahren zur Verhaltenstherapie bei Frau Dr. Müller, anfangs widerwillig, jetzt hilfreich. Sitzungen alle 2 Wochen.'"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]"
                />
                <p className="text-xs text-gray-500">Beeinflusst wie der Charakter über Therapie spricht und ob er Selbstreflexion zeigt</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Klinikaufenthalte</Label>
                <Textarea
                  value={formData.clinic_stays}
                  onChange={(e) => setFormData(prev => ({ ...prev, clinic_stays: e.target.value }))}
                  placeholder="z.B. '3 Monate in einer psychiatrischen Klinik wegen Burnout. War eine harte aber wichtige Zeit. Will nie wieder hin.'"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]"
                />
                <p className="text-xs text-gray-500">Prägende Erfahrung die das Verhalten und die Einstellung des Charakters beeinflusst</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Diagnose-Zeitpunkt</Label>
                  <Select 
                    value={formData.diagnosis_age} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, diagnosis_age: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue placeholder="Wann diagnostiziert?" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="kindheit" className="text-white hover:bg-white/10">👶 Kindheit</SelectItem>
                      <SelectItem value="jugend" className="text-white hover:bg-white/10">🧑 Jugend</SelectItem>
                      <SelectItem value="junges_erwachsenenalter" className="text-white hover:bg-white/10">🧑‍🎓 Junges Erwachsenenalter</SelectItem>
                      <SelectItem value="erwachsenenalter" className="text-white hover:bg-white/10">🧑‍💼 Erwachsenenalter</SelectItem>
                      <SelectItem value="spät_diagnostiziert" className="text-white hover:bg-white/10">🔍 Spät diagnostiziert</SelectItem>
                      <SelectItem value="nicht_diagnostiziert" className="text-white hover:bg-white/10">❓ Nicht diagnostiziert</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Beeinflusst wie lange der Charakter schon damit lebt</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Therapie-Einstellung</Label>
                  <Select 
                    value={formData.therapy_attitude} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, therapy_attitude: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue placeholder="Einstellung wählen..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="sehr_positiv" className="text-white hover:bg-white/10">💚 Sehr positiv</SelectItem>
                      <SelectItem value="positiv" className="text-white hover:bg-white/10">👍 Positiv</SelectItem>
                      <SelectItem value="ambivalent" className="text-white hover:bg-white/10">🤷 Ambivalent</SelectItem>
                      <SelectItem value="ablehnend" className="text-white hover:bg-white/10">👎 Ablehnend</SelectItem>
                      <SelectItem value="verweigert" className="text-white hover:bg-white/10">🚫 Verweigert komplett</SelectItem>
                      <SelectItem value="noch_nie_versucht" className="text-white hover:bg-white/10">❓ Noch nie versucht</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Genesungsstatus</Label>
                  <Select 
                    value={formData.recovery_status} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, recovery_status: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="nicht_zutreffend" className="text-white hover:bg-white/10">➖ Nicht zutreffend</SelectItem>
                      <SelectItem value="aktiv_krank" className="text-white hover:bg-white/10">🔴 Aktiv krank</SelectItem>
                      <SelectItem value="in_behandlung" className="text-white hover:bg-white/10">🟡 In Behandlung</SelectItem>
                      <SelectItem value="in_genesung" className="text-white hover:bg-white/10">🟢 In Genesung</SelectItem>
                      <SelectItem value="stabil" className="text-white hover:bg-white/10">✅ Stabil</SelectItem>
                      <SelectItem value="rückfällig" className="text-white hover:bg-white/10">🔄 Rückfällig</SelectItem>
                      <SelectItem value="chronisch_stabil" className="text-white hover:bg-white/10">⚖️ Chronisch stabil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Support-System</Label>
                  <Select 
                    value={formData.support_system} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, support_system: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="stark" className="text-white hover:bg-white/10">💪 Starkes Netzwerk</SelectItem>
                      <SelectItem value="mittel" className="text-white hover:bg-white/10">🤝 Mittleres Netzwerk</SelectItem>
                      <SelectItem value="schwach" className="text-white hover:bg-white/10">🤏 Schwaches Netzwerk</SelectItem>
                      <SelectItem value="isoliert" className="text-white hover:bg-white/10">🏝️ Isoliert</SelectItem>
                      <SelectItem value="toxisch" className="text-white hover:bg-white/10">☠️ Toxisches Umfeld</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Support-System Details</Label>
                <Textarea
                  value={formData.support_system_details}
                  onChange={(e) => setFormData(prev => ({ ...prev, support_system_details: e.target.value }))}
                  placeholder="Wer unterstützt den Charakter? Freunde, Familie, Selbsthilfegruppe? Oder ist er isoliert?"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                />
              </div>

              {/* Tiefere psychische Themen */}
              <div className="space-y-1 mt-4 mb-1">
                <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                  <HeartCrack className="w-4 h-4" />
                  Tiefere psychische Themen
                </h3>
                <p className="text-xs text-gray-500">Sensible Themen die den Charakter realistischer machen.</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Selbstverletzung</Label>
                <Textarea
                  value={formData.self_harm_history}
                  onChange={(e) => setFormData(prev => ({ ...prev, self_harm_history: e.target.value }))}
                  placeholder="z.B. 'Hat sich als Teenager geritzt, inzwischen seit 3 Jahren clean. Narben erinnern ihn daran.'"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                />
                <p className="text-xs text-gray-500">Art, Zeitraum und aktueller Status</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Suizidalität</Label>
                <Textarea
                  value={formData.suicidality_history}
                  onChange={(e) => setFormData(prev => ({ ...prev, suicidality_history: e.target.value }))}
                  placeholder="z.B. 'Hatte mit 19 einen Suizidversuch. Seitdem in Therapie und stabil, aber dunkle Phasen kommen vor.'"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                />
                <p className="text-xs text-gray-500">Suizidgedanken oder -versuche in der Vergangenheit</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Dissoziation</Label>
                  <Select 
                    value={formData.dissociation} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, dissociation: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="keine" className="text-white hover:bg-white/10">➖ Keine</SelectItem>
                      <SelectItem value="leicht" className="text-white hover:bg-white/10">🌫️ Leicht</SelectItem>
                      <SelectItem value="mittel" className="text-white hover:bg-white/10">😶‍🌫️ Mittel</SelectItem>
                      <SelectItem value="stark" className="text-white hover:bg-white/10">🌀 Stark</SelectItem>
                      <SelectItem value="chronisch" className="text-white hover:bg-white/10">⚠️ Chronisch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Dissoziation Details</Label>
                  <Input
                    value={formData.dissociation_details}
                    onChange={(e) => setFormData(prev => ({ ...prev, dissociation_details: e.target.value }))}
                    placeholder="Derealisation, Depersonalisation..."
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Essstörung</Label>
                <Textarea
                  value={formData.eating_disorder}
                  onChange={(e) => setFormData(prev => ({ ...prev, eating_disorder: e.target.value }))}
                  placeholder="z.B. 'Anorexie in der Jugend, jetzt in Recovery aber immer noch schwieriges Verhältnis zum Essen.'"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Psychotische Symptome</Label>
                <Textarea
                  value={formData.psychosis_symptoms}
                  onChange={(e) => setFormData(prev => ({ ...prev, psychosis_symptoms: e.target.value }))}
                  placeholder="z.B. Stimmen hören, paranoide Gedanken, Wahnvorstellungen..."
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                />
              </div>

              {/* Selbst- und Fremdbild */}
              <div className="space-y-1 mt-4 mb-1">
                <h3 className="text-sm font-semibold text-indigo-400 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Selbst- & Fremdbild
                </h3>
                <p className="text-xs text-gray-500">Wie nimmt der Charakter sich und andere wahr?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Selbstbild</Label>
                  <Textarea
                    value={formData.self_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, self_image: e.target.value }))}
                    placeholder="Wie sieht sich der Charakter selbst? z.B. 'Hält sich für wertlos trotz Erfolg'"
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Fremdbild</Label>
                  <Textarea
                    value={formData.external_image}
                    onChange={(e) => setFormData(prev => ({ ...prev, external_image: e.target.value }))}
                    placeholder="Wie sehen andere den Charakter? z.B. 'Wirkt nach außen selbstbewusst und stark'"
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Körperbild</Label>
                <Textarea
                  value={formData.body_image}
                  onChange={(e) => setFormData(prev => ({ ...prev, body_image: e.target.value }))}
                  placeholder="z.B. Body Dysmorphie, Unsicherheit über bestimmte Körperteile, Komfort mit dem eigenen Körper..."
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                />
                <p className="text-xs text-gray-500">Beziehung zum eigenen Körper und Aussehen</p>
              </div>

              {/* Schwächen & Ticks Section */}
              <div className="space-y-1 mt-4 mb-1">
                <h3 className="text-sm font-semibold text-orange-400 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Schwächen & Gewohnheiten
                </h3>
                <p className="text-xs text-gray-500">Was macht den Charakter menschlich und unperfekt?</p>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Süchte & Abhängigkeiten</Label>
                <Textarea
                  value={formData.addictions}
                  onChange={(e) => setFormData(prev => ({ ...prev, addictions: e.target.value }))}
                  placeholder="z.B. Alkohol, Nikotin, Social Media, Gaming, Koffein, Shopping..."
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                />
                <p className="text-xs text-gray-500">Beeinflusst Verhalten und kann im Chat thematisiert werden</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Phobien</Label>
                  <Textarea
                    value={formData.phobias}
                    onChange={(e) => setFormData(prev => ({ ...prev, phobias: e.target.value }))}
                    placeholder="Spinnen, Höhe, enge Räume..."
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Nervöse Ticks</Label>
                  <Textarea
                    value={formData.nervous_ticks}
                    onChange={(e) => setFormData(prev => ({ ...prev, nervous_ticks: e.target.value }))}
                    placeholder="Nägelkauen, Haare zwirbeln..."
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Emotionale Trigger</Label>
                  <Textarea
                    value={formData.triggers}
                    onChange={(e) => setFormData(prev => ({ ...prev, triggers: e.target.value }))}
                    placeholder="Verlustangst, Ungerechtigkeit, Lügen..."
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Bewältigungsstrategien</Label>
                  <Textarea
                    value={formData.coping_mechanisms}
                    onChange={(e) => setFormData(prev => ({ ...prev, coping_mechanisms: e.target.value }))}
                    placeholder="Sport, Essen, Rückzug, Humor..."
                    className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Stressreaktion</Label>
                  <Select 
                    value={formData.stress_response} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, stress_response: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="fight" className="text-white hover:bg-white/10">⚔️ Fight – Angriff & Konfrontation</SelectItem>
                      <SelectItem value="flight" className="text-white hover:bg-white/10">🏃 Flight – Flucht & Vermeidung</SelectItem>
                      <SelectItem value="freeze" className="text-white hover:bg-white/10">🧊 Freeze – Erstarren & Blockade</SelectItem>
                      <SelectItem value="fawn" className="text-white hover:bg-white/10">🙇 Fawn – Anpassen & Beschwichtigen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Schlafmuster</Label>
                  <Select 
                    value={formData.sleeping_pattern} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, sleeping_pattern: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="frühaufsteher" className="text-white hover:bg-white/10">🌅 Frühaufsteher</SelectItem>
                      <SelectItem value="normal" className="text-white hover:bg-white/10">☀️ Normal</SelectItem>
                      <SelectItem value="nachtmensch" className="text-white hover:bg-white/10">🌙 Nachtmensch</SelectItem>
                      <SelectItem value="chaotisch" className="text-white hover:bg-white/10">🌀 Chaotisch</SelectItem>
                      <SelectItem value="schlaflos" className="text-white hover:bg-white/10">👁️ Schlaflos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Personality Details Tab */}
            <TabsContent value="personality" className="space-y-5">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-xs text-emerald-300">💡 Je mehr Details du angibst, desto einzigartiger und authentischer wird dein Charakter.</p>
              </div>

              {/* Interessen & Wissen Section */}
              <div className="space-y-1 mb-1">
                <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Interessen & Wissen
                </h3>
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

              {/* Sprache & Ausdruck Section */}
              <div className="space-y-1 mt-4 mb-1">
                <h3 className="text-sm font-semibold text-violet-400 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Sprache & Ausdruck
                </h3>
                <p className="text-xs text-gray-500">Wie drückt sich der Charakter aus?</p>
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

              {/* Geheimnisse & Tiefe Section */}
              <div className="space-y-1 mt-4 mb-1">
                <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Geheimnisse & Tiefe
                </h3>
                <p className="text-xs text-gray-500">Verborgene Seiten des Charakters.</p>
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
            
            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-5">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-xs text-purple-300">👁️ Beschreibe das Aussehen deines Charakters – macht intime Szenen und Beschreibungen lebendiger.</p>
              </div>

              <div className="space-y-1 mb-1">
                <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Körper & Erscheinung
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Größe</Label>
                  <Input value={formData.height} onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))} placeholder="z.B. 175cm" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Körperbau</Label>
                  <Select value={formData.body_type} onValueChange={(val) => setFormData(prev => ({ ...prev, body_type: val }))}>
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wählen..." /></SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      {["schlank","sportlich","durchschnittlich","kräftig","kurvig","muskulös","zierlich","füllig","dünn","breit"].map(v => (
                        <SelectItem key={v} value={v} className="text-white hover:bg-white/10">{v.charAt(0).toUpperCase()+v.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Fitness</Label>
                  <Select value={formData.physical_fitness} onValueChange={(val) => setFormData(prev => ({ ...prev, physical_fitness: val }))}>
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      {[{v:"unsportlich",l:"🛋️ Unsportlich"},{v:"leicht_aktiv",l:"🚶 Leicht aktiv"},{v:"durchschnittlich",l:"🙂 Durchschnittlich"},{v:"sportlich",l:"🏃 Sportlich"},{v:"sehr_sportlich",l:"💪 Sehr sportlich"},{v:"athletisch",l:"🏋️ Athletisch"}].map(o => (
                        <SelectItem key={o.v} value={o.v} className="text-white hover:bg-white/10">{o.l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Haarfarbe</Label>
                  <Input value={formData.hair_color} onChange={(e) => setFormData(prev => ({ ...prev, hair_color: e.target.value }))} placeholder="z.B. Dunkelbraun" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Frisur</Label>
                  <Input value={formData.hair_style} onChange={(e) => setFormData(prev => ({ ...prev, hair_style: e.target.value }))} placeholder="z.B. Lockig, schulterlang" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Augenfarbe</Label>
                  <Input value={formData.eye_color} onChange={(e) => setFormData(prev => ({ ...prev, eye_color: e.target.value }))} placeholder="z.B. Grün" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Hautton</Label>
                  <Input value={formData.skin_tone} onChange={(e) => setFormData(prev => ({ ...prev, skin_tone: e.target.value }))} placeholder="z.B. Oliv" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Tattoos & Piercings</Label>
                <Textarea value={formData.tattoos_piercings} onChange={(e) => setFormData(prev => ({ ...prev, tattoos_piercings: e.target.value }))} placeholder="z.B. Sleeve am linken Arm, Nasenpiercing, Bauchnabelpiercing..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Narben & Merkmale</Label>
                  <Textarea value={formData.scars_marks} onChange={(e) => setFormData(prev => ({ ...prev, scars_marks: e.target.value }))} placeholder="z.B. Narbe über Augenbraue, Muttermal am Hals..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Auffällige Merkmale</Label>
                  <Textarea value={formData.distinctive_features} onChange={(e) => setFormData(prev => ({ ...prev, distinctive_features: e.target.value }))} placeholder="z.B. Sommersprossen, Grübchen, markantes Kinn..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
                </div>
              </div>

              <div className="space-y-1 mt-4 mb-1">
                <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Stil & Ausstrahlung
                </h3>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Kleidungsstil</Label>
                <Input value={formData.clothing_style} onChange={(e) => setFormData(prev => ({ ...prev, clothing_style: e.target.value }))} placeholder="z.B. Streetwear, elegant, gothic, casual, sportlich..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Stimme</Label>
                  <Input value={formData.voice_description} onChange={(e) => setFormData(prev => ({ ...prev, voice_description: e.target.value }))} placeholder="z.B. Tief, rau, samtig, melodisch..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Typischer Duft</Label>
                  <Input value={formData.scent} onChange={(e) => setFormData(prev => ({ ...prev, scent: e.target.value }))} placeholder="z.B. Holzig-warm, Vanille, Zigaretten..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
              </div>

              <div className="space-y-1 mt-4 mb-1">
                <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Persönlichkeitstypen
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">MBTI</Label>
                  <Select value={formData.mbti_type} onValueChange={(val) => setFormData(prev => ({ ...prev, mbti_type: val }))}>
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wählen..." /></SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001] max-h-80">
                      {["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"].map(v => (
                        <SelectItem key={v} value={v} className="text-white hover:bg-white/10">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Sternzeichen</Label>
                  <Select value={formData.zodiac_sign} onValueChange={(val) => setFormData(prev => ({ ...prev, zodiac_sign: val }))}>
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wählen..." /></SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001] max-h-80">
                      {[{v:"Widder",e:"♈"},{v:"Stier",e:"♉"},{v:"Zwillinge",e:"♊"},{v:"Krebs",e:"♋"},{v:"Löwe",e:"♌"},{v:"Jungfrau",e:"♍"},{v:"Waage",e:"♎"},{v:"Skorpion",e:"♏"},{v:"Schütze",e:"♐"},{v:"Steinbock",e:"♑"},{v:"Wassermann",e:"♒"},{v:"Fische",e:"♓"}].map(o => (
                        <SelectItem key={o.v} value={o.v} className="text-white hover:bg-white/10">{o.e} {o.v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Enneagramm</Label>
                  <Select value={formData.enneagram_type} onValueChange={(val) => setFormData(prev => ({ ...prev, enneagram_type: val }))}>
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wählen..." /></SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001] max-h-80">
                      {["1 - Reformer","2 - Helfer","3 - Macher","4 - Individualist","5 - Forscher","6 - Loyaler","7 - Enthusiast","8 - Herausforderer","9 - Friedensstifter"].map(v => (
                        <SelectItem key={v} value={v} className="text-white hover:bg-white/10">{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1 mt-4 mb-1">
                <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Soziales & Hintergrund
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Gesprochene Sprachen</Label>
                  <Input value={formData.languages_spoken} onChange={(e) => setFormData(prev => ({ ...prev, languages_spoken: e.target.value }))} placeholder="Deutsch, Englisch, Spanisch..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Akzent/Dialekt</Label>
                  <Input value={formData.accent_dialect} onChange={(e) => setFormData(prev => ({ ...prev, accent_dialect: e.target.value }))} placeholder="z.B. Bayerisch, Berlinerisch..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Bildung</Label>
                  <Input value={formData.education} onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))} placeholder="z.B. Studium Psychologie, Ausbildung..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Wohnsituation</Label>
                  <Input value={formData.living_situation} onChange={(e) => setFormData(prev => ({ ...prev, living_situation: e.target.value }))} placeholder="z.B. Allein in Hamburg, WG..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Familienstand</Label>
                  <Select value={formData.family_status} onValueChange={(val) => setFormData(prev => ({ ...prev, family_status: val }))}>
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wählen..." /></SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      {[{v:"ledig",l:"💚 Ledig"},{v:"in_beziehung",l:"💑 In Beziehung"},{v:"verlobt",l:"💍 Verlobt"},{v:"verheiratet",l:"💒 Verheiratet"},{v:"geschieden",l:"📋 Geschieden"},{v:"verwitwet",l:"🖤 Verwitwet"},{v:"kompliziert",l:"🔀 Kompliziert"}].map(o => (
                        <SelectItem key={o.v} value={o.v} className="text-white hover:bg-white/10">{o.l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Kinder</Label>
                  <Input value={formData.children} onChange={(e) => setFormData(prev => ({ ...prev, children: e.target.value }))} placeholder="z.B. 1 Tochter (5)" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Haustiere</Label>
                  <Input value={formData.pets} onChange={(e) => setFormData(prev => ({ ...prev, pets: e.target.value }))} placeholder="z.B. Katze Luna" className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Religion/Spiritualität</Label>
                  <Input value={formData.religion_spirituality} onChange={(e) => setFormData(prev => ({ ...prev, religion_spirituality: e.target.value }))} placeholder="z.B. Atheist, spirituell, Buddhist..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Politische Einstellung</Label>
                  <Input value={formData.political_stance} onChange={(e) => setFormData(prev => ({ ...prev, political_stance: e.target.value }))} placeholder="z.B. liberal, konservativ..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Substanzkonsum</Label>
                  <Input value={formData.substance_use} onChange={(e) => setFormData(prev => ({ ...prev, substance_use: e.target.value }))} placeholder="z.B. Trinkt sozial, raucht nicht..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Social-Media-Verhalten</Label>
                  <Input value={formData.social_media_behavior} onChange={(e) => setFormData(prev => ({ ...prev, social_media_behavior: e.target.value }))} placeholder="z.B. Instagram-süchtig, kein Social Media..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500" />
                </div>
              </div>
            </TabsContent>

            {/* Intimacy Tab */}
            <TabsContent value="intimacy" className="space-y-5">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                <p className="text-xs text-rose-300">🔥 Diese Einstellungen wirken sich nur aus wenn der NSFW-Modus aktiviert ist. Sie machen intime Szenen authentischer und auf den Charakter abgestimmt.</p>
              </div>

              <div className="space-y-1 mb-1">
                <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Flirt & Annäherung
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Flirt-Stil</Label>
                  <Select value={formData.flirt_style} onValueChange={(val) => setFormData(prev => ({ ...prev, flirt_style: val }))}>
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wählen..." /></SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      {[{v:"direkt",l:"🎯 Direkt"},{v:"subtil",l:"🌹 Subtil"},{v:"neckend",l:"😜 Neckend"},{v:"schüchtern",l:"😳 Schüchtern"},{v:"aggressiv",l:"🔥 Aggressiv"},{v:"romantisch",l:"💕 Romantisch"},{v:"intellektuell",l:"🧠 Intellektuell"},{v:"körperlich",l:"💪 Körperlich"},{v:"humorvoll",l:"😂 Humorvoll"},{v:"mysteriös",l:"🔮 Mysteriös"}].map(o => (
                        <SelectItem key={o.v} value={o.v} className="text-white hover:bg-white/10">{o.l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Erfahrungslevel</Label>
                  <Select value={formData.intimacy_experience} onValueChange={(val) => setFormData(prev => ({ ...prev, intimacy_experience: val }))}>
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wählen..." /></SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      {[{v:"unerfahren",l:"🌱 Unerfahren"},{v:"wenig_erfahren",l:"🌿 Wenig erfahren"},{v:"durchschnittlich",l:"🌻 Durchschnittlich"},{v:"erfahren",l:"🌹 Erfahren"},{v:"sehr_erfahren",l:"🔥 Sehr erfahren"}].map(o => (
                        <SelectItem key={o.v} value={o.v} className="text-white hover:bg-white/10">{o.l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Dom/Sub Präferenz</Label>
                <Select value={formData.dom_sub_preference} onValueChange={(val) => setFormData(prev => ({ ...prev, dom_sub_preference: val }))}>
                  <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue placeholder="Wählen..." /></SelectTrigger>
                  <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                    {[{v:"dominant",l:"👑 Dominant"},{v:"switch_dominant",l:"⚡ Switch (eher dominant)"},{v:"switch",l:"🔄 Switch"},{v:"switch_submissiv",l:"🌊 Switch (eher submissiv)"},{v:"submissiv",l:"🙇 Submissiv"},{v:"keine_präferenz",l:"🤷 Keine Präferenz"}].map(o => (
                      <SelectItem key={o.v} value={o.v} className="text-white hover:bg-white/10">{o.l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 mt-4 mb-1">
                <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Intimität & Vorlieben
                </h3>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Verhalten bei Intimität</Label>
                <Textarea value={formData.intimacy_personality} onChange={(e) => setFormData(prev => ({ ...prev, intimacy_personality: e.target.value }))} placeholder="z.B. Leidenschaftlich und wild, aber zärtlich danach. Liebt es langsam anzufangen..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]" />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Körperliche Beschreibung (intim)</Label>
                <Textarea value={formData.physical_description_intimate} onChange={(e) => setFormData(prev => ({ ...prev, physical_description_intimate: e.target.value }))} placeholder="Detailliertere körperliche Beschreibung für intime Szenen..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Turn-Ons</Label>
                  <Textarea value={formData.turn_ons} onChange={(e) => setFormData(prev => ({ ...prev, turn_ons: e.target.value }))} placeholder="Was den Charakter anzieht/erregt..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Turn-Offs</Label>
                  <Textarea value={formData.turn_offs} onChange={(e) => setFormData(prev => ({ ...prev, turn_offs: e.target.value }))} placeholder="Was den Charakter abstößt..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Kinks & Vorlieben</Label>
                <Textarea value={formData.kinks_preferences} onChange={(e) => setFormData(prev => ({ ...prev, kinks_preferences: e.target.value }))} placeholder="Spezifische Vorlieben und Kinks des Charakters..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[80px]" />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Absolute Tabus</Label>
                <Textarea value={formData.intimacy_taboos} onChange={(e) => setFormData(prev => ({ ...prev, intimacy_taboos: e.target.value }))} placeholder="Dinge die der Charakter auf keinen Fall machen würde..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Aftercare-Verhalten</Label>
                <Textarea value={formData.aftercare_style} onChange={(e) => setFormData(prev => ({ ...prev, aftercare_style: e.target.value }))} placeholder="z.B. Kuschelt und redet, schläft sofort ein, wird distanziert, macht Witze..." className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[70px]" />
              </div>
            </TabsContent>

            {/* World Tab */}
            <TabsContent value="world" className="space-y-5">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-xs text-cyan-300">🌍 Definiere die Welt in der dein Charakter lebt und seine aktuelle Geschichte.</p>
              </div>

              <div className="space-y-1 mb-1">
                <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Welt & Setting
                </h3>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Welt/Setting</Label>
                <Select value={formData.world_setting} onValueChange={(val) => setFormData(prev => ({ ...prev, world_setting: val }))}>
                  <SelectTrigger className="bg-[#262626] border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                    {[{v:"real_modern",l:"🌆 Real Modern"},{v:"real_historisch",l:"🏛️ Real Historisch"},{v:"fantasy",l:"🧙 Fantasy"},{v:"sci_fi",l:"🚀 Sci-Fi"},{v:"cyberpunk",l:"🌃 Cyberpunk"},{v:"postapokalyptisch",l:"☢️ Postapokalyptisch"},{v:"märchen",l:"🏰 Märchen"},{v:"horror",l:"👻 Horror"},{v:"urban_fantasy",l:"🧛 Urban Fantasy"},{v:"steampunk",l:"⚙️ Steampunk"},{v:"andere",l:"🎭 Andere"}].map(o => (
                      <SelectItem key={o.v} value={o.v} className="text-white hover:bg-white/10">{o.l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Aktueller Handlungsstrang</Label>
                <Textarea value={formData.storyline} onChange={(e) => setFormData(prev => ({ ...prev, storyline: e.target.value }))} placeholder="Was passiert gerade in der Geschichte? z.B. 'Nach einem mysteriösen Brief reist der Charakter in seine Heimatstadt zurück...'" className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[120px]" />
                <p className="text-xs text-gray-500">Der Charakter wird sich an diesen Handlungsstrang halten und ihn weiterentwickeln</p>
              </div>

              <div className="space-y-1 mt-4 mb-1">
                <h3 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  NPCs & Umfeld
                </h3>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Wichtige Personen im Leben</Label>
                <Textarea value={formData.npcs_in_life} onChange={(e) => setFormData(prev => ({ ...prev, npcs_in_life: e.target.value }))} placeholder={"z.B.\n- Max (bester Freund, lustig aber unzuverlässig)\n- Dr. Weber (Therapeutin, streng aber fair)\n- Luna (Katze, einzige Konstante im Leben)\n- Ex-Freundin Sarah (komplizierte Geschichte)"} className="bg-[#262626] border-white/10 text-white placeholder-gray-500 min-h-[150px]" />
                <p className="text-xs text-gray-500">Der Charakter kann über diese Personen sprechen und Geschichten erzählen</p>
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
                      <SelectItem value="flirtend" className="text-white hover:bg-white/10">😘 Flirtend</SelectItem>
                      <SelectItem value="sarkastisch_neckend" className="text-white hover:bg-white/10">😏 Sarkastisch neckend</SelectItem>
                      <SelectItem value="philosophierend" className="text-white hover:bg-white/10">🤔 Philosophierend</SelectItem>
                      <SelectItem value="tröstend" className="text-white hover:bg-white/10">🤗 Tröstend</SelectItem>
                      <SelectItem value="konfrontativ" className="text-white hover:bg-white/10">⚔️ Konfrontativ</SelectItem>
                      <SelectItem value="schweigend_knapp" className="text-white hover:bg-white/10">🤐 Schweigend / Knapp</SelectItem>
                      <SelectItem value="dramatisierend" className="text-white hover:bg-white/10">🎭 Dramatisierend</SelectItem>
                      <SelectItem value="manipulativ_subtil" className="text-white hover:bg-white/10">🕸️ Manipulativ / Subtil</SelectItem>
                      <SelectItem value="beschützend_fürsorglich" className="text-white hover:bg-white/10">🛡️ Beschützend</SelectItem>
                      <SelectItem value="chaotisch_sprunghaft" className="text-white hover:bg-white/10">🌀 Chaotisch / Sprunghaft</SelectItem>
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
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001] max-h-80">
                      {MOOD_OPTIONS.map(m => (
                        <SelectItem key={m.value} value={m.value} className="text-white hover:bg-white/10">{m.label}</SelectItem>
                      ))}
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
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="vermeidend" className="text-white hover:bg-white/10">🙈 Vermeidend</SelectItem>
                      <SelectItem value="direkt" className="text-white hover:bg-white/10">🎯 Direkt</SelectItem>
                      <SelectItem value="diplomatisch" className="text-white hover:bg-white/10">⚖️ Diplomatisch</SelectItem>
                      <SelectItem value="humorvoll_ablenkend" className="text-white hover:bg-white/10">😂 Humorvoll ablenkend</SelectItem>
                      <SelectItem value="analytisch" className="text-white hover:bg-white/10">🧠 Analytisch</SelectItem>
                      <SelectItem value="emotional" className="text-white hover:bg-white/10">😢 Emotional</SelectItem>
                      <SelectItem value="passiv_aggressiv" className="text-white hover:bg-white/10">😤 Passiv-aggressiv</SelectItem>
                      <SelectItem value="konfrontativ" className="text-white hover:bg-white/10">⚔️ Konfrontativ</SelectItem>
                      <SelectItem value="nachgebend" className="text-white hover:bg-white/10">🕊️ Nachgebend</SelectItem>
                      <SelectItem value="schuldzuweisend" className="text-white hover:bg-white/10">👉 Schuldzuweisend</SelectItem>
                      <SelectItem value="stonewalling" className="text-white hover:bg-white/10">🧱 Stonewalling (Mauern)</SelectItem>
                      <SelectItem value="weinend_zusammenbrechend" className="text-white hover:bg-white/10">😭 Weinend / Zusammenbrechend</SelectItem>
                      <SelectItem value="sarkastisch_verletzend" className="text-white hover:bg-white/10">🗡️ Sarkastisch & verletzend</SelectItem>
                      <SelectItem value="manipulativ" className="text-white hover:bg-white/10">🎭 Manipulativ</SelectItem>
                      <SelectItem value="selbstmitleidig" className="text-white hover:bg-white/10">🥀 Selbstmitleidig</SelectItem>
                      <SelectItem value="explosiv" className="text-white hover:bg-white/10">💥 Explosiv / Ausrastend</SelectItem>
                      <SelectItem value="kalt_berechnend" className="text-white hover:bg-white/10">🧊 Kalt & berechnend</SelectItem>
                      <SelectItem value="entschuldigend" className="text-white hover:bg-white/10">🙏 Sofort entschuldigend</SelectItem>
                      <SelectItem value="gaslighting" className="text-white hover:bg-white/10">🌀 Gaslighting / Verdrehen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Soziales Verhalten Section */}
              <div className="space-y-1 mt-4 mb-1">
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Soziales Verhalten
                </h3>
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
                  <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
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
                    <SelectItem value="besitzergreifend" className="text-white hover:bg-white/10">🔒 Besitzergreifend</SelectItem>
                    <SelectItem value="unterwürfig_devot" className="text-white hover:bg-white/10">🙇 Unterwürfig / Devot</SelectItem>
                    <SelectItem value="dominant_bestimmend" className="text-white hover:bg-white/10">👑 Dominant / Bestimmend</SelectItem>
                    <SelectItem value="manipulativ_kontrollierend" className="text-white hover:bg-white/10">🕸️ Manipulativ</SelectItem>
                    <SelectItem value="gleichgültig_desinteressiert" className="text-white hover:bg-white/10">🫥 Gleichgültig</SelectItem>
                    <SelectItem value="anbetend_vergötternd" className="text-white hover:bg-white/10">🙏 Anbetend</SelectItem>
                    <SelectItem value="eifersüchtig_klammend" className="text-white hover:bg-white/10">😠 Eifersüchtig & klammernd</SelectItem>
                    <SelectItem value="toxisch_liebevoll" className="text-white hover:bg-white/10">☠️ Toxisch-liebevoll</SelectItem>
                    <SelectItem value="elterlich_bemutternd" className="text-white hover:bg-white/10">👩‍👧 Elterlich / Bemutternd</SelectItem>
                    <SelectItem value="rebellisch_widerspenstig" className="text-white hover:bg-white/10">🤘 Rebellisch</SelectItem>
                    <SelectItem value="sarkastisch_liebevoll" className="text-white hover:bg-white/10">😏 Sarkastisch-liebevoll</SelectItem>
                    <SelectItem value="geheimnisvoll_mysteriös" className="text-white hover:bg-white/10">🔮 Geheimnisvoll</SelectItem>
                    <SelectItem value="loyal_treu" className="text-white hover:bg-white/10">🐺 Loyal & treu</SelectItem>
                    <SelectItem value="unberechenbar" className="text-white hover:bg-white/10">🎲 Unberechenbar</SelectItem>
                    <SelectItem value="verführerisch" className="text-white hover:bg-white/10">🌹 Verführerisch</SelectItem>
                    <SelectItem value="mentor_väterlich" className="text-white hover:bg-white/10">🎓 Mentor / Väterlich</SelectItem>
                    <SelectItem value="passiv_aggressiv" className="text-white hover:bg-white/10">😤 Passiv-aggressiv</SelectItem>
                    <SelectItem value="aufopfernd_selbstlos" className="text-white hover:bg-white/10">🕊️ Aufopfernd</SelectItem>
                    <SelectItem value="spielerisch_kindlich" className="text-white hover:bg-white/10">🧸 Spielerisch-kindlich</SelectItem>
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

              {/* Soziale Persönlichkeit Section */}
              <div className="space-y-1 mt-6 mb-2">
                <h3 className="text-sm font-semibold text-sky-400 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Soziale Persönlichkeit
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-300">Introversion</Label>
                  <span className="text-sm text-sky-400">{formData.introversion_level}/10</span>
                </div>
                <Slider
                  value={[formData.introversion_level]}
                  onValueChange={([val]) => setFormData(prev => ({ ...prev, introversion_level: val }))}
                  min={1} max={10} step={1}
                  className="[&_[role=slider]]:bg-sky-500"
                />
                <p className="text-xs text-gray-500">1 = extrem extrovertiert • 10 = extrem introvertiert</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-300">Ehrlichkeit</Label>
                  <span className="text-sm text-sky-400">{formData.honesty_level}/10</span>
                </div>
                <Slider
                  value={[formData.honesty_level]}
                  onValueChange={([val]) => setFormData(prev => ({ ...prev, honesty_level: val }))}
                  min={1} max={10} step={1}
                  className="[&_[role=slider]]:bg-sky-500"
                />
                <p className="text-xs text-gray-500">1 = pathologischer Lügner • 10 = brutal ehrlich</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-300">Loyalität</Label>
                  <span className="text-sm text-sky-400">{formData.loyalty_level}/10</span>
                </div>
                <Slider
                  value={[formData.loyalty_level]}
                  onValueChange={([val]) => setFormData(prev => ({ ...prev, loyalty_level: val }))}
                  min={1} max={10} step={1}
                  className="[&_[role=slider]]:bg-sky-500"
                />
                <p className="text-xs text-gray-500">1 = illoyaler Verräter • 10 = stirbt für dich</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-300">Geduld</Label>
                  <span className="text-sm text-sky-400">{formData.patience_level}/10</span>
                </div>
                <Slider
                  value={[formData.patience_level]}
                  onValueChange={([val]) => setFormData(prev => ({ ...prev, patience_level: val }))}
                  min={1} max={10} step={1}
                  className="[&_[role=slider]]:bg-sky-500"
                />
                <p className="text-xs text-gray-500">1 = extrem ungeduldig • 10 = engelsgeduldig</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-300">Selbstwertgefühl</Label>
                  <span className="text-sm text-sky-400">{formData.self_esteem}/10</span>
                </div>
                <Slider
                  value={[formData.self_esteem]}
                  onValueChange={([val]) => setFormData(prev => ({ ...prev, self_esteem: val }))}
                  min={1} max={10} step={1}
                  className="[&_[role=slider]]:bg-sky-500"
                />
                <p className="text-xs text-gray-500">1 = extrem unsicher • 10 = narzisstisch</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-300">Sturheit</Label>
                  <span className="text-sm text-sky-400">{formData.stubbornness_level}/10</span>
                </div>
                <Slider
                  value={[formData.stubbornness_level]}
                  onValueChange={([val]) => setFormData(prev => ({ ...prev, stubbornness_level: val }))}
                  min={1} max={10} step={1}
                  className="[&_[role=slider]]:bg-sky-500"
                />
                <p className="text-xs text-gray-500">1 = sehr nachgiebig • 10 = extrem stur</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-300">Impulsivität</Label>
                  <span className="text-sm text-sky-400">{formData.impulsivity_level}/10</span>
                </div>
                <Slider
                  value={[formData.impulsivity_level]}
                  onValueChange={([val]) => setFormData(prev => ({ ...prev, impulsivity_level: val }))}
                  min={1} max={10} step={1}
                  className="[&_[role=slider]]:bg-sky-500"
                />
                <p className="text-xs text-gray-500">1 = sehr überlegt • 10 = extrem impulsiv</p>
              </div>

              {/* Dynamisches Verhalten Section */}
              <div className="space-y-1 mt-6 mb-2">
                <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  Dynamisches Verhalten
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Energielevel</Label>
                  <Select 
                    value={formData.energy_level} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, energy_level: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="sehr_niedrig" className="text-white hover:bg-white/10">😴 Sehr niedrig</SelectItem>
                      <SelectItem value="niedrig" className="text-white hover:bg-white/10">🐢 Niedrig</SelectItem>
                      <SelectItem value="mittel" className="text-white hover:bg-white/10">😊 Mittel</SelectItem>
                      <SelectItem value="hoch" className="text-white hover:bg-white/10">⚡ Hoch</SelectItem>
                      <SelectItem value="sehr_hoch" className="text-white hover:bg-white/10">🚀 Sehr hoch</SelectItem>
                      <SelectItem value="schwankend" className="text-white hover:bg-white/10">🌊 Schwankend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Launen-Zyklus</Label>
                  <Select 
                    value={formData.mood_cycle} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, mood_cycle: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="stabil" className="text-white hover:bg-white/10">⏸️ Stabil</SelectItem>
                      <SelectItem value="leicht_schwankend" className="text-white hover:bg-white/10">🌤️ Leicht schwankend</SelectItem>
                      <SelectItem value="stark_schwankend" className="text-white hover:bg-white/10">🌊 Stark schwankend</SelectItem>
                      <SelectItem value="zyklisch" className="text-white hover:bg-white/10">🔄 Zyklisch</SelectItem>
                      <SelectItem value="unberechenbar" className="text-white hover:bg-white/10">🎲 Unberechenbar</SelectItem>
                      <SelectItem value="tageszeit_abhängig" className="text-white hover:bg-white/10">🌅 Tageszeit-abhängig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Soziale Batterie</Label>
                  <Select 
                    value={formData.social_battery} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, social_battery: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="unendlich" className="text-white hover:bg-white/10">♾️ Unendlich</SelectItem>
                      <SelectItem value="hoch" className="text-white hover:bg-white/10">🔋 Hoch</SelectItem>
                      <SelectItem value="mittel" className="text-white hover:bg-white/10">🪫 Mittel</SelectItem>
                      <SelectItem value="niedrig" className="text-white hover:bg-white/10">🔌 Niedrig</SelectItem>
                      <SelectItem value="sehr_niedrig" className="text-white hover:bg-white/10">💤 Sehr niedrig</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Wie schnell wird der Charakter sozial erschöpft?</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Moralischer Kompass</Label>
                  <Select 
                    value={formData.moral_compass} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, moral_compass: val }))}
                  >
                    <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#262626] border-white/10 z-[10001]">
                      <SelectItem value="streng_moralisch" className="text-white hover:bg-white/10">😇 Streng moralisch</SelectItem>
                      <SelectItem value="moralisch" className="text-white hover:bg-white/10">👍 Moralisch</SelectItem>
                      <SelectItem value="flexibel" className="text-white hover:bg-white/10">🤷 Flexibel</SelectItem>
                      <SelectItem value="grauzone" className="text-white hover:bg-white/10">🌫️ Grauzone</SelectItem>
                      <SelectItem value="amoralisch" className="text-white hover:bg-white/10">😈 Amoralisch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : editCharacter ? 'Speichern' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}