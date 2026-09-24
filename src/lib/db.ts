import {
  seedCategories,
  seedImages,
  seedMenus,
  seedRestaurants,
  seedReviews,
  seedTeamMembers,
} from './seed'
import type {
  Category,
  Database,
  Menu,
  Restaurant,
  RestaurantImage,
  RestaurantView,
  Review,
  TeamMember,
  User,
} from './types'

/**
 * The application's data layer.
 *
 * Every screen — public and admin — reads and writes through this module and
 * nothing else, so no restaurant data is ever hardcoded into a component.
 * Records live in localStorage under one JSON document; swapping this file for
 * `fetch()` calls against a REST API is the only change a real backend needs.
 */

export const STORAGE_KEY = 'sdfg.db.v1'
export const DB_VERSION = 1

/** localStorage is ~5 MB in every browser; warn the admin well before that. */
export const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024

export class StorageFullError extends Error {
  constructor() {
    super('พื้นที่จัดเก็บข้อมูลเต็ม')
    this.name = 'StorageFullError'
  }
}

// ---------------------------------------------------------------- utilities

export const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  return base || `item-${Math.random().toString(36).slice(2, 8)}`
}

function emptyDatabase(): Database {
  return {
    version: DB_VERSION,
    users: [],
    categories: [],
    restaurants: [],
    restaurantImages: [],
    menus: [],
    reviews: [],
    teamMembers: [],
  }
}

export function seedDatabase(users: User[] = []): Database {
  return {
    version: DB_VERSION,
    users,
    categories: structuredClone(seedCategories),
    restaurants: structuredClone(seedRestaurants),
    restaurantImages: structuredClone(seedImages),
    menus: structuredClone(seedMenus),
    reviews: structuredClone(seedReviews),
    teamMembers: structuredClone(seedTeamMembers),
  }
}

/** Fill in any table a hand-edited or older document is missing. */
function normalise(raw: unknown): Database {
  const base = emptyDatabase()
  if (!raw || typeof raw !== 'object') return base
  const input = raw as Partial<Database>
  return {
    version: DB_VERSION,
    users: Array.isArray(input.users) ? input.users : base.users,
    categories: Array.isArray(input.categories) ? input.categories : base.categories,
    restaurants: Array.isArray(input.restaurants) ? input.restaurants : base.restaurants,
    restaurantImages: Array.isArray(input.restaurantImages)
      ? input.restaurantImages
      : base.restaurantImages,
    menus: Array.isArray(input.menus) ? input.menus : base.menus,
    reviews: Array.isArray(input.reviews) ? input.reviews : base.reviews,
    teamMembers: Array.isArray(input.teamMembers)
      ? input.teamMembers
      : structuredClone(seedTeamMembers),
  }
}

// ------------------------------------------------------------- store engine

let cache: Database | null = null
const listeners = new Set<() => void>()

function readFromStorage(): Database {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const fresh = seedDatabase()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
      return fresh
    }
    return normalise(JSON.parse(raw))
  } catch {
    // Corrupted or unavailable storage — run from a clean in-memory copy
    // rather than blanking the screen.
    return seedDatabase()
  }
}

function writeToStorage(db: Database) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      throw new StorageFullError()
    }
    throw error
  }
}

export function getDatabase(): Database {
  cache ??= readFromStorage()
  return cache
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Apply a change to a copy of the document, persist it, then publish it.
 * Persisting first means a quota failure leaves the live cache untouched.
 */
export function mutate<T>(recipe: (draft: Database) => T): T {
  const draft = structuredClone(getDatabase())
  const result = recipe(draft)
  writeToStorage(draft)
  cache = draft
  listeners.forEach((listener) => listener())
  return result
}

function replaceDatabase(db: Database) {
  writeToStorage(db)
  cache = db
  listeners.forEach((listener) => listener())
}

/** Keep other open tabs in sync with this one. */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return
    cache = readFromStorage()
    listeners.forEach((listener) => listener())
  })
}

// -------------------------------------------------------------------- users

export function findUserByUsername(username: string): User | undefined {
  const needle = username.trim().toLowerCase()
  return getDatabase().users.find((user) => user.username.toLowerCase() === needle)
}

export function addUser(user: User) {
  mutate((db) => {
    db.users.push(user)
  })
}

export function updateUserPassword(userId: string, passwordHash: string, salt: string) {
  mutate((db) => {
    const user = db.users.find((candidate) => candidate.id === userId)
    if (user) {
      user.passwordHash = passwordHash
      user.salt = salt
    }
  })
}

// --------------------------------------------------------------- categories

export function listCategories(): Category[] {
  return [...getDatabase().categories].sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getCategory(idOrSlug: string): Category | null {
  return (
    getDatabase().categories.find((c) => c.id === idOrSlug || c.slug === idOrSlug) ?? null
  )
}

export type CategoryInput = Omit<Category, 'id' | 'createdAt' | 'slug'> & { slug?: string }

export function createCategory(input: CategoryInput): Category {
  return mutate((db) => {
    const category: Category = {
      ...input,
      id: uid('cat'),
      slug: uniqueSlug(input.slug || slugify(input.name), db.categories),
      createdAt: new Date().toISOString(),
    }
    db.categories.push(category)
    return category
  })
}

export function updateCategory(id: string, input: Partial<CategoryInput>) {
  mutate((db) => {
    const category = db.categories.find((c) => c.id === id)
    if (!category) return
    Object.assign(category, input)
    if (input.slug) {
      category.slug = uniqueSlug(slugify(input.slug), db.categories, id)
    }
  })
}

/** Restaurants keep working after their category is gone — they show as "ไม่ระบุหมวดหมู่". */
export function deleteCategory(id: string) {
  mutate((db) => {
    db.categories = db.categories.filter((c) => c.id !== id)
    db.restaurants.forEach((restaurant) => {
      if (restaurant.categoryId === id) restaurant.categoryId = ''
    })
  })
}

function uniqueSlug(candidate: string, rows: { id: string; slug: string }[], selfId?: string) {
  let slug = candidate
  let n = 2
  while (rows.some((row) => row.slug === slug && row.id !== selfId)) {
    slug = `${candidate}-${n++}`
  }
  return slug
}

// -------------------------------------------------------------- restaurants

export function listRestaurants(): Restaurant[] {
  return [...getDatabase().restaurants].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getRestaurant(idOrSlug: string): Restaurant | null {
  return (
    getDatabase().restaurants.find((r) => r.id === idOrSlug || r.slug === idOrSlug) ?? null
  )
}

export type RestaurantInput = Omit<
  Restaurant,
  'id' | 'createdAt' | 'updatedAt' | 'slug'
> & { slug?: string }

export function createRestaurant(input: RestaurantInput): Restaurant {
  return mutate((db) => {
    const stamp = new Date().toISOString()
    const restaurant: Restaurant = {
      ...input,
      id: uid('res'),
      slug: uniqueSlug(input.slug || slugify(input.name), db.restaurants),
      createdAt: stamp,
      updatedAt: stamp,
    }
    db.restaurants.push(restaurant)
    return restaurant
  })
}

export function updateRestaurant(id: string, input: Partial<RestaurantInput>) {
  mutate((db) => {
    const restaurant = db.restaurants.find((r) => r.id === id)
    if (!restaurant) return
    Object.assign(restaurant, input)
    if (input.slug) {
      restaurant.slug = uniqueSlug(slugify(input.slug), db.restaurants, id)
    }
    restaurant.updatedAt = new Date().toISOString()
  })
}

/** Deleting a restaurant takes its gallery, menus and reviews with it. */
export function deleteRestaurant(id: string) {
  mutate((db) => {
    db.restaurants = db.restaurants.filter((r) => r.id !== id)
    db.restaurantImages = db.restaurantImages.filter((i) => i.restaurantId !== id)
    db.menus = db.menus.filter((m) => m.restaurantId !== id)
    db.reviews = db.reviews.filter((r) => r.restaurantId !== id)
  })
}

// ------------------------------------------------------- restaurant images

export function listImages(restaurantId: string): RestaurantImage[] {
  return getDatabase()
    .restaurantImages.filter((image) => image.restaurantId === restaurantId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function replaceImages(
  restaurantId: string,
  images: { url: string; caption?: string }[],
) {
  mutate((db) => {
    db.restaurantImages = db.restaurantImages.filter(
      (image) => image.restaurantId !== restaurantId,
    )
    images.forEach((image, index) => {
      db.restaurantImages.push({
        id: uid('img'),
        restaurantId,
        url: image.url,
        caption: image.caption ?? '',
        sortOrder: index,
        createdAt: new Date().toISOString(),
      })
    })
  })
}

// -------------------------------------------------------------------- menus

export function listMenus(restaurantId?: string): Menu[] {
  const menus = getDatabase().menus
  const rows = restaurantId ? menus.filter((m) => m.restaurantId === restaurantId) : menus
  return [...rows].sort(
    (a, b) => Number(b.recommended) - Number(a.recommended) || a.name.localeCompare(b.name, 'th'),
  )
}

export function getMenu(id: string): Menu | null {
  return getDatabase().menus.find((menu) => menu.id === id) ?? null
}

export type MenuInput = Omit<Menu, 'id' | 'createdAt'>

export function createMenu(input: MenuInput): Menu {
  return mutate((db) => {
    const menu: Menu = { ...input, id: uid('menu'), createdAt: new Date().toISOString() }
    db.menus.push(menu)
    return menu
  })
}

export function updateMenu(id: string, input: Partial<MenuInput>) {
  mutate((db) => {
    const menu = db.menus.find((m) => m.id === id)
    if (menu) Object.assign(menu, input)
  })
}

export function deleteMenu(id: string) {
  mutate((db) => {
    db.menus = db.menus.filter((m) => m.id !== id)
  })
}

// ------------------------------------------------------------------ reviews

export function listReviews(restaurantId?: string): Review[] {
  const reviews = getDatabase().reviews
  const rows = restaurantId ? reviews.filter((r) => r.restaurantId === restaurantId) : reviews
  return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export type ReviewInput = Omit<Review, 'id' | 'createdAt'>

export function createReview(input: ReviewInput): Review {
  return mutate((db) => {
    const review: Review = { ...input, id: uid('rev'), createdAt: new Date().toISOString() }
    db.reviews.push(review)
    return review
  })
}

export function deleteReview(id: string) {
  mutate((db) => {
    db.reviews = db.reviews.filter((r) => r.id !== id)
  })
}

// ------------------------------------------------------------- team members

export type TeamMemberInput = Omit<TeamMember, 'id' | 'createdAt'>

export function listTeamMembers(): TeamMember[] {
  return [...(getDatabase().teamMembers || [])].sort((a, b) => a.sortOrder - b.sortOrder)
}

export function createTeamMember(input: TeamMemberInput): TeamMember {
  return mutate((db) => {
    if (!db.teamMembers) db.teamMembers = []
    const member: TeamMember = {
      ...input,
      id: uid('member'),
      createdAt: new Date().toISOString(),
    }
    db.teamMembers.push(member)
    return member
  })
}

export function updateTeamMember(id: string, input: Partial<TeamMemberInput>) {
  mutate((db) => {
    if (!db.teamMembers) db.teamMembers = []
    const member = db.teamMembers.find((m) => m.id === id)
    if (member) Object.assign(member, input)
  })
}

export function deleteTeamMember(id: string) {
  mutate((db) => {
    if (!db.teamMembers) db.teamMembers = []
    db.teamMembers = db.teamMembers.filter((m) => m.id !== id)
  })
}

// --------------------------------------------------------------- joined views

export function toView(restaurant: Restaurant, db: Database = getDatabase()): RestaurantView {
  const reviews = db.reviews
    .filter((review) => review.restaurantId === restaurant.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const ratingAvg = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : restaurant.rating

  return {
    ...restaurant,
    category: db.categories.find((c) => c.id === restaurant.categoryId) ?? null,
    images: db.restaurantImages
      .filter((image) => image.restaurantId === restaurant.id)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    menus: db.menus
      .filter((menu) => menu.restaurantId === restaurant.id)
      .sort(
        (a, b) =>
          Number(b.recommended) - Number(a.recommended) || a.name.localeCompare(b.name, 'th'),
      ),
    reviews,
    reviewCount: reviews.length,
    ratingAvg: Math.round(ratingAvg * 10) / 10,
  }
}

export function listRestaurantViews(): RestaurantView[] {
  const db = getDatabase()
  return listRestaurants().map((restaurant) => toView(restaurant, db))
}

export function getRestaurantView(idOrSlug: string): RestaurantView | null {
  const restaurant = getRestaurant(idOrSlug)
  return restaurant ? toView(restaurant) : null
}

// ------------------------------------------------------------------- admin

export interface DashboardStats {
  restaurants: number
  categories: number
  menus: number
  openNow: number
  reviews: number
  images: number
}

export function getStats(isOpenNow: (restaurant: Restaurant) => boolean): DashboardStats {
  const db = getDatabase()
  return {
    restaurants: db.restaurants.length,
    categories: db.categories.length,
    menus: db.menus.length,
    openNow: db.restaurants.filter(isOpenNow).length,
    reviews: db.reviews.length,
    images: db.restaurantImages.length,
  }
}

export function getStorageUsage() {
  // UTF-16 in storage, but Blob size is the honest byte count of the payload.
  const bytes = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? new Blob([raw]).size : 0
    } catch {
      return 0
    }
  })()
  return {
    bytes,
    quota: STORAGE_QUOTA_BYTES,
    percent: Math.min(100, Math.round((bytes / STORAGE_QUOTA_BYTES) * 100)),
  }
}

export function exportDatabase(): string {
  return JSON.stringify(getDatabase(), null, 2)
}

export function importDatabase(json: string) {
  const parsed = normalise(JSON.parse(json))
  // Never let an import lock the admin out of their own dashboard.
  if (!parsed.users.length) parsed.users = getDatabase().users
  replaceDatabase(parsed)
}

/** Put the demo content back, keeping the current admin accounts. */
export function resetToSeed() {
  replaceDatabase(seedDatabase(structuredClone(getDatabase().users)))
}

/** Wipe every restaurant, menu, image and review but keep the accounts. */
export function clearContent() {
  replaceDatabase({ ...emptyDatabase(), users: structuredClone(getDatabase().users) })
}
