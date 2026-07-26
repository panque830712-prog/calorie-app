import type { UserProfile, DailyStats } from '../types'

interface Suggestion {
  text: string
  type: 'info' | 'good' | 'warn'
}

export function generateSuggestions(
  stats: DailyStats,
  profile: UserProfile,
  hour = new Date().getHours()
): Suggestion[] {
  const results: Suggestion[] = []
  const { totalCalories, totalProtein, totalWater } = stats
  const { dailyCalorieGoal, proteinGoal, waterGoal } = profile

  const calorieRatio = totalCalories / dailyCalorieGoal
  const remainCal = dailyCalorieGoal - totalCalories
  const remainProtein = proteinGoal - totalProtein
  const remainWater = waterGoal - totalWater

  // 熱量狀態
  if (calorieRatio < 0.5 && hour >= 14) {
    results.push({ type: 'warn', text: `今天熱量只吃了 ${totalCalories} kcal，記得補充均衡的食物，不要讓身體進入飢餓模式喔。` })
  } else if (calorieRatio >= 0.85 && calorieRatio <= 1.05) {
    results.push({ type: 'good', text: `今天熱量已接近目標，剩餘約 ${Math.max(0, remainCal)} kcal，晚餐可以選擇蛋白質和蔬菜，主食份量稍微減少。` })
  } else if (calorieRatio > 1.1) {
    results.push({ type: 'info', text: `今天熱量已超出目標約 ${Math.abs(remainCal)} kcal，不用太擔心，明天均衡飲食就好。` })
  }

  // 蛋白質
  if (remainProtein > 30 && hour >= 10) {
    const needed = Math.round(remainProtein)
    results.push({ type: 'info', text: `今天蛋白質還差約 ${needed}g，下一餐可以補充雞胸肉、魚、蛋、豆腐或無糖豆漿。` })
  } else if (totalProtein >= proteinGoal) {
    results.push({ type: 'good', text: `今天蛋白質已達標！保持這樣的飲食習慣很棒。` })
  }

  // 飲水
  if (remainWater > 800 && hour >= 12) {
    const ml = Math.round(remainWater)
    results.push({ type: 'warn', text: `今天飲水量還差約 ${ml}ml，可以分成幾次慢慢補充，不用一次喝完。` })
  } else if (totalWater >= waterGoal) {
    results.push({ type: 'good', text: `今天飲水目標達成！補水做得很好。` })
  }

  // 均衡提示
  if (results.length === 0 && calorieRatio >= 0.7 && calorieRatio <= 1.05) {
    results.push({ type: 'good', text: `今天整體吃得很均衡，照正常份量進食即可，不需要刻意挨餓。` })
  }

  if (stats.mealCount === 0 && hour >= 12) {
    results.push({ type: 'info', text: `今天還沒有記錄任何餐點，記得拍照記錄喔！` })
  }

  return results.slice(0, 3)
}
