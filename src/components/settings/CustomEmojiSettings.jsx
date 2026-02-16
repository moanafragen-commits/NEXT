import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trash2, Upload, Loader2, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

const POPULAR_EMOJIS = ['😀', '😂', '😍', '🥰', '😘', '😎', '🤔', '😢', '😡', '🥺', '😏', '🙄', '👍', '👎', '❤️', '🔥', '✨', '💯', '🎉', '😈', '💀', '🤡', '👻', '🥳'];

export default function CustomEmojiSettings({ isDark }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: customEmojis = [] } = useQuery({
    queryKey: ['custom-emojis'],
    queryFn: () => base44.entities.CustomEmoji.list('-created_date', 100)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CustomEmoji.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custom-emojis'] })
  });

  const handleEmojiClick = (emoji) => {
    setSelectedEmoji(emoji);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEmoji) return;
    
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    // Check if already exists → update
    const existing = customEmojis.find(ce => ce.original_emoji === selectedEmoji);
    if (existing) {
      await base44.entities.CustomEmoji.update(existing.id, { image_url: file_url });
    } else {
      await base44.entities.CustomEmoji.create({ original_emoji: selectedEmoji, image_url: file_url });
    }

    queryClient.invalidateQueries({ queryKey: ['custom-emojis'] });
    setUploading(false);
    setSelectedEmoji(null);
    e.target.value = '';
  };

  const customMap = {};
  customEmojis.forEach(ce => { customMap[ce.original_emoji] = ce; });

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileUpload}
      />

      {uploading && (
        <div className={`flex items-center gap-2 px-4 py-3 mb-3 rounded-lg ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Emoji wird hochgeladen...</span>
        </div>
      )}

      <p className={`text-xs mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Tippe auf ein Emoji um es mit einem eigenen PNG-Bild zu ersetzen.
      </p>

      {/* Existing custom emojis */}
      {customEmojis.length > 0 && (
        <div className="mb-4">
          <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Deine Custom Emojis</p>
          <div className="flex flex-wrap gap-2">
            {customEmojis.map(ce => (
              <div
                key={ce.id}
                className={`relative group flex items-center gap-1.5 px-2 py-1.5 rounded-lg border ${isDark ? 'bg-[#262626] border-white/10' : 'bg-gray-50 border-gray-200'}`}
              >
                <span className="text-lg opacity-40 line-through">{ce.original_emoji}</span>
                <span className="text-gray-500">→</span>
                <img src={ce.image_url} alt="custom" className="w-7 h-7 object-contain" />
                <button
                  onClick={() => deleteMutation.mutate(ce.id)}
                  className={`ml-1 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-400'}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emoji grid to pick from */}
      <div className="grid grid-cols-8 gap-1">
        {POPULAR_EMOJIS.map(emoji => {
          const isCustom = !!customMap[emoji];
          return (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className={`relative text-2xl p-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              } ${isCustom ? (isDark ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30' : 'bg-emerald-50 ring-1 ring-emerald-200') : ''}`}
            >
              {isCustom ? (
                <img src={customMap[emoji].image_url} alt={emoji} className="w-7 h-7 object-contain mx-auto" />
              ) : (
                emoji
              )}
            </button>
          );
        })}
        <button
          onClick={() => {
            const input = prompt('Emoji eingeben, das du ersetzen möchtest:');
            if (input?.trim()) handleEmojiClick(input.trim());
          }}
          className={`flex items-center justify-center p-1.5 rounded-lg border-2 border-dashed ${isDark ? 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-400' : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500'} transition-colors`}
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}