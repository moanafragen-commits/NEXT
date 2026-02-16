import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ITEM_TYPES = [
  { type: 'ring', emoji: '💍', label: 'Ring' },
  { type: 'freundschaftsarmband', emoji: '📿', label: 'Freundschaftsband' },
  { type: 'halskette', emoji: '📿', label: 'Halskette' },
  { type: 'schlüssel', emoji: '🔑', label: 'Schlüssel' },
  { type: 'foto', emoji: '📸', label: 'Gemeinsames Foto' },
  { type: 'brief', emoji: '💌', label: 'Brief' },
  { type: 'talisman', emoji: '🧿', label: 'Talisman' },
  { type: 'tattoo', emoji: '🎨', label: 'Matching Tattoo' },
  { type: 'matching_outfit', emoji: '👕', label: 'Matching Outfit' },
  { type: 'gemeinsames_symbol', emoji: '⭐', label: 'Gemeinsames Symbol' },
];

export default function RelationshipItemPanel({ characterId, userEmail, characterName }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [itemName, setItemName] = useState('');
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: ['relationship-items', characterId],
    queryFn: () => base44.entities.RelationshipItem.filter({ character_id: characterId, user_email: userEmail }),
    enabled: !!characterId && !!userEmail
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const itemType = ITEM_TYPES.find(t => t.type === selectedType);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${characterName} bekommt ein Beziehungs-Item geschenkt: ${itemType.emoji} ${itemType.label} - "${itemName}".
Schreibe eine kurze Geschichte/Bedeutung dazu (1-2 Sätze), die emotional und persönlich ist.`,
        response_json_schema: {
          type: "object",
          properties: {
            description: { type: "string" },
            emoji: { type: "string" }
          }
        }
      });

      return base44.entities.RelationshipItem.create({
        character_id: characterId,
        user_email: userEmail,
        item_type: selectedType,
        name: itemName,
        description: result.description,
        emoji: result.emoji || itemType.emoji,
        given_date: new Date().toISOString().split('T')[0],
        is_equipped: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationship-items', characterId] });
      setShowAdd(false);
      setSelectedType(null);
      setItemName('');
    }
  });

  return (
    <div className="space-y-3">
      {/* Existing Items */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="text-center">
                <span className="text-2xl">{item.emoji}</span>
                <p className="text-xs font-medium text-white mt-1">{item.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{item.description}</p>
                {item.given_date && (
                  <p className="text-[9px] text-gray-600 mt-1">
                    seit {new Date(item.given_date).toLocaleDateString('de-DE')}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 text-center py-4">Noch keine gemeinsamen Items</p>
      )}

      {/* Add New */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-5 gap-1.5">
              {ITEM_TYPES.map(t => (
                <button
                  key={t.type}
                  onClick={() => setSelectedType(t.type)}
                  className={`p-2 rounded-lg text-center transition-all ${
                    selectedType === t.type
                      ? 'bg-pink-500/20 border border-pink-500/40'
                      : 'bg-white/5 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-lg">{t.emoji}</span>
                  <p className="text-[8px] text-gray-400 mt-0.5">{t.label}</p>
                </button>
              ))}
            </div>

            {selectedType && (
              <div className="flex gap-2">
                <Input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Name/Bedeutung..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 flex-1"
                />
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={!itemName.trim() || createMutation.isPending}
                  size="sm"
                  className="bg-pink-600 hover:bg-pink-500"
                >
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schenken'}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setShowAdd(!showAdd)}
        variant="outline"
        size="sm"
        className="w-full border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
      >
        {showAdd ? <X className="w-4 h-4 mr-1.5" /> : <Plus className="w-4 h-4 mr-1.5" />}
        {showAdd ? 'Abbrechen' : 'Beziehungs-Item hinzufügen'}
      </Button>
    </div>
  );
}