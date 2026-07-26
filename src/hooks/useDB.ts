import { useState, useEffect, useCallback } from 'react'
import { db } from '../db/database'
import { SEED_FOODS } from '../data/foods'
import type { UserProfile, Meal, MealItem, WaterLog, WeightLog, Food } from '../types'

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const p = await db.userProfile.toCollection().first()
    setProfile(p ?? null)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const save = useCallback(async (p: UserProfile) => {
    if (p.id) await db.userProfile.put(p)
    else await db.userProfile.add(p)
    setProfile(p)
  }, [])

  return { profile, loading, reload: load, save }
}

export function useFoods() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    async function init() {
      // Use explicit IDs + bulkPut (upsert) so StrictMode double-run is safe
      const seedsWithId = SEED_FOODS.map((f, i) => ({ ...f, id: i + 1 }))
      await db.foods.bulkPut(seedsWithId as Food[])
      if (!active) return
      const all = await db.foods.toArray()
      setFoods(all)
      setLoaded(true)
    }
    init()
    return () => { active = false }
  }, [])

  const addCustomFood = useCallback(async (food: Omit<Food, 'id'>) => {
    const id = await db.foods.add({ ...food, isCustom: true, createdAt: Date.now() })
    const newFood = await db.foods.get(id)
    if (newFood) setFoods(prev => [...prev, newFood])
    return id
  }, [])

  return { foods, loaded, addCustomFood }
}

export function useDailyMeals(date: string) {
  const [meals, setMeals] = useState<(Meal & { items: MealItem[] })[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const ms = await db.meals.where('date').equals(date).toArray()
    const withItems = await Promise.all(
      ms.map(async m => ({
        ...m,
        items: await db.mealItems.where('mealId').equals(m.id!).toArray(),
      }))
    )
    withItems.sort((a, b) => a.createdAt - b.createdAt)
    setMeals(withItems)
    setLoading(false)
  }, [date])

  useEffect(() => { load() }, [load])

  const addMeal = useCallback(async (meal: Omit<Meal, 'id'>, items: Omit<MealItem, 'id' | 'mealId'>[]) => {
    const mealId = await db.meals.add(meal as Meal)
    const mealItems = items.map(item => ({ ...item, mealId } as MealItem))
    await db.mealItems.bulkAdd(mealItems)
    await load()
    return mealId
  }, [load])

  const deleteMeal = useCallback(async (mealId: number) => {
    await db.mealItems.where('mealId').equals(mealId).delete()
    await db.meals.delete(mealId)
    await load()
  }, [load])

  const updateMeal = useCallback(async (meal: Meal, items: Omit<MealItem, 'id' | 'mealId'>[]) => {
    await db.meals.put(meal)
    await db.mealItems.where('mealId').equals(meal.id!).delete()
    await db.mealItems.bulkAdd(items.map(i => ({ ...i, mealId: meal.id! } as MealItem)))
    await load()
  }, [load])

  return { meals, loading, reload: load, addMeal, deleteMeal, updateMeal }
}

export function useWaterLogs(date: string) {
  const [logs, setLogs] = useState<WaterLog[]>([])

  const load = useCallback(async () => {
    const ls = await db.waterLogs.where('date').equals(date).toArray()
    setLogs(ls.sort((a, b) => a.createdAt - b.createdAt))
  }, [date])

  useEffect(() => { load() }, [load])

  const addLog = useCallback(async (log: Omit<WaterLog, 'id'>) => {
    await db.waterLogs.add(log as WaterLog)
    await load()
  }, [load])

  const deleteLog = useCallback(async (id: number) => {
    await db.waterLogs.delete(id)
    await load()
  }, [load])

  const total = logs.reduce((s, l) => s + l.amount, 0)

  return { logs, total, reload: load, addLog, deleteLog }
}

export function useWeightLogs() {
  const [logs, setLogs] = useState<WeightLog[]>([])

  useEffect(() => {
    db.weightLogs.orderBy('date').reverse().limit(90).toArray().then(setLogs)
  }, [])

  const addLog = useCallback(async (log: Omit<WeightLog, 'id'>) => {
    const existing = await db.weightLogs.where('date').equals(log.date).first()
    if (existing?.id) await db.weightLogs.put({ ...log, id: existing.id } as WeightLog)
    else await db.weightLogs.add(log as WeightLog)
    const all = await db.weightLogs.orderBy('date').reverse().limit(90).toArray()
    setLogs(all)
  }, [])

  const deleteLog = useCallback(async (id: number) => {
    await db.weightLogs.delete(id)
    const all = await db.weightLogs.orderBy('date').reverse().limit(90).toArray()
    setLogs(all)
  }, [])

  return { logs, addLog, deleteLog }
}
