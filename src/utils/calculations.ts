import type { UserProfile, ActivityLevel, DietGoal } from '../types'

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export function calcBMR(profile: Pick<UserProfile, 'gender' | 'weight' | 'height' | 'birthYear'>): number {
  const age = new Date().getFullYear() - profile.birthYear
  // Mifflin-St Jeor
  if (profile.gender === 'male') {
    return 10 * profile.weight + 6.25 * profile.height - 5 * age + 5
  }
  // female / other / prefer_not → use female formula
  return 10 * profile.weight + 6.25 * profile.height - 5 * age - 161
}

export function calcTDEE(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity])
}

export function calcCalorieGoal(tdee: number, goal: DietGoal): number {
  switch (goal) {
    case 'lose': return Math.max(1200, Math.round(tdee - 500))
    case 'muscle': return Math.round(tdee + 300)
    case 'gain': return Math.round(tdee + 500)
    case 'maintain':
    case 'healthy':
    default: return tdee
  }
}

export function calcMacros(calories: number, goal: DietGoal, weight: number) {
  let proteinRatio: number, fatRatio: number
  switch (goal) {
    case 'lose':
      proteinRatio = 0.35; fatRatio = 0.25; break
    case 'muscle':
      proteinRatio = 0.30; fatRatio = 0.25; break
    default:
      proteinRatio = 0.25; fatRatio = 0.30; break
  }
  // carbRatio is implicit: calories after protein+fat
  const protein = Math.max(Math.round(weight * 1.6), Math.round((calories * proteinRatio) / 4))
  const fat = Math.round((calories * fatRatio) / 9)
  const carb = Math.round((calories - protein * 4 - fat * 9) / 4)
  return { protein, fat, carb }
}

export function calcWaterGoal(weight: number): number {
  return Math.round(weight * 35)
}

export function calcNutrition(per100g: {
  calories: number; protein: number; carb: number; fat: number
  sugar: number; fiber: number; sodium: number
}, grams: number) {
  const ratio = grams / 100
  return {
    calories: Math.round(per100g.calories * ratio),
    protein: Math.round(per100g.protein * ratio * 10) / 10,
    carb: Math.round(per100g.carb * ratio * 10) / 10,
    fat: Math.round(per100g.fat * ratio * 10) / 10,
    sugar: Math.round(per100g.sugar * ratio * 10) / 10,
    fiber: Math.round(per100g.fiber * ratio * 10) / 10,
    sodium: Math.round(per100g.sodium * ratio),
  }
}

export function formatCalories(kcal: number): string {
  return kcal.toLocaleString()
}

export function getCalorieStatus(current: number, goal: number): 'under' | 'near' | 'over' {
  const ratio = current / goal
  if (ratio < 0.7) return 'under'
  if (ratio > 1.05) return 'over'
  return 'near'
}
