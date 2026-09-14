import type { IconName } from './Icon'

/**
 * The icon choices offered in the category form.
 *
 * Kept beside `Icon.tsx` rather than inside it so that file stays a
 * component-only module (which is what lets Fast Refresh work on it).
 */
export const CATEGORY_ICONS: IconName[] = [
  'wok',
  'noodle',
  'coffee',
  'dessert',
  'coin',
  'pin',
  'utensils',
  'store',
  'tag',
  'heart',
  'sparkles',
  'cap',
]
