import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Moon, Sun, Bell, BellOff, Shield, LogOut, Loader2, ChevronRight, Languages, Smile, Palette, User, Info, Volume2, VolumeX, Pencil } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BottomNav from '@/components/navigation/BottomNav';
import CustomEmojiSettings from '@/components/settings/CustomEmojiSettings';

export default function AppSettings() {
  const queryClient = useQueryClient();
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const [settings, setSettings] = useState({
    dark_mode: false,
    nsfw_mode: false,
    notifications_enabled: true,
    language: 'Deutsch',
    display_name: ''
  });

  useEffect(() => {
    if (user) {
      setSettings({
        dark_mode: user.dark_mode || false,
        nsfw_mode: user.nsfw_mode || false,
        notifications_enabled: user.notifications_enabled !== false,
        language: user.language || 'Deutsch',
        display_name: user.display_name || ''
      });
    }
  }, [user]);

  const [hasChanges, setHasChanges] = useState(false);

  const saveMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setHasChanges(false);
    }
  });

  const toggleSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const handleLogout = () => {
    if (confirm('Möchtest du dich wirklich abmelden?')) {
      base44.auth.logout();
    }
  };

  const isDark = settings.dark_mode;

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#111]' : 'bg-gray-50'}`}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#111] text-white' : 'bg-gray-50 text-black'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 border-b ${isDark ? 'bg-[#111]/80 border-white/10' : 'bg-gray-50/80 border-gray-200'} backdrop-blur-md`}>
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <button onClick={() => window.history.back()} className="p-1 -ml-1 rounded-full hover:bg-black/5 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold">Einstellungen</h1>
          <div className="w-7" />
        </div>
      </header>

      <div className="max-w-lg mx-auto pb-24 px-4">

        {/* ── Darstellung ── */}
        <SectionLabel isDark={isDark} icon={<Palette className="w-3.5 h-3.5" />}>Darstellung</SectionLabel>
        <SettingsCard isDark={isDark}>
          <SettingRow
            icon={isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            title="Dark Mode"
            subtitle={isDark ? 'Dunkles Design aktiv' : 'Helles Design aktiv'}
            isDark={isDark}
            action={
              <Switch
                checked={settings.dark_mode}
                onCheckedChange={(val) => toggleSetting('dark_mode', val)}
              />
            }
          />
          <Divider isDark={isDark} />
          <SettingRow
            icon={<Languages className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />}
            title="Sprache"
            subtitle={settings.language}
            isDark={isDark}
            action={
              <Select value={settings.language} onValueChange={(val) => toggleSetting('language', val)}>
                <SelectTrigger className={`w-28 h-8 text-xs ${isDark ? 'bg-[#262626] border-white/10 text-white' : 'bg-white border-gray-200 text-black'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#262626] border-white/10' : ''}>
                  <SelectItem value="Deutsch" className={isDark ? 'text-white hover:bg-white/10' : ''}>Deutsch</SelectItem>
                  <SelectItem value="Englisch" className={isDark ? 'text-white hover:bg-white/10' : ''}>Englisch</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </SettingsCard>

        {/* ── Custom Emojis ── */}
        <SectionLabel isDark={isDark} icon={<Smile className="w-3.5 h-3.5" />}>Custom Emojis</SectionLabel>
        <SettingsCard isDark={isDark}>
          <button
            onClick={() => setShowEmojiPanel(!showEmojiPanel)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}
          >
            <Smile className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[14px] font-medium">Emojis anpassen</p>
              <p className={`text-[12px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Ersetze Emojis durch eigene Bilder</p>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${showEmojiPanel ? 'rotate-90' : ''} ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          </button>
          {showEmojiPanel && (
            <>
              <Divider isDark={isDark} />
              <div className="px-4 py-3">
                <CustomEmojiSettings isDark={isDark} />
              </div>
            </>
          )}
        </SettingsCard>

        {/* ── Inhalte & Benachrichtigungen ── */}
        <SectionLabel isDark={isDark} icon={<Shield className="w-3.5 h-3.5" />}>Inhalte & Benachrichtigungen</SectionLabel>
        <SettingsCard isDark={isDark}>
          <SettingRow
            icon={<Shield className={`w-5 h-5 ${settings.nsfw_mode ? 'text-red-400' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />}
            title="NSFW-Modus"
            subtitle="Explizite Inhalte erlauben"
            isDark={isDark}
            action={
              <Switch
                checked={settings.nsfw_mode}
                onCheckedChange={(val) => toggleSetting('nsfw_mode', val)}
              />
            }
          />
          <Divider isDark={isDark} />
          <SettingRow
            icon={settings.notifications_enabled ? <Bell className="w-5 h-5 text-blue-400" /> : <BellOff className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />}
            title="Benachrichtigungen"
            subtitle={settings.notifications_enabled ? 'Aktiviert' : 'Deaktiviert'}
            isDark={isDark}
            action={
              <Switch
                checked={settings.notifications_enabled}
                onCheckedChange={(val) => toggleSetting('notifications_enabled', val)}
              />
            }
          />
          <Divider isDark={isDark} />
          <Link to={createPageUrl('NotificationSettings')}>
            <SettingRow
              icon={<Volume2 className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />}
              title="Benachrichtigungs-Details"
              subtitle="Feineinstellungen für Benachrichtigungen"
              isDark={isDark}
              action={<ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />}
            />
          </Link>
        </SettingsCard>

        {/* ── Account ── */}
        <SectionLabel isDark={isDark} icon={<User className="w-3.5 h-3.5" />}>Account</SectionLabel>
        <SettingsCard isDark={isDark}>
          <div className={`flex items-center gap-3 px-4 py-3.5`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <User className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium truncate">{user?.full_name || 'Benutzer'}</p>
              <p className={`text-[12px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{user?.email}</p>
            </div>
          </div>
        </SettingsCard>

        {/* Save Button */}
        {hasChanges && (
          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-sm ${
                isDark ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Änderungen speichern'}
            </button>
          </div>
        )}

        {/* Logout */}
        <div className="mt-4">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-medium transition-colors ${
              isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100'
            }`}
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </button>
        </div>

        {/* Version */}
        <p className={`text-center mt-6 text-[11px] ${isDark ? 'text-gray-700' : 'text-gray-300'}`}>
          NEXT · Version 1.0 · Made with ❤️
        </p>
      </div>

      <BottomNav user={user} />
    </div>
  );
}

function SectionLabel({ children, isDark, icon }) {
  return (
    <div className="flex items-center gap-1.5 pt-6 pb-2">
      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>{icon}</span>
      <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{children}</p>
    </div>
  );
}

function SettingsCard({ children, isDark }) {
  return (
    <div className={`rounded-2xl overflow-hidden border ${isDark ? 'border-white/10 bg-[#1a1a1a]' : 'border-gray-200 bg-white'} shadow-sm`}>
      {children}
    </div>
  );
}

function SettingRow({ icon, title, subtitle, action, isDark }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}>
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium">{title}</p>
        {subtitle && <p className={`text-[12px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Divider({ isDark }) {
  return <div className={`h-px mx-4 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />;
}