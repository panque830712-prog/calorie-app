import { db } from '../db/database'
import { blobToBase64, base64ToBlob } from './imageUtils'
import type { UserProfile, Food, Meal, MealItem, WaterLog, WeightLog, FavoriteMeal, AppSettings } from '../types'

export async function exportBackup(includePhotos = true): Promise<void> {
  const [userProfile, foods, meals, mealItems, waterLogs, weightLogs, favoriteMeals, settings] =
    await Promise.all([
      db.userProfile.toArray(),
      db.foods.filter(f => f.isCustom === true).toArray(),
      db.meals.toArray(),
      db.mealItems.toArray(),
      db.waterLogs.toArray(),
      db.weightLogs.toArray(),
      db.favoriteMeals.toArray(),
      db.settings.toArray(),
    ])

  const mealsWithPhotos = await Promise.all(
    meals.map(async m => {
      if (includePhotos && m.photoBlob) {
        const photoBase64 = await blobToBase64(m.photoBlob)
        return { ...m, photoBlob: undefined, photoBase64 }
      }
      return { ...m, photoBlob: undefined }
    })
  )

  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    appName: '我的飲食紀錄',
    data: { userProfile, foods, meals: mealsWithPhotos, mealItems, waterLogs, weightLogs, favoriteMeals, settings },
  }

  downloadJSON(backup, `calorie-backup-${new Date().toISOString().slice(0, 10)}.json`)
}

export async function importBackup(file: File): Promise<{ preview: Record<string, number>; data: Record<string, unknown[]> }> {
  const text = await file.text()
  let parsed: Record<string, unknown>
  try { parsed = JSON.parse(text) } catch { throw new Error('檔案格式錯誤，請選擇正確的備份 JSON 檔') }

  if (!parsed.version || !parsed.data) throw new Error('備份檔格式不正確')
  if ((parsed.version as number) > 1) throw new Error('備份檔版本過新，請更新 App 後再試')

  const data = parsed.data as Record<string, unknown[]>
  const preview: Record<string, number> = {
    userProfile: data.userProfile?.length ?? 0,
    foods: data.foods?.length ?? 0,
    meals: data.meals?.length ?? 0,
    mealItems: data.mealItems?.length ?? 0,
    waterLogs: data.waterLogs?.length ?? 0,
    weightLogs: data.weightLogs?.length ?? 0,
  }
  return { preview, data }
}

export async function restoreBackup(data: Record<string, unknown[]>): Promise<void> {
  await db.transaction('rw',
    [db.userProfile, db.foods, db.meals, db.mealItems, db.waterLogs, db.weightLogs, db.favoriteMeals, db.settings],
    async () => {
      if (data.userProfile?.length) {
        await db.userProfile.clear()
        await db.userProfile.bulkAdd(data.userProfile as UserProfile[])
      }
      if (data.foods?.length) {
        await db.foods.filter(f => f.isCustom === true).delete()
        await db.foods.bulkPut(data.foods as Food[])
      }
      if (data.meals?.length) {
        await db.meals.clear()
        const mealsWithBlob = (data.meals as Array<Record<string, unknown>>).map(m => {
          if (m.photoBase64) {
            return { ...m, photoBlob: base64ToBlob(m.photoBase64 as string), photoBase64: undefined }
          }
          return m
        })
        await db.meals.bulkAdd(mealsWithBlob as unknown as Meal[])
      }
      if (data.mealItems?.length) {
        await db.mealItems.clear()
        await db.mealItems.bulkAdd(data.mealItems as MealItem[])
      }
      if (data.waterLogs?.length) {
        await db.waterLogs.clear()
        await db.waterLogs.bulkAdd(data.waterLogs as WaterLog[])
      }
      if (data.weightLogs?.length) {
        await db.weightLogs.clear()
        await db.weightLogs.bulkAdd(data.weightLogs as WeightLog[])
      }
    }
  )
}

export async function exportCSV(): Promise<void> {
  const [meals, waterLogs, weightLogs] = await Promise.all([
    db.meals.toArray(),
    db.waterLogs.toArray(),
    db.weightLogs.toArray(),
  ])

  downloadCSV(meals.map(m => ({
    date: m.date, type: m.mealType,
    calories: m.totalCalories, protein: m.totalProtein,
    carb: m.totalCarb, fat: m.totalFat,
  })), `meals-${today()}.csv`)

  downloadCSV(waterLogs.map(w => ({ date: w.date, amount: w.amount, type: w.type })), `water-${today()}.csv`)

  downloadCSV(weightLogs.map(w => ({
    date: w.date, weight: w.weight,
    bodyFat: w.bodyFat ?? '', waist: w.waist ?? '',
  })), `weight-${today()}.csv`)
}

function today() { return new Date().toISOString().slice(0, 10) }

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  triggerDownload(blob, filename)
}

function downloadCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const lines = [headers.join(','), ...rows.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  triggerDownload(blob, filename)
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export type { FavoriteMeal, AppSettings }
