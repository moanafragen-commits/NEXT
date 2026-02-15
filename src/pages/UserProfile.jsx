import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Camera, Loader2, Save, Clock, ShieldAlert } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { motion } from 'framer-motion';

const PREDEFINED_STATUSES = [
  { label: 'Online', value: 'online', emoji: '🟢' },
  { label: 'Beschäftigt', value: 'beschäftigt', emoji: '🔴' },
  { label: 'Abwesend', value: 'abwesend', emoji: '🟡' },
  { label: 'In einem Meeting', value: 'in einem Meeting', emoji: '📅' },
  { label: 'Nicht stören', value: 'nicht stören', emoji: '🔕' },
  { label: 'Gleich zurück', value: 'gleich zurück', emoji: '⏰' }
];

const TIME_OPTIONS = [
  { label: 'Nie', value: null },
  { label: '30 Minuten', value: 30 },
  { label: '1 Stunde', value: 60 },
  { label: '2 Stunden', value: 120 },
  { label: '4 Stunden', value: 240 },
  { label: '8 Stunden', value: 480 },
  { label: 'Heute', value: 'today' }
];

export default function UserProfile() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [customStatusMode, setCustomStatusMode] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const [formData, setFormData] = useState({
    display_name: '',
    avatar_url: '',
    bio: '',
    status: '',
    nsfw_mode: false
  });
  
  const [statusExpiry, setStatusExpiry] = useState(null);

  React.useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        avatar_url: user.avatar_url || '',
        bio: user.bio || '',
        status: user.status || 'online',
        nsfw_mode: user.nsfw_mode || false
      });
      
      // Check if status is custom or predefined
      const isPredefined = PREDEFINED_STATUSES.some(s => s.value === user.status);
      setCustomStatusMode(!isPredefined && user.status !== 'online');
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
    }
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, avatar_url: file_url }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let status_expires_at = null;
    if (statusExpiry) {
      const now = new Date();
      if (statusExpiry === 'today') {
        status_expires_at = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
      } else {
        status_expires_at = new Date(now.getTime() + statusExpiry * 60000).toISOString();
      }
    }
    
    updateProfileMutation.mutate({
      ...formData,
      status_expires_at
    });
  };
  
  const handleStatusSelect = (value) => {
    if (value === 'custom') {
      setCustomStatusMode(true);
      setFormData(prev => ({ ...prev, status: '' }));
    } else {
      setCustomStatusMode(false);
      setFormData(prev => ({ ...prev, status: value }));
    }
  };

  const displayAvatar = formData.avatar_url || 
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5">
        <div className="flex items-center gap-3 p-4">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Profil bearbeiten</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={displayAvatar}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500/20"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-600 hover:bg-emerald-500 rounded-full flex items-center justify-center cursor-pointer transition-all"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
            <p className="text-sm text-gray-400">Klicke auf die Kamera, um ein Foto hochzuladen</p>
          </div>

          {/* Email (read-only) */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5">
            <Label className="text-gray-400 text-sm">E-Mail</Label>
            <p className="text-white mt-1">{user?.email}</p>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name">Anzeigename</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              placeholder="Wie möchtest du genannt werden?"
              className="bg-[#262626] border-white/10 text-white placeholder-gray-500 focus-visible:ring-emerald-500/50"
            />
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label htmlFor="status">Status</Label>
            
            {!customStatusMode ? (
              <Select value={formData.status} onValueChange={handleStatusSelect}>
                <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                  <SelectValue placeholder="Status auswählen" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10">
                  {PREDEFINED_STATUSES.map((status) => (
                    <SelectItem 
                      key={status.value} 
                      value={status.value}
                      className="text-white hover:bg-white/10"
                    >
                      <span className="mr-2">{status.emoji}</span>
                      {status.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom" className="text-emerald-400 hover:bg-white/10">
                    ✏️ Benutzerdefiniert
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2">
                <Input
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  placeholder="Was machst du gerade?"
                  className="bg-[#262626] border-white/10 text-white placeholder-gray-500 focus-visible:ring-emerald-500/50"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCustomStatusMode(false);
                    setFormData(prev => ({ ...prev, status: 'online' }));
                  }}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  Zurück zur Auswahl
                </Button>
              </div>
            )}
            
            {/* Auto-Reset Timer */}
            <div className="flex items-center gap-2 pt-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <Label className="text-sm text-gray-400">Status zurücksetzen nach:</Label>
            </div>
            <Select value={statusExpiry?.toString() || 'null'} onValueChange={(v) => setStatusExpiry(v === 'null' ? null : v)}>
              <SelectTrigger className="bg-[#262626] border-white/10 text-white">
                <SelectValue placeholder="Nie" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-white/10">
                {TIME_OPTIONS.map((option) => (
                  <SelectItem 
                    key={option.label} 
                    value={option.value?.toString() || 'null'}
                    className="text-white hover:bg-white/10"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Erzähl etwas über dich..."
              rows={4}
              className="bg-[#262626] border-white/10 text-white placeholder-gray-500 focus-visible:ring-emerald-500/50 resize-none"
            />
          </div>

          {/* NSFW Modus */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <Label className="text-white text-sm font-medium">NSFW-Modus</Label>
                  <p className="text-xs text-gray-500 mt-0.5">Erwachseneninhalte & unzensierte Antworten</p>
                </div>
              </div>
              <Switch
                checked={formData.nsfw_mode}
                onCheckedChange={(val) => setFormData(prev => ({ ...prev, nsfw_mode: val }))}
              />
            </div>
            {formData.nsfw_mode && (
              <p className="text-xs text-red-400/80 bg-red-500/5 rounded-lg p-2.5">
                ⚠️ NSFW-Modus aktiviert. Charaktere können explizitere und unzensierte Antworten geben. Nur für Nutzer ab 18 Jahren.
              </p>
            )}
          </div>

          {/* Save Button */}
          <Button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-500 h-12 text-base"
          >
            {updateProfileMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Profil speichern
              </>
            )}
          </Button>
        </motion.form>
      </main>
    </div>
  );
}