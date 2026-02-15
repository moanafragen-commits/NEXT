import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Bell, BellOff, MessageCircle, Users, Heart, MessageSquare, Zap, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';

const DEFAULT_SETTINGS = {
  direct_messages: true,
  group_messages: true,
  character_messages: true,
  new_posts: true,
  comments: true,
  likes: true,
  status_updates: true,
  sound_enabled: true,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00'
};

export default function NotificationSettings() {
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [browserPermission, setBrowserPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (user?.notification_settings) {
      setSettings({ ...DEFAULT_SETTINGS, ...user.notification_settings });
    }
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: async (newSettings) => {
      await base44.auth.updateMe({ notification_settings: newSettings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });

  const handleToggle = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    saveMutation.mutate(newSettings);
  };

  const handleSelect = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveMutation.mutate(newSettings);
  };

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setBrowserPermission(result);
    }
  };

  const allOff = !settings.direct_messages && !settings.group_messages && !settings.character_messages && !settings.new_posts && !settings.comments && !settings.likes && !settings.status_updates;

  const toggleAll = () => {
    const newVal = allOff;
    const newSettings = {
      ...settings,
      direct_messages: newVal,
      group_messages: newVal,
      character_messages: newVal,
      new_posts: newVal,
      comments: newVal,
      likes: newVal,
      status_updates: newVal
    };
    setSettings(newSettings);
    saveMutation.mutate(newSettings);
  };

  if (userLoading) {
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
          <h1 className="text-lg font-semibold">Benachrichtigungen</h1>
          {saveMutation.isPending && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin ml-auto" />}
          {saveMutation.isSuccess && !saveMutation.isPending && <span className="text-xs text-emerald-400 ml-auto">Gespeichert</span>}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Browser Permission */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${
            browserPermission === 'granted' 
              ? 'bg-emerald-500/10 border-emerald-500/20' 
              : browserPermission === 'denied'
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-yellow-500/10 border-yellow-500/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {browserPermission === 'granted' ? (
                <Bell className="w-5 h-5 text-emerald-400" />
              ) : (
                <BellOff className="w-5 h-5 text-yellow-400" />
              )}
              <div>
                <p className="font-medium text-sm">Browser-Benachrichtigungen</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {browserPermission === 'granted' && 'Aktiviert – du erhältst Push-Benachrichtigungen'}
                  {browserPermission === 'denied' && 'Blockiert – aktiviere sie in den Browser-Einstellungen'}
                  {browserPermission === 'default' && 'Nicht konfiguriert – klicke auf Aktivieren'}
                </p>
              </div>
            </div>
            {browserPermission === 'default' && (
              <Button size="sm" onClick={requestBrowserPermission} className="bg-emerald-600 hover:bg-emerald-500">
                Aktivieren
              </Button>
            )}
          </div>
        </motion.div>

        {/* Master Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 bg-[#1a1a1a] rounded-xl border border-white/5"
        >
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white font-medium">Alle Benachrichtigungen</Label>
              <p className="text-xs text-gray-500 mt-0.5">{allOff ? 'Alle deaktiviert' : 'Einzelne Einstellungen unten'}</p>
            </div>
            <Switch checked={!allOff} onCheckedChange={toggleAll} />
          </div>
        </motion.div>

        {/* Message Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-1"
        >
          <h2 className="text-sm font-semibold text-emerald-400 px-1 mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Nachrichten
          </h2>
          <div className="bg-[#1a1a1a] rounded-xl border border-white/5 divide-y divide-white/5">
            <SettingRow
              icon={<MessageCircle className="w-5 h-5 text-blue-400" />}
              title="Direktnachrichten"
              description="Neue Nachrichten von anderen Nutzern"
              checked={settings.direct_messages}
              onToggle={() => handleToggle('direct_messages')}
            />
            <SettingRow
              icon={<Users className="w-5 h-5 text-purple-400" />}
              title="Gruppennachrichten"
              description="Neue Nachrichten in Gruppenchats"
              checked={settings.group_messages}
              onToggle={() => handleToggle('group_messages')}
            />
            <SettingRow
              icon={<Zap className="w-5 h-5 text-emerald-400" />}
              title="KI-Charakter Antworten"
              description="Antworten von deinen KI-Charakteren"
              checked={settings.character_messages}
              onToggle={() => handleToggle('character_messages')}
            />
          </div>
        </motion.div>

        {/* Social Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-1"
        >
          <h2 className="text-sm font-semibold text-emerald-400 px-1 mb-3 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Soziale Aktivitäten
          </h2>
          <div className="bg-[#1a1a1a] rounded-xl border border-white/5 divide-y divide-white/5">
            <SettingRow
              icon={<MessageSquare className="w-5 h-5 text-orange-400" />}
              title="Neue Posts"
              description="Wenn KI-Charaktere neue Posts erstellen"
              checked={settings.new_posts}
              onToggle={() => handleToggle('new_posts')}
            />
            <SettingRow
              icon={<MessageCircle className="w-5 h-5 text-cyan-400" />}
              title="Kommentare"
              description="Antworten auf deine Kommentare"
              checked={settings.comments}
              onToggle={() => handleToggle('comments')}
            />
            <SettingRow
              icon={<Heart className="w-5 h-5 text-pink-400" />}
              title="Likes"
              description="Wenn jemand deinen Beitrag liked"
              checked={settings.likes}
              onToggle={() => handleToggle('likes')}
            />
            <SettingRow
              icon={<Zap className="w-5 h-5 text-yellow-400" />}
              title="Status-Updates"
              description="Neue Status von Charakteren und Nutzern"
              checked={settings.status_updates}
              onToggle={() => handleToggle('status_updates')}
            />
          </div>
        </motion.div>

        {/* Sound & Quiet Hours */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-1"
        >
          <h2 className="text-sm font-semibold text-emerald-400 px-1 mb-3 flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Ton & Ruhezeiten
          </h2>
          <div className="bg-[#1a1a1a] rounded-xl border border-white/5 divide-y divide-white/5">
            <SettingRow
              icon={settings.sound_enabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
              title="Benachrichtigungston"
              description="Ton bei eingehenden Benachrichtigungen"
              checked={settings.sound_enabled}
              onToggle={() => handleToggle('sound_enabled')}
            />
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="text-white text-sm">Ruhezeiten</Label>
                  <p className="text-xs text-gray-500 mt-0.5">Keine Benachrichtigungen in diesem Zeitraum</p>
                </div>
                <Switch
                  checked={settings.quiet_hours_enabled}
                  onCheckedChange={() => handleToggle('quiet_hours_enabled')}
                />
              </div>
              {settings.quiet_hours_enabled && (
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1">
                    <Label className="text-xs text-gray-400 mb-1 block">Von</Label>
                    <Select value={settings.quiet_hours_start} onValueChange={(v) => handleSelect('quiet_hours_start', v)}>
                      <SelectTrigger className="bg-[#262626] border-white/10 text-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#262626] border-white/10 max-h-48">
                        {Array.from({ length: 24 }, (_, i) => {
                          const t = `${String(i).padStart(2, '0')}:00`;
                          return <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-gray-500 mt-5">–</span>
                  <div className="flex-1">
                    <Label className="text-xs text-gray-400 mb-1 block">Bis</Label>
                    <Select value={settings.quiet_hours_end} onValueChange={(v) => handleSelect('quiet_hours_end', v)}>
                      <SelectTrigger className="bg-[#262626] border-white/10 text-white text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#262626] border-white/10 max-h-48">
                        {Array.from({ length: 24 }, (_, i) => {
                          const t = `${String(i).padStart(2, '0')}:00`;
                          return <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function SettingRow({ icon, title, description, checked, onToggle }) {
  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div>
          <Label className="text-white text-sm">{title}</Label>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </div>
  );
}