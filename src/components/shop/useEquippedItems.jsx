import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CHAT_THEMES } from './ChatThemes';

export function useEquippedItems(userEmail) {
  const { data: purchases = [] } = useQuery({
    queryKey: ['shop-purchases', userEmail],
    queryFn: () => base44.entities.ShopPurchase.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const equipped = purchases.filter(p => p.is_equipped);

  const getEquipped = (category) => {
    const item = equipped.find(p => p.category === category);
    if (!item) return null;
    const meta = (() => { try { return JSON.parse(item.meta || '{}'); } catch { return {}; } })();
    return { ...item, parsedMeta: meta };
  };

  // Find meta from shop items for equipped purchases
  const { data: shopItems = [] } = useQuery({
    queryKey: ['shop-items'],
    queryFn: () => base44.entities.ShopItem.filter({ is_active: true })
  });

  const getEquippedMeta = (category) => {
    const purchase = equipped.find(p => p.category === category);
    if (!purchase) return null;
    const shopItem = shopItems.find(s => s.item_key === purchase.item_key);
    if (!shopItem?.meta) return null;
    try { return JSON.parse(shopItem.meta); } catch { return null; }
  };

  // Theme
  const themeMeta = getEquippedMeta('chat_theme');
  const theme = themeMeta?.themeKey ? (CHAT_THEMES[themeMeta.themeKey] || CHAT_THEMES.default) : CHAT_THEMES.default;

  // Avatar Frame CSS
  const frameMeta = getEquippedMeta('avatar_frame');
  const avatarFrameCSS = frameMeta?.css || '';

  // Chat Bubble CSS
  const bubbleMeta = getEquippedMeta('chat_bubble');
  const chatBubbleCSS = bubbleMeta?.css || '';

  // Name Color CSS
  const nameColorMeta = getEquippedMeta('name_color');
  const nameColorCSS = nameColorMeta?.css || '';

  // Voice Effect prompt
  const voiceMeta = getEquippedMeta('voice_effect');
  const voicePrompt = voiceMeta?.prompt || '';

  // Profile badges
  const badgePurchases = equipped.filter(p => p.category === 'profile_badge');
  const badges = badgePurchases.map(p => {
    const si = shopItems.find(s => s.item_key === p.item_key);
    return si?.emoji || '';
  }).filter(Boolean);

  return {
    theme,
    avatarFrameCSS,
    chatBubbleCSS,
    nameColorCSS,
    voicePrompt,
    badges,
    purchases,
    equipped
  };
}