import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Moon, Sun, Bell, BellOff, Shield, LogOut, Loader2, ChevronRight, Trash2, Languages, Smile } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BottomNav from '@/components/navigation/BottomNav';
import CustomEmojiSettings from '@/components/settings/CustomEmojiSettings';

export default function AppSettings() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const [settings, setSettings] = useState({
    dark_mode: false,
    nsfw_mode: false,
    notifications_enabled: true,
    language: 'Deutsch'
  });

  useEffect(() => {
    if (user) {
      setSettings({
        dark_mode: user.dark_mode || false,
        nsfw_mode: user.nsfw_mode || false,
        notifications_enabled: user.notifications_enabled !== false,
        language: user.language || 'Deutsch'
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
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#111]' : 'bg-white'}`}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#111] text-white' : 'bg-white text-black'}`}>
      <header className={`sticky top-0 z-10 border-b ${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => window.history.back()}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-base font-semibold">Einstellungen</h1>
          <div className="w-6" />
        </div>
      </header>

      <div className="max-w-lg mx-auto pb-20">
        {/* Appearance */}
        <div className="px-4 pt-6 pb-2">
          <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Darstellung</p>
        </div>
        <div className={`mx-4 rounded-xl overflow-hidden border ${isDark ? 'border-white/10 bg-[#1a1a1a]' : 'border-gray-200 bg-white'}`}>
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
        </div>

        {/* Emojis */}
        <div className="px-4 pt-6 pb-2">
          <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Emojis</p>
        </div>
        <div className={`mx-4 rounded-xl overflow-hidden border p-4 ${isDark ? 'border-white/10 bg-[#1a1a1a]' : 'border-gray-200 bg-white'}`}>
          <CustomEmojiSettings isDark={isDark} />
        </div>

        {/* Content */}
        <div className="px-4 pt-6 pb-2">
          <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Inhalte</p>
        </div>
        <div className={`mx-4 rounded-xl overflow-hidden border ${isDark ? 'border-white/10 bg-[#1a1a1a]' : 'border-gray-200 bg-white'}`}>
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
          <div className={`h-px ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
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
          <div className={`h-px ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
          <SettingRow
            icon={<Languages className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />}
            title="Sprache"
            subtitle={settings.language}
            isDark={isDark}
            action={
              <Select value={settings.language} onValueChange={(val) => toggleSetting('language', val)}>
                <SelectTrigger className={`w-28 h-8 text-xs ${isDark ? 'bg-[#262626] border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-black'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? 'bg-[#262626] border-white/10' : ''}>
                  <SelectItem value="Deutsch" className={isDark ? 'text-white hover:bg-white/10' : ''}>Deutsch</SelectItem>
                  <SelectItem value="Englisch" className={isDark ? 'text-white hover:bg-white/10' : ''}>Englisch</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </div>

        {/* Account */}
        <div className="px-4 pt-6 pb-2">
          <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Account</p>
        </div>
        <div className={`mx-4 rounded-xl overflow-hidden border ${isDark ? 'border-white/10 bg-[#1a1a1a]' : 'border-gray-200 bg-white'}`}>
          <Link to={createPageUrl('NotificationSettings')}>
            <SettingRow
              icon={<Bell className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />}
              title="Benachrichtigungs-Details"
              subtitle="Feineinstellungen für Benachrichtigungen"
              isDark={isDark}
              action={<ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />}
            />
          </Link>
        </div>

        {/* Logout */}
        <div className="mx-4 mt-6">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
              isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100'
            }`}
          >
            <LogOut className="w-4 h-4" />
            Abmelden
          </button>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="mx-4 mt-6">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
                isDark ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-black text-white hover:bg-black/90'
              }`}
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Änderungen speichern'}
            </button>
          </div>
        )}

        {/* Info */}
        <div className="text-center mt-8 px-4">
          <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
            {user?.email}
          </p>
        </div>
      </div>

      <BottomNav user={user} />
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