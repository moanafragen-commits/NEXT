import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function GroupChatMembersSheet({ open, onClose, characters, groupName }) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="bg-[#1a1a1a] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>{groupName} – Mitglieder</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2 max-h-[60vh] overflow-y-auto">
          {characters.map((char) => (
            <Link
              key={char.id}
              to={createPageUrl(`CharacterInfo?characterId=${char.id}`)}
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <img
                src={char.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`}
                alt={char.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{char.name}</h4>
                <p className="text-xs text-gray-500 truncate">{char.category || char.occupation || char.personality?.slice(0, 40)}</p>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">KI</span>
            </Link>
          ))}
          {characters.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">Keine Charaktere in der Gruppe</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}