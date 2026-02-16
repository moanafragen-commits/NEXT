import React from 'react';
import { Button } from "@/components/ui/button";
import { Lock, Check, ShoppingBag } from 'lucide-react';

const RARITY_COLORS = {
  common: 'border-white/10',
  rare: 'border-blue-500/40',
  epic: 'border-purple-500/40',
  legendary: 'border-yellow-500/40'
};

const RARITY_GLOW = {
  common: '',
  rare: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]',
  epic: 'hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]',
  legendary: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]'
};

const RARITY_LABELS = {
  common: '',
  rare: '💎 Selten',
  epic: '🔮 Episch',
  legendary: '👑 Legendär'
};

function ItemPreview({ item }) {
  const meta = item.meta ? (() => { try { return JSON.parse(item.meta); } catch { return {}; } })() : {};

  // Chat Theme preview
  if (item.category === 'chat_theme' && meta.bg) {
    return (
      <div className={`w-full h-24 rounded-lg ${meta.bg} flex items-center justify-center`}>
        <div className="space-y-1.5 w-3/4">
          <div className={`${meta.messageBg || 'bg-white/10'} rounded-lg h-3 w-3/4`} />
          <div className={`${meta.userBg || 'bg-emerald-600'} rounded-lg h-3 w-2/3 ml-auto`} />
          <div className={`${meta.messageBg || 'bg-white/10'} rounded-lg h-3 w-1/2`} />
        </div>
      </div>
    );
  }

  // Avatar Frame preview
  if (item.category === 'avatar_frame' && meta.css) {
    return (
      <div className="w-full h-24 rounded-lg bg-white/5 flex items-center justify-center">
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 ${meta.css}`} />
      </div>
    );
  }

  // Chat Bubble preview
  if (item.category === 'chat_bubble' && meta.css) {
    const isGradient = meta.css.includes('gradient') || meta.css.includes('backdrop');
    return (
      <div className="w-full h-24 rounded-lg bg-[#1a1a1a] flex flex-col items-center justify-center gap-1.5 px-3">
        <div className={`${isGradient ? meta.css : 'bg-[#262626]'} ${!isGradient ? meta.css : 'rounded-2xl'} px-3 py-1.5 text-[10px] text-gray-300 self-start`}>Hallo! 👋</div>
        <div className={`${isGradient ? meta.css : 'bg-emerald-600'} ${!isGradient ? meta.css : 'rounded-2xl'} px-3 py-1.5 text-[10px] text-white self-end`}>Hey! 😊</div>
      </div>
    );
  }

  // Name Color preview
  if (item.category === 'name_color' && meta.css) {
    return (
      <div className="w-full h-24 rounded-lg bg-[#1a1a1a] flex items-center justify-center">
        <span className={`text-lg font-bold ${meta.css}`}>Dein Name</span>
      </div>
    );
  }

  // Voice Effect preview
  if (item.category === 'voice_effect') {
    return (
      <div className="w-full h-24 rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center">
        <span className="text-4xl">{item.emoji || '🎙️'}</span>
      </div>
    );
  }

  // Emoji/Icon fallback for gifts, badges, boosts
  if (item.emoji) {
    return (
      <div className="w-full h-24 rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center">
        <span className="text-4xl">{item.emoji}</span>
      </div>
    );
  }

  // Image fallback
  if (item.preview_image) {
    return <img src={item.preview_image} alt={item.name} className="w-full h-24 object-cover rounded-lg" />;
  }

  return (
    <div className="w-full h-24 rounded-lg bg-white/5 flex items-center justify-center">
      <ShoppingBag className="w-8 h-8 text-gray-600" />
    </div>
  );
}

export default function ShopItemCard({ item, owned, equipped, onBuy, onEquip, canAfford }) {
  const rarityBorder = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
  const rarityGlow = RARITY_GLOW[item.rarity] || '';
  const rarityLabel = RARITY_LABELS[item.rarity];

  return (
    <div className={`relative rounded-xl border ${rarityBorder} bg-white/[0.03] p-3 flex flex-col gap-2 transition-all hover:bg-white/[0.06] ${rarityGlow}`}>
      {rarityLabel && (
        <span className="absolute top-2 right-2 text-[10px] font-bold z-10">{rarityLabel}</span>
      )}

      <ItemPreview item={item} />

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