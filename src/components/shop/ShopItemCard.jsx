import React from 'react';
import { Button } from "@/components/ui/button";
import { Lock, Check, ShoppingBag } from 'lucide-react';

const RARITY_COLORS = {
  common: 'border-white/10',
  rare: 'border-blue-500/40',
  epic: 'border-purple-500/40',
  legendary: 'border-yellow-500/40'
};

const RARITY_LABELS = {
  common: '',
  rare: '💎 Selten',
  epic: '🔮 Episch',
  legendary: '👑 Legendär'
};

export default function ShopItemCard({ item, owned, equipped, onBuy, onEquip, canAfford }) {
  const rarityBorder = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
  const rarityLabel = RARITY_LABELS[item.rarity];

  return (
    <div className={`relative rounded-xl border ${rarityBorder} bg-white/[0.03] p-3 flex flex-col gap-2 transition-all hover:bg-white/[0.06]`}>
      {rarityLabel && (
        <span className="absolute top-2 right-2 text-[10px] font-bold">{rarityLabel}</span>
      )}

      {/* Preview */}
      {item.preview_image ? (
        <img src={item.preview_image} alt={item.name} className="w-full h-24 object-cover rounded-lg" />
      ) : item.category === 'chat_theme' && item.meta ? (
        <div className={`w-full h-24 rounded-lg ${JSON.parse(item.meta).bg || 'bg-[#262626]'} flex items-center justify-center`}>
          <div className="space-y-1.5 w-3/4">
            <div className={`${JSON.parse(item.meta).messageBg || 'bg-white/10'} rounded-lg h-3 w-3/4`} />
            <div className={`${JSON.parse(item.meta).userBg || 'bg-emerald-600'} rounded-lg h-3 w-2/3 ml-auto`} />
            <div className={`${JSON.parse(item.meta).messageBg || 'bg-white/10'} rounded-lg h-3 w-1/2`} />
          </div>
        </div>
      ) : (
        <div className="w-full h-24 rounded-lg bg-white/5 flex items-center justify-center text-3xl">
          <ShoppingBag className="w-8 h-8 text-gray-600" />
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-white truncate">{item.name}</h3>
        {item.description && <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>}
      </div>

      {owned ? (
        <Button
          size="sm"
          onClick={() => onEquip(item)}
          className={`w-full text-xs h-8 ${equipped ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-white/10 hover:bg-white/15 text-gray-300'}`}
        >
          {equipped ? <><Check className="w-3 h-3 mr-1" /> Ausgerüstet</> : 'Ausrüsten'}
        </Button>
      ) : (
        <Button
          size="sm"
          onClick={() => onBuy(item)}
          disabled={!canAfford}
          className={`w-full text-xs h-8 ${canAfford ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-white/5 text-gray-600'}`}
        >
          {canAfford ? <>🪙 {item.price}</> : <><Lock className="w-3 h-3 mr-1" /> {item.price}</>}
        </Button>
      )}
    </div>
  );
}