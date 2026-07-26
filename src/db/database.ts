import Dexie, { type Table } from 'dexie'
import type { UserProfile, Food, Meal, MealItem, WaterLog, WeightLog, FavoriteMeal, AppSettings } from '../types'

class CalorieDB extends Dexie {
  userProfile!: Table<UserProfile>
  foods!: Table<Food>
  meals!: Table<Meal>
  mealItems!: Table<MealItem>
  waterLogs!: Table<WaterLog>
  weightLogs!: Table<WeightLog>
  favoriteMeals!: Table<FavoriteMeal>
  settings!: Table<AppSettings>

  constructor() {
    super('CalorieAppDB')
    this.version(1).stores({
      userProfile: '++id',
      foods: '++id, name, category, isCustom',
      meals: '++id, date, mealType, createdAt',
      mealItems: '++id, mealId, foodId',
      waterLogs: '++id, date, createdAt',
      weightLogs: '++id, date, createdAt',
      favoriteMeals: '++id, name, lastUsedAt',
      settings: 'key',
    })
  }
}

export const db = new CalorieDB()

export async function requestPersistentStorage() {
  if (navigator.storage?.persist) {
    const granted = await navigator.storage.persist()
    return granted
  }
  return false
}

export async function getStorageEstimate() {
  if (navigator.storage?.estimate) {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate()
    return { usage, quota, usageMB: (usage / 1024 / 1024).toFixed(1) }
  }
  return { usage: 0, quota: 0, usageMB: '0' }
}

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const row = await db.settings.get(key)
  if (row === undefined) return defaultValue
  return row.value as T
}

export async function setSetting(key: string, value: string | number | boolean) {
  await db.settings.put({ key, value })
}

export async function isFirstTime(): Promise<boolean> {
  const count = await db.userProfile.count()
  return count === 0
}
