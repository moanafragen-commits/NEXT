import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Store, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useUserLevel } from '@/components/gamification/useUserLevel';
import CoinDisplay from '@/components/gamification/CoinDisplay';
import LevelBadge from '@/components/gamification/LevelBadge';
import ShopItemCard from '@/components/shop/ShopItemCard';
import { getAllShopItems } from '@/components/shop/ShopData';

const CATEGORY_TABS = [
  { key: 'all', label: '🛒 Alles' },
  { key: 'chat_theme', label: '🎨 Themes' },
  { key: 'avatar_frame', label: '🖼️ Rahmen' },
  { key: 'chat_bubble', label: '💬 Blasen' },
  { key: 'name_color', label: '✏️ Namen' },
  { key: 'premium_gift', label: '🎁 Geschenke' },
  { key: 'voice_effect', label: '🎙️ Stimmen' },
  { key: 'xp_boost', label: '⚡ Boosts' },
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

  // Seed shop items once if empty
  const seedingRef = React.useRef(false);
  useEffect(() => {
    if (!user || seedingRef.current) return;
    if (shopItems.length === 0) {
      seedingRef.current = true;
      seedShopItems();
    }
  }, [user, shopItems.length]);

  const seedShopItems = async () => {
    // Double-check from server to prevent race conditions
    const serverItems = await base44.entities.ShopItem.filter({ is_active: true });
    if (serverItems.length > 0) return;

    const allItems = getAllShopItems();
    for (let i = 0; i < allItems.length; i += 20) {
      await base44.entities.ShopItem.bulkCreate(allItems.slice(i, i + 20));
    }
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
      toast.success(`${item.name} gekauft! 🎉`);
      queryClient.invalidateQueries({ queryKey: ['shop-purchases'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Nicht genug Coins!');
    }
  });

  const equipMutation = useMutation({
    mutationFn: async (item) => {
      // Unequip all of same category
      const sameCat = purchases.filter(p => p.category === item.category && p.is_equipped);
      for (const p of sameCat) {
        await base44.entities.ShopPurchase.update(p.id, { is_equipped: false });
      }
      // Toggle: equip if wasn't equipped
      const purchase = purchases.find(p => p.item_key === item.item_key);
      const wasEquipped = sameCat.some(p => p.item_key === item.item_key);
      if (purchase && !wasEquipped) {
        await base44.entities.ShopPurchase.update(purchase.id, { is_equipped: true });
        toast.success(`${item.name} ausgerüstet!`);
      } else {
        toast.success(`${item.name} abgelegt`);
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

  const sortedItems = [...filteredItems].sort((a, b) => {
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    const ra = rarityOrder[a.rarity] ?? 3;
    const rb = rarityOrder[b.rarity] ?? 3;
    if (ra !== rb) return ra - rb;
    return (b.price || 0) - (a.price || 0);
  });

  const categoryCount = (key) => {
    if (key === 'all') return shopItems.length;
    return shopItems.filter(i => i.category === key).length;
  };

  return (
    <div className="min-h-screen bg-[#111] text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a1a1a]/95 backdrop-blur-md border-b border-white/5 px-4 py-3">
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
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === tab.key
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab.label}
              {categoryCount(tab.key) > 0 && (
                <span className="ml-1 text-[10px] opacity-60">{categoryCount(tab.key)}</span>
              )}
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