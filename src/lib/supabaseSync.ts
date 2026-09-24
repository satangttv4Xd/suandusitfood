import { supabase, isSupabaseConfigured } from './supabase'
import type {
  Category,
  Database,
  Menu,
  Restaurant,
  RestaurantImage,
  Review,
  TeamMember,
} from './types'

// ----------------------------------------------------------- mappers: snake <-> camel

export function mapCategoryFromDb(row: any): Category {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    slug: String(row.slug || ''),
    description: String(row.description || ''),
    icon: String(row.icon || 'utensils'),
    image: String(row.image || ''),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: String(row.created_at || new Date().toISOString()),
  }
}

export function mapCategoryToDb(c: Category): Record<string, any> {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    icon: c.icon,
    image: c.image,
    sort_order: c.sortOrder,
    created_at: c.createdAt,
  }
}

export function mapRestaurantFromDb(row: any): Restaurant {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    slug: String(row.slug || ''),
    coverImage: String(row.cover_image || ''),
    description: String(row.description || ''),
    categoryId: String(row.category_id || ''),
    priceMin: Number(row.price_min ?? 0),
    priceAvg: Number(row.price_avg ?? 0),
    rating: Number(row.rating ?? 0),
    openTime: String(row.open_time || '08:00'),
    closeTime: String(row.close_time || '17:00'),
    openDays: Array.isArray(row.open_days) ? row.open_days : [],
    phone: String(row.phone || ''),
    facebook: String(row.facebook || ''),
    instagram: String(row.instagram || ''),
    website: String(row.website || ''),
    address: String(row.address || ''),
    lat: row.lat != null ? Number(row.lat) : null,
    lng: row.lng != null ? Number(row.lng) : null,
    mapUrl: String(row.map_url || ''),
    status: row.status === 'closed' ? 'closed' : 'open',
    featured: Boolean(row.featured),
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  }
}

export function mapRestaurantToDb(r: Restaurant): Record<string, any> {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    cover_image: r.coverImage,
    description: r.description,
    category_id: r.categoryId || null,
    price_min: r.priceMin,
    price_avg: r.priceAvg,
    rating: r.rating,
    open_time: r.openTime,
    close_time: r.closeTime,
    open_days: r.openDays,
    phone: r.phone,
    facebook: r.facebook,
    instagram: r.instagram,
    website: r.website,
    address: r.address,
    lat: r.lat,
    lng: r.lng,
    map_url: r.mapUrl,
    status: r.status,
    featured: r.featured,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
  }
}

export function mapRestaurantImageFromDb(row: any): RestaurantImage {
  return {
    id: String(row.id),
    restaurantId: String(row.restaurant_id || ''),
    url: String(row.url || ''),
    caption: String(row.caption || ''),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: String(row.created_at || new Date().toISOString()),
  }
}

export function mapRestaurantImageToDb(img: RestaurantImage): Record<string, any> {
  return {
    id: img.id,
    restaurant_id: img.restaurantId,
    url: img.url,
    caption: img.caption,
    sort_order: img.sortOrder,
    created_at: img.createdAt,
  }
}

export function mapMenuFromDb(row: any): Menu {
  return {
    id: String(row.id),
    restaurantId: String(row.restaurant_id || ''),
    name: String(row.name || ''),
    price: Number(row.price ?? 0),
    description: String(row.description || ''),
    image: String(row.image || ''),
    recommended: Boolean(row.recommended),
    createdAt: String(row.created_at || new Date().toISOString()),
  }
}

export function mapMenuToDb(m: Menu): Record<string, any> {
  return {
    id: m.id,
    restaurant_id: m.restaurantId,
    name: m.name,
    price: m.price,
    description: m.description,
    image: m.image,
    recommended: m.recommended,
    created_at: m.createdAt,
  }
}

export function mapReviewFromDb(row: any): Review {
  return {
    id: String(row.id),
    restaurantId: String(row.restaurant_id || ''),
    author: String(row.author || ''),
    rating: Number(row.rating ?? 5),
    comment: String(row.comment || ''),
    createdAt: String(row.created_at || new Date().toISOString()),
  }
}

export function mapReviewToDb(rev: Review): Record<string, any> {
  return {
    id: rev.id,
    restaurant_id: rev.restaurantId,
    author: rev.author,
    rating: rev.rating,
    comment: rev.comment,
    created_at: rev.createdAt,
  }
}

export function mapTeamMemberFromDb(row: any): TeamMember {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    studentId: String(row.student_id || ''),
    role: String(row.role || ''),
    faculty: String(row.faculty || ''),
    major: String(row.major || ''),
    image: String(row.image || ''),
    bio: String(row.bio || ''),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: String(row.created_at || new Date().toISOString()),
  }
}

export function mapTeamMemberToDb(m: TeamMember): Record<string, any> {
  return {
    id: m.id,
    name: m.name,
    student_id: m.studentId,
    role: m.role,
    faculty: m.faculty,
    major: m.major,
    image: m.image,
    bio: m.bio,
    sort_order: m.sortOrder,
    created_at: m.createdAt,
  }
}

// ----------------------------------------------------------- fetch all from Supabase

export async function fetchDatabaseFromSupabase(): Promise<Partial<Database> | null> {
  if (!isSupabaseConfigured() || !supabase) return null

  try {
    const [cats, rests, imgs, menus, revs, teams] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('restaurants').select('*'),
      supabase.from('restaurant_images').select('*').order('sort_order', { ascending: true }),
      supabase.from('menus').select('*'),
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('team_members').select('*').order('sort_order', { ascending: true }),
    ])

    // If any fundamental table had a fatal error (e.g. table not created yet), return null
    if (cats.error && cats.error.code === '42P01') {
      console.warn('[Supabase] Tables not found yet. Please run database/supabase_schema.sql in Supabase SQL editor.')
      return null
    }

    const result: Partial<Database> = {}

    if (cats.data) result.categories = cats.data.map(mapCategoryFromDb)
    if (rests.data) result.restaurants = rests.data.map(mapRestaurantFromDb)
    if (imgs.data) result.restaurantImages = imgs.data.map(mapRestaurantImageFromDb)
    if (menus.data) result.menus = menus.data.map(mapMenuFromDb)
    if (revs.data) result.reviews = revs.data.map(mapReviewFromDb)
    if (teams.data) result.teamMembers = teams.data.map(mapTeamMemberFromDb)

    return result
  } catch (err) {
    console.error('[Supabase] Failed to fetch data:', err)
    return null
  }
}

// ----------------------------------------------------------- asynchronous writers

export async function syncSaveTeamMember(member: TeamMember) {
  if (!supabase) return
  try {
    await supabase.from('team_members').upsert(mapTeamMemberToDb(member))
  } catch (err) {
    console.error('[Supabase] syncSaveTeamMember error:', err)
  }
}

export async function syncDeleteTeamMember(id: string) {
  if (!supabase) return
  try {
    await supabase.from('team_members').delete().eq('id', id)
  } catch (err) {
    console.error('[Supabase] syncDeleteTeamMember error:', err)
  }
}

export async function syncSaveRestaurant(restaurant: Restaurant) {
  if (!supabase) return
  try {
    await supabase.from('restaurants').upsert(mapRestaurantToDb(restaurant))
  } catch (err) {
    console.error('[Supabase] syncSaveRestaurant error:', err)
  }
}

export async function syncDeleteRestaurant(id: string) {
  if (!supabase) return
  try {
    await supabase.from('restaurants').delete().eq('id', id)
  } catch (err) {
    console.error('[Supabase] syncDeleteRestaurant error:', err)
  }
}

export async function syncSaveCategory(category: Category) {
  if (!supabase) return
  try {
    await supabase.from('categories').upsert(mapCategoryToDb(category))
  } catch (err) {
    console.error('[Supabase] syncSaveCategory error:', err)
  }
}

export async function syncDeleteCategory(id: string) {
  if (!supabase) return
  try {
    await supabase.from('categories').delete().eq('id', id)
  } catch (err) {
    console.error('[Supabase] syncDeleteCategory error:', err)
  }
}

export async function syncSaveMenu(menu: Menu) {
  if (!supabase) return
  try {
    await supabase.from('menus').upsert(mapMenuToDb(menu))
  } catch (err) {
    console.error('[Supabase] syncSaveMenu error:', err)
  }
}

export async function syncDeleteMenu(id: string) {
  if (!supabase) return
  try {
    await supabase.from('menus').delete().eq('id', id)
  } catch (err) {
    console.error('[Supabase] syncDeleteMenu error:', err)
  }
}

export async function syncSaveReview(review: Review) {
  if (!supabase) return
  try {
    await supabase.from('reviews').upsert(mapReviewToDb(review))
  } catch (err) {
    console.error('[Supabase] syncSaveReview error:', err)
  }
}

export async function syncDeleteReview(id: string) {
  if (!supabase) return
  try {
    await supabase.from('reviews').delete().eq('id', id)
  } catch (err) {
    console.error('[Supabase] syncDeleteReview error:', err)
  }
}
