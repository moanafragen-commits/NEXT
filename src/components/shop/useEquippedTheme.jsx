import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CHAT_THEMES } from './ChatThemes';

export function useEquippedTheme(userEmail) {
  const { data: purchases = [] } = useQuery({
    queryKey: ['shop-purchases', userEmail],
    queryFn: () => base44.entities.ShopPurchase.filter({ user_email: userEmail }),
    enabled: !!userEmail
  });

  const equippedThemePurchase = purchases.find(p => p.category === 'chat_theme' && p.is_equipped);
  
  if (!equippedThemePurchase) {
    return CHAT_THEMES.default;
  }

  // Extract theme key from item_key (e.g. "theme_sunset" -> "sunset")
  const themeKey = equippedThemePurchase.item_key.replace('theme_', '');
  return CHAT_THEMES[themeKey] || CHAT_THEMES.default;
}