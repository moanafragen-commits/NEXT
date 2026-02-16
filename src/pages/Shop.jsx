import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Store, Sparkles, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useUserLevel } from '@/components/gamification/useUserLevel';
import CoinDisplay from '@/components/gamification/CoinDisplay';
import LevelBadge from '@/components/gamification/LevelBadge';
import ShopItemCard from '@/components/shop/ShopItemCard';
import { CHAT_THEMES } from '@/components/shop/ChatThemes';

const CATEGORY_TABS = [
  { key: 'all', label: '🛒 Alles', icon: Store },
  { key: 'chat_theme', label: '🎨 Themes' },
  { key: 'gift', label: '🎁 Geschenke' },
  { key: 'avatar_frame', label: '🖼️ Rahmen' },
  { key: 'profile_badge', label: '🏅 Badges' },
];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('all');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { userLevel, spendCoins } = useUserLevel(user?.email);

  const { data: shopItems = [] } = useQuery({
    queryKey: ['shop-items'],
    queryFn: () => base44.entities.ShopItem.filter({ is_active: true })
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ['shop-purchases', user?.email],
    queryFn: () => base44.entities.ShopPurchase.filter({ user_email: user.email }),
    enabled: !!user
  });

  // Seed shop items if none exist
  useEffect(() => {
    if (shopItems.length === 0 && user) {
      seedShopItems();
    }
  }, [shopItems.length, user]);

  const seedShopItems = async () => {
    const themeItems = Object.entries(CHAT_THEMES)
      .filter(([key]) => key !== 'default')
      .map(([key, theme]) => ({
        item_key: `theme_${key}`,
        name: theme.name,
        description: `Chat-Hintergrund: ${theme.name}`,
        category: 'chat_theme',
        price: key === 'gold' ? 500 : key === 'galaxy' || key === 'neon' ? 300 : 150,
        rarity: key === 'gold' ? 'legendary' : key === 'galaxy' || key === 'neon' ? 'epic' : key === 'sunset' || key === 'cherry' ? 'rare' : 'common',
        is_active: true,
        meta: JSON.stringify({ bg: theme.bg, messageBg: theme.messageBg, userBg: theme.userBg, themeKey: key })
      }));

    await base44.entities.ShopItem.bulkCreate(themeItems);
    queryClient.invalidateQueries({ queryKey: ['shop-items'] });
  };

  const buyMutation = useMutation({
    mutationFn: async (item) => {
      await spendCoins(item.price);
      await base44.entities.ShopPurchase.create({
        user_email: user.email,
        item_key: item.item_key,
        item_name: item.name,
        category: item.category,
        price_paid: item.price,
        is_equipped: false
      });
    },
    onSuccess: (_, item) => {
      toast.success(`${item.name} gekauft!`);
      queryClient.invalidateQueries({ queryKey: ['shop-purchases'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Kauf fehlgeschlagen');
    }
  });

  const equipMutation = useMutation({
    mutationFn: async (item) => {
      // Unequip all of same category first
      const sameCat = purchases.filter(p => p.category === item.category && p.is_equipped);
      for (const p of sameCat) {
        await base44.entities.ShopPurchase.update(p.id, { is_equipped: false });
      }
      // Equip this one (toggle off if already equipped)
      const purchase = purchases.find(p => p.item_key === item.item_key);
      const wasEquipped = sameCat.some(p => p.item_key === item.item_key);
      if (purchase && !wasEquipped) {
        await base44.entities.ShopPurchase.update(purchase.id, { is_equipped: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-purchases'] });
    }
  });

  const ownedKeys = new Set(purchases.map(p => p.item_key));
  const equippedKeys = new Set(purchases.filter(p => p.is_equipped).map(p => p.item_key));

  const filteredItems = activeCategory === 'all'
    ? shopItems
    : shopItems.filter(i => i.category === activeCategory);

  // Sort: legendary first, then by price desc
  const sortedItems = [...filteredItems].sort((a, b) => {
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    const ra = rarityOrder[a.rarity] ?? 3;
    const rb = rarityOrder[b.rarity] ?? 3;
    if (ra !== rb) return ra - rb;
    return (b.price || 0) - (a.price || 0);
  });

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-400" />
              <h1 className="text-lg font-bold">Shop</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userLevel && <LevelBadge level={userLevel.level} size="xs" />}
            {userLevel && <CoinDisplay coins={userLevel.coins} />}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === tab.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Items Grid */}
      <main className="p-4">
        {sortedItems.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Keine Items in dieser Kategorie</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sortedItems.map(item => (
              <ShopItemCard
                key={item.id}
                item={item}
                owned={ownedKeys.has(item.item_key)}
                equipped={equippedKeys.has(item.item_key)}
                canAfford={(userLevel?.coins || 0) >= item.price}
                onBuy={(i) => buyMutation.mutate(i)}
                onEquip={(i) => equipMutation.mutate(i)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}