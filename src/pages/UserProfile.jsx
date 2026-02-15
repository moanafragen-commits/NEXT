import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Camera, Loader2, Save, Settings, Grid, Bookmark } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { motion } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';

export default function UserProfile() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState('posts'); // posts, saved

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['user-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 100)
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list()
  });

  const [formData, setFormData] = useState({
    display_name: '',
    avatar_url: '',
    bio: '',
    status: 'online',
    nsfw_mode: false
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        avatar_url: user.avatar_url || '',
        bio: user.bio || '',
        status: user.status || 'online',
        nsfw_mode: user.nsfw_mode || false
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setEditing(false);
    }
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, avatar_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const displayAvatar = formData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => window.history.back()}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-base font-semibold">{user?.display_name || user?.full_name || 'Profil'}</h1>
          <Link to={createPageUrl('AppSettings')}>
            <Settings className="w-5 h-5 text-gray-500" />
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto pb-20">
        {/* Profile Header */}
        <div className="px-4 py-5">
          <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0">
              <img
                src={displayAvatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
              {editing && (
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
                </label>
              )}
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
            </div>

            <div className="flex-1 flex justify-around text-center">
              <div>
                <p className="text-lg font-semibold">{posts.length}</p>
                <p className="text-xs text-gray-500">Beiträge</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{characters.length}</p>
                <p className="text-xs text-gray-500">Charaktere</p>
              </div>
              <div>
                <p className="text-lg font-semibold">{characters.filter(c => c.is_favorite).length}</p>
                <p className="text-xs text-gray-500">Favoriten</p>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <p className="text-[14px] font-semibold">{user?.display_name || user?.full_name || ''}</p>
            {user?.bio && <p className="text-[13px] text-gray-600 mt-0.5">{user.bio}</p>}
          </div>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="w-full mt-3 py-1.5 rounded-lg bg-gray-100 text-[13px] font-semibold text-black hover:bg-gray-200 transition-colors"
            >
              Profil bearbeiten
            </button>
          )}
        </div>

        {/* Edit Form */}
        {editing && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handleSubmit}
            className="px-4 pb-4 space-y-4 border-b border-gray-100"
          >
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Name</Label>
              <Input
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Anzeigename"
                className="bg-gray-50 border-gray-200 text-black h-10 text-sm rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Erzähl etwas über dich..."
                rows={3}
                className="bg-gray-50 border-gray-200 text-black text-sm rounded-lg resize-none"
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(false)} className="flex-1 rounded-lg h-10 text-sm">
                Abbrechen
              </Button>
              <Button type="submit" disabled={updateProfileMutation.isPending} className="flex-1 rounded-lg h-10 text-sm bg-black hover:bg-black/90 text-white">
                {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Speichern'}
              </Button>
            </div>
          </motion.form>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab('posts')}
            className={`flex-1 py-3 flex justify-center ${tab === 'posts' ? 'border-b-2 border-black' : 'text-gray-400'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTab('saved')}
            className={`flex-1 py-3 flex justify-center ${tab === 'saved' ? 'border-b-2 border-black' : 'text-gray-400'}`}
          >
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        {/* Posts Grid */}
        {tab === 'posts' && (
          <div className="grid grid-cols-3 gap-0.5">
            {posts.filter(p => p.image_url).map(post => (
              <div key={post.id} className="aspect-square">
                <img src={post.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            {posts.filter(p => p.image_url).length === 0 && (
              <div className="col-span-3 py-16 text-center">
                <p className="text-sm text-gray-400">Noch keine Beiträge</p>
              </div>
            )}
          </div>
        )}

        {tab === 'saved' && (
          <div className="py-16 text-center">
            <Bookmark className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Gespeicherte Beiträge erscheinen hier</p>
          </div>
        )}
      </div>

      <BottomNav user={user} />
    </div>
  );
}