export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type DietGoal = 'lose' | 'maintain' | 'muscle' | 'gain' | 'healthy' | 'custom'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Gender = 'male' | 'female' | 'other' | 'prefer_not'
export type WaterType = 'water' | 'unsweetened_tea' | 'black_coffee' | 'milk' | 'soymilk' | 'sweetened' | 'custom'
export type RecognitionMode = 'off' | 'basic' | 'advanced'

export interface UserProfile {
  id?: number
  nickname: string
  birthYear: number
  gender: Gender
  height: number
  weight: number
  goalWeight: number
  activityLevel: ActivityLevel
  dietGoal: DietGoal
  dailyCalorieGoal: number
  proteinGoal: number
  carbGoal: number
  fatGoal: number
  waterGoal: number
  allergies: string[]
  avoidFoods: string[]
  createdAt: number
  updatedAt: number
}

export interface Food {
  id?: number
  name: string
  category: string
  per100gCalories: number
  per100gProtein: number
  per100gCarb: number
  per100gFat: number
  per100gSugar: number
  per100gFiber: number
  per100gSodium: number
  servingSizes: ServingSize[]
  source: string
  isEstimate: boolean
  isCustom: boolean
  createdAt?: number
}

export interface ServingSize {
  label: string
  unit: string
  grams: number
}

export interface MealItem {
  id?: number
  mealId: number
  foodId: number | null
  foodName: string
  amount: number
  unit: string
  grams: number
  calories: number
  protein: number
  carb: number
  fat: number
  sugar: number
  fiber: number
  sodium: number
  isCustom: boolean
  cookingNote?: string
}

export interface Meal {
  id?: number
  date: string
  mealType: MealType
  photoBlob?: Blob
  photoThumbnail?: string
  totalCalories: number
  totalProtein: number
  totalCarb: number
  totalFat: number
  note?: string
  createdAt: number
  items?: MealItem[]
}

export interface WaterLog {
  id?: number
  date: string
  amount: number
  type: WaterType
  note?: string
  createdAt: number
}

export interface WeightLog {
  id?: number
  date: string
  weight: number
  bodyFat?: number
  waist?: number
  note?: string
  createdAt: number
}

export interface FavoriteMeal {
  id?: number
  name: string
  items: Omit<MealItem, 'id' | 'mealId'>[]
  lastUsedAt: number
}

export interface AppSettings {
  key: string
  value: string | number | boolean
}

export interface DailyStats {
  date?: string
  totalCalories: number
  totalProtein: number
  totalCarb: number
  totalFat: number
  totalWater: number
  mealCount: number
}
