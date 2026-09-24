import type { Database } from './types'
import realData from './userRealData.json'

/**
 * Real production content provided from user's backup.
 *
 * All 5 team members, restaurants, menus, gallery images, and categories
 * are loaded directly from the user's real project data.
 */

export const seedCategories: Database['categories'] = realData.categories as unknown as Database['categories']
export const seedRestaurants: Database['restaurants'] = realData.restaurants as unknown as Database['restaurants']
export const seedImages: Database['restaurantImages'] = realData.restaurantImages as unknown as Database['restaurantImages']
export const seedMenus: Database['menus'] = realData.menus as unknown as Database['menus']
export const seedReviews: Database['reviews'] = realData.reviews as unknown as Database['reviews']
export const seedTeamMembers: Database['teamMembers'] = realData.teamMembers as unknown as Database['teamMembers']
