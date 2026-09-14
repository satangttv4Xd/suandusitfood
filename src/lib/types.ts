/**
 * Data model for SUAN DUSIT FOOD GUIDE.
 *
 * The shapes below mirror the relational schema in `database/database.sql`
 * one-to-one, so the localStorage store can be swapped for a real SQL API
 * without touching any component. Foreign keys are plain string ids.
 *
 *   Category  1 → n  Restaurant
 *   Restaurant 1 → n Menu
 *   Restaurant 1 → n RestaurantImage
 *   Restaurant 1 → n Review
 */

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export type RestaurantStatus = 'open' | 'closed'

export interface User {
  id: string
  username: string
  displayName: string
  /** PBKDF2-SHA256, base64. Never store the plain password. */
  passwordHash: string
  salt: string
  role: 'admin'
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  /** Key into the built-in SVG icon set, used when `image` is empty. */
  icon: string
  /** Optional uploaded icon (data URL) that overrides `icon`. */
  image: string
  sortOrder: number
  createdAt: string
}

export interface Restaurant {
  id: string
  name: string
  slug: string
  /** Cover photo — data URL (uploaded) or remote URL (seed data). */
  coverImage: string
  description: string
  categoryId: string
  priceMin: number
  priceAvg: number
  rating: number
  /** "HH:MM" 24h. */
  openTime: string
  closeTime: string
  openDays: DayKey[]
  phone: string
  facebook: string
  instagram: string
  website: string
  address: string
  lat: number | null
  lng: number | null
  mapUrl: string
  status: RestaurantStatus
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface RestaurantImage {
  id: string
  restaurantId: string
  url: string
  caption: string
  sortOrder: number
  createdAt: string
}

export interface Menu {
  id: string
  restaurantId: string
  name: string
  price: number
  description: string
  image: string
  recommended: boolean
  createdAt: string
}

export interface Review {
  id: string
  restaurantId: string
  author: string
  rating: number
  comment: string
  createdAt: string
}

export interface Database {
  version: number
  users: User[]
  categories: Category[]
  restaurants: Restaurant[]
  restaurantImages: RestaurantImage[]
  menus: Menu[]
  reviews: Review[]
}

/** A restaurant joined with everything the UI usually needs alongside it. */
export interface RestaurantView extends Restaurant {
  category: Category | null
  images: RestaurantImage[]
  menus: Menu[]
  reviews: Review[]
  reviewCount: number
  /** Average of the review ratings, falling back to the admin-set rating. */
  ratingAvg: number
}
