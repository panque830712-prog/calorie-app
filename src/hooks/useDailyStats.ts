import { useMemo } from 'react'
import type { Meal, MealItem, WaterLog } from '../types'

export function useDailyStats(
  meals: (Meal & { items: MealItem[] })[],
  waterLogs: WaterLog[],
) {
  return useMemo(() => {
    const totalCalories = meals.reduce((s, m) => s + m.totalCalories, 0)
    const totalProtein = meals.reduce((s, m) => s + m.totalProtein, 0)
    const totalCarb = meals.reduce((s, m) => s + m.totalCarb, 0)
    const totalFat = meals.reduce((s, m) => s + m.totalFat, 0)
    const totalWater = waterLogs.reduce((s, l) => s + l.amount, 0)
    return { totalCalories, totalProtein, totalCarb, totalFat, totalWater, mealCount: meals.length }
  }, [meals, waterLogs])
}
