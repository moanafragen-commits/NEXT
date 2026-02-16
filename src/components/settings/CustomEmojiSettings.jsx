import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trash2, Loader2, Plus, ImagePlus } from 'lucide-react';
import { Input } from "@/components/ui/input";

export default function CustomEmojiSettings({ isDark }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const { data: customEmojis = [] } = useQuery({
    queryKey: ['custom-emojis'],
    queryFn: () => base44.entities.CustomEmoji.list('-created_date', 100)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomEmoji.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custom-emojis'] })
  });

  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const label = newLabel.trim() || file.name.replace(/\.[^/.]+$/, '');
    await base44.entities.CustomEmoji.create({
      original_emoji: '',
      image_url: file_url,
      label: label
    });

    queryClient.invalidateQueries({ queryKey: ['custom-emojis'] });
    setUploading(false);
    setNewLabel('');
    e.target.value = '';
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/gif,image/webp,image/jpeg"
        className="hidden"
        onChange={handleFileUpload}
      />

      {uploading && (
        <div className={`flex items-center gap-2 px-3 py-2.5 mb-3 rounded-xl text-sm ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
          <Loader2 className="w-4 h-4 animate-spin" />
          Emoji wird hochgeladen...
        </div>
      )}

      <p className={`text-xs mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Lade eigene Bilder als Emojis hoch (PNG, GIF, WebP).
      </p>

      {/* Add new emoji */}
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Name (optional)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className={`flex-1 h-9 text-sm ${isDark ? 'bg-[#262626] border-white/10 text-white placeholder:text-gray-600' : 'bg-white border-gray-200'}`}
        />
        <button
          onClick={handleAddClick}
          disabled={uploading}
          className={`flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-medium transition-colors ${
            isDark 
              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
        >
          <ImagePlus className="w-4 h-4" />
          Hochladen
        </button>
      </div>

      {/* Existing custom emojis */}
      {customEmojis.length > 0 ? (
        <div className="grid grid-cols-4 gap-2">
          {customEmojis.map(ce => (
            <div
              key={ce.id}
              className={`relative group flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-colors ${
                isDark ? 'bg-[#262626] border-white/10 hover:border-white/20' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <img src={ce.image_url} alt={ce.label || 'emoji'} className="w-10 h-10 object-contain" />
              {ce.label && (
                <span className={`text-[10px] text-center truncate w-full ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {ce.label}
                </span>
              )}
              <button
                onClick={() => deleteMutation.mutate(ce.id)}
                className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                  isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-500 hover:bg-red-200'
                }`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-6 rounded-xl border-2 border-dashed ${isDark ? 'border-white/10 text-gray-600' : 'border-gray-200 text-gray-300'}`}>
          <ImagePlus className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Noch keine eigenen Emojis</p>
        </div>
      )}
    </div>
  );
}