import React, { useState } from 'react';
import { Share2, Copy, Download, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function ShareChatButton({ messages, character }) {
  const [copied, setCopied] = useState(false);

  const formatChatText = () => {
    const header = `Chat mit ${character.name}\n${character.category || ''} ${character.occupation ? '• ' + character.occupation : ''}\n${'─'.repeat(40)}\n\n`;
    const body = messages.map(m => {
      const time = m.created_date ? format(new Date(m.created_date), 'dd.MM.yy HH:mm', { locale: de }) : '';
      const sender = m.role === 'user' ? 'Du' : character.name;
      return `[${time}] ${sender}:\n${m.content}\n`;
    }).join('\n');
    const footer = `\n${'─'.repeat(40)}\n${messages.length} Nachrichten • Exportiert am ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })}`;
    return header + body + footer;
  };

  const formatProfileText = () => {
    let text = `── ${character.name} ──\n\n`;
    if (character.category) text += `Kategorie: ${character.category}\n`;
    if (character.gender) text += `Geschlecht: ${character.gender}\n`;
    if (character.age) text += `Alter: ${character.age}\n`;
    if (character.occupation) text += `Beruf: ${character.occupation}\n`;
    text += `\nPersönlichkeit:\n${character.personality}\n`;
    if (character.biography) text += `\nBiografie:\n${character.biography}\n`;
    if (character.interests) text += `\nInteressen: ${character.interests}\n`;
    if (character.greeting) text += `\nBegrüßung: "${character.greeting}"\n`;
    return text;
  };

  const copyChat = async () => {
    await navigator.clipboard.writeText(formatChatText());
    setCopied(true);
    toast.success('Chat in Zwischenablage kopiert');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyProfile = async () => {
    await navigator.clipboard.writeText(formatProfileText());
    toast.success('Charakterprofil kopiert');
  };

  const downloadChat = () => {
    const blob = new Blob([formatChatText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${character.name.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Chat heruntergeladen');
  };

  const downloadProfile = () => {
    const blob = new Blob([formatProfileText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profil-${character.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Profil heruntergeladen');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
          {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#262626] border-white/10">
        <DropdownMenuItem onClick={copyChat} className="text-gray-200 hover:bg-white/5 cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Chat kopieren
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadChat} className="text-gray-200 hover:bg-white/5 cursor-pointer">
          <Download className="w-4 h-4 mr-2" />
          Chat herunterladen
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyProfile} className="text-gray-200 hover:bg-white/5 cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Profil kopieren
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadProfile} className="text-gray-200 hover:bg-white/5 cursor-pointer">
          <Download className="w-4 h-4 mr-2" />
          Profil herunterladen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}