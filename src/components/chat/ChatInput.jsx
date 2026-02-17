import React, { useState, useRef } from 'react';
import { Send, Mic, X, Image, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import EmojiPicker from './EmojiPicker';
import { base44 } from '@/api/base44Client';

export default function ChatInput({ onSend, isLoading, replyToMessage, onCancelReply, theme }) {
  const isLight = theme?.isLight || false;
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() || imageUrl) {
      onSend(message, imageUrl);
      setMessage('');
      setImageUrl(null);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImageUrl(file_url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {imageUrl && (
        <div className="mb-2 relative">
          <img src={imageUrl} alt="Preview" className="max-h-32 rounded-lg" />
          <button
            type="button"
            onClick={() => setImageUrl(null)}
            className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
      {replyToMessage && (
        <div className={`mb-2 p-2 flex items-start gap-2 ${isLight ? 'bg-black/10' : 'bg-[#262626]/50'} rounded-lg`}>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-emerald-400 font-semibold mb-0.5">
              Antwort auf {replyToMessage.role === 'user' ? 'dich' : 'Nachricht'}
            </p>
            <p className="text-xs text-gray-400 truncate">{replyToMessage.content}</p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={isLight ? 'text-gray-500 hover:text-gray-700 hover:bg-black/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Image className="w-5 h-5" />}
        </Button>
        <EmojiPicker onSelect={(emoji) => setMessage(prev => prev + emoji)} />
        
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nachricht schreiben..."
            className={`w-full rounded-full px-5 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${isLight ? 'bg-white/60 text-gray-900 placeholder-gray-400' : 'bg-[#262626] text-white placeholder-gray-500'}`}
          />
        </div>
        
        {(message.trim() || imageUrl) ? (
          <Button 
            type="submit" 
            size="icon"
            className="h-11 w-11 rounded-full bg-emerald-600 hover:bg-emerald-500 transition-all"
          >
            <Send className="w-5 h-5" />
          </Button>
        ) : (
          <button type="button" className="p-2 text-gray-400 hover:text-gray-300 transition-colors">
            <Mic className="w-6 h-6" />
          </button>
        )}
      </div>
    </form>
  );
}