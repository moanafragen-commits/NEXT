import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Type, Image as ImageIcon, Video, Loader2, Upload, Palette } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';

const BG_COLORS = [
  { name: 'Dunkel', value: '#1a1a1a' },
  { name: 'Emerald', value: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  { name: 'Blau', value: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
  { name: 'Lila', value: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' },
  { name: 'Rosa', value: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
  { name: 'Orange', value: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' },
  { name: 'Rot', value: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
  { name: 'Gelb', value: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' }
];

const EXPIRATION_OPTIONS = [
  { label: '1 Stunde', hours: 1 },
  { label: '6 Stunden', hours: 6 },
  { label: '24 Stunden', hours: 24 },
  { label: '3 Tage', hours: 72 },
  { label: '7 Tage', hours: 168 }
];

export default function CreateUserStatus() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusType, setStatusType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedBg, setSelectedBg] = useState(BG_COLORS[0].value);
  const [mediaUrl, setMediaUrl] = useState('');
  const [expirationHours, setExpirationHours] = useState(24);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setMediaUrl(file_url);
      
      // Auto-detect type
      if (file.type.startsWith('image/')) {
        setStatusType('image');
      } else if (file.type.startsWith('video/')) {
        setStatusType('video');
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const createStatusMutation = useMutation({
    mutationFn: async () => {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expirationHours);

      let content = '';
      if (statusType === 'text') {
        content = textContent;
      } else {
        content = mediaUrl;
      }

      const status = await base44.entities.UserStatus.create({
        user_email: user.email,
        type: statusType,
        content,
        caption: caption || null,
        background_color: statusType === 'text' ? selectedBg : null,
        expires_at: expiresAt.toISOString()
      });

      // Let characters react automatically
      const allChars = await base44.entities.Character.list('-created_date');
      const activeChars = allChars.filter(c => !c.is_archived);
      // Pick random 2-4 characters to react
      const shuffled = activeChars.sort(() => Math.random() - 0.5);
      const reactors = shuffled.slice(0, Math.min(Math.floor(Math.random() * 3) + 2, shuffled.length));

      const statusDesc = statusType === 'text'
        ? `einen Text-Status: "${content}"`
        : statusType === 'image'
          ? `ein Bild als Status${caption ? ` mit der Beschreibung "${caption}"` : ''}`
          : `ein Video als Status${caption ? ` mit der Beschreibung "${caption}"` : ''}`;

      // Fire reactions in parallel, don't block navigation
      Promise.all(reactors.map(async (char) => {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Du bist ${char.name}. ${char.personality}
Der Nutzer hat ${statusDesc} als Status gepostet.
Reagiere darauf mit einer kurzen, authentischen Nachricht (1-2 Sätze). Wie eine WhatsApp-Antwort auf eine Story. Bleibe in deiner Rolle.
${char.writing_style ? `Schreibstil: ${char.writing_style}` : ''}
${char.current_mood ? `Stimmung: ${char.current_mood}` : ''}`,
          response_json_schema: {
            type: "object",
            properties: {
              reaction: { type: "string" }
            }
          }
        });

        await base44.entities.ChatMessage.create({
          character_id: char.id,
          role: 'assistant',
          content: response.reaction,
          status: 'delivered'
        });
      })).catch(() => {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-status'] });
      queryClient.invalidateQueries({ queryKey: ['all-messages'] });
      navigate(createPageUrl('Home'));
    }
  });

  const canSubmit = () => {
    if (statusType === 'text') return textContent.trim().length > 0;
    return mediaUrl.length > 0;
  };

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Status erstellen</h1>
          </div>
          <Button
            onClick={() => createStatusMutation.mutate()}
            disabled={!canSubmit() || createStatusMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {createStatusMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Teilen'
            )}
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Type Selection */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setStatusType('text')}
            className={`p-4 rounded-xl border transition-all ${
              statusType === 'text'
                ? 'bg-emerald-600 border-emerald-500'
                : 'bg-[#1a1a1a] border-white/10 hover:bg-white/5'
            }`}
          >
            <Type className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">Text</p>
          </button>
          <button
            onClick={() => setStatusType('image')}
            className={`p-4 rounded-xl border transition-all ${
              statusType === 'image'
                ? 'bg-emerald-600 border-emerald-500'
                : 'bg-[#1a1a1a] border-white/10 hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">Bild</p>
          </button>
          <button
            onClick={() => setStatusType('video')}
            className={`p-4 rounded-xl border transition-all ${
              statusType === 'video'
                ? 'bg-emerald-600 border-emerald-500'
                : 'bg-[#1a1a1a] border-white/10 hover:bg-white/5'
            }`}
          >
            <Video className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm">Video</p>
          </button>
        </div>

        {/* Preview */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-white/5">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Vorschau</h3>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-[9/16] max-w-sm mx-auto rounded-2xl overflow-hidden"
            style={{ 
              background: statusType === 'text' ? selectedBg : '#000'
            }}
          >
            {statusType === 'text' ? (
              <div className="h-full flex items-center justify-center p-8">
                <p className="text-white text-2xl font-semibold text-center break-words">
                  {textContent || 'Dein Text hier...'}
                </p>
              </div>
            ) : statusType === 'image' && mediaUrl ? (
              <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : statusType === 'video' && mediaUrl ? (
              <video src={mediaUrl} className="w-full h-full object-cover" controls />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-2" />
                  <p>Datei hochladen</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Content Input */}
        {statusType === 'text' ? (
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300 mb-2 block">Text eingeben</Label>
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Was möchtest du teilen?"
                className="bg-[#262626] border-white/10 text-white min-h-[120px]"
                maxLength={300}
              />
              <p className="text-xs text-gray-500 mt-1">{textContent.length}/300</p>
            </div>

            <div>
              <Label className="text-gray-300 mb-2 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Hintergrund
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {BG_COLORS.map((bg) => (
                  <button
                    key={bg.value}
                    onClick={() => setSelectedBg(bg.value)}
                    className={`h-16 rounded-lg border-2 transition-all ${
                      selectedBg === bg.value ? 'border-emerald-500 scale-105' : 'border-white/20'
                    }`}
                    style={{ background: bg.value }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={statusType === 'image' ? 'image/*' : 'video/*'}
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full bg-[#262626] hover:bg-white/10 border border-white/10"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wird hochgeladen...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {statusType === 'image' ? 'Bild hochladen' : 'Video hochladen'}
                </>
              )}
            </Button>

            <div>
              <Label className="text-gray-300 mb-2 block">Bildunterschrift (optional)</Label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Beschreibe deinen Status..."
                className="bg-[#262626] border-white/10 text-white min-h-[80px]"
                maxLength={200}
              />
            </div>
          </div>
        )}

        {/* Expiration */}
        <div className="space-y-2">
          <Label className="text-gray-300">Läuft ab nach</Label>
          <Select 
            value={expirationHours.toString()} 
            onValueChange={(val) => setExpirationHours(parseInt(val))}
          >
            <SelectTrigger className="bg-[#262626] border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#262626] border-white/10">
              {EXPIRATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.hours} value={opt.hours.toString()} className="text-white">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </main>
    </div>
  );
}