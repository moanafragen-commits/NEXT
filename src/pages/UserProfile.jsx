import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Camera, Loader2, Save } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';

export default function UserProfile() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const [formData, setFormData] = useState({
    display_name: '',
    avatar_url: '',
    bio: '',
    status: ''
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        avatar_url: user.avatar_url || '',
        bio: user.bio || '',
        status: user.status || 'online'
      });
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
    updateProfileMutation.mutate(formData);
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
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Input
              id="status"
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              placeholder="Was machst du gerade?"
              className="bg-[#262626] border-white/10 text-white placeholder-gray-500 focus-visible:ring-emerald-500/50"
            />
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