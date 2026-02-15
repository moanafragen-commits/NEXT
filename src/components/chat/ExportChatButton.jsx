import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

export default function ExportChatButton({ messages, characterName }) {
  const handleExport = () => {
    if (!messages || messages.length === 0) {
      toast.error('Keine Nachrichten zum Exportieren');
      return;
    }

    const header = `Chat mit ${characterName}\nExportiert am ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })}\n${'─'.repeat(40)}\n\n`;

    const body = messages.map(msg => {
      const time = format(new Date(msg.created_date), 'dd.MM.yyyy HH:mm', { locale: de });
      const sender = msg.role === 'user' ? 'Du' : characterName;
      const pinned = msg.is_pinned ? ' 📌' : '';
      const bookmarked = msg.is_bookmarked ? ' 🔖' : '';
      return `[${time}] ${sender}${pinned}${bookmarked}:\n${msg.content}\n`;
    }).join('\n');

    const stats = `\n${'─'.repeat(40)}\nStatistik:\n- Gesamt: ${messages.length} Nachrichten\n- Gepinnt: ${messages.filter(m => m.is_pinned).length}\n- Markiert: ${messages.filter(m => m.is_bookmarked).length}\n`;

    const text = header + body + stats;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${characterName.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat exportiert!');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleExport}
      className="text-gray-400 hover:text-white hover:bg-white/10"
      title="Chat exportieren"
    >
      <Download className="w-5 h-5" />
    </Button>
  );
}