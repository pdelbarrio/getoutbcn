import { Ionicons } from "@expo/vector-icons";

export type CategoryIconName = keyof typeof Ionicons.glyphMap;

export const CATEGORY_ICONS: Record<string, CategoryIconName> = {
  "Live Music": "musical-notes",
  Food: "restaurant",
  Shops: "bag-handle",
  "Stand Up": "mic",
  Cinema: "film",
  Views: "binoculars",
  Silence: "volume-mute",
  Weird: "flash",
  Bars: "beer",
  Art: "color-palette",
};

export const DEFAULT_CATEGORY_ICON: CategoryIconName = "location";

export function getCategoryIcon(category: string): CategoryIconName {
  return CATEGORY_ICONS[category] || DEFAULT_CATEGORY_ICON;
}
