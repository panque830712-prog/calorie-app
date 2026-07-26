import { useState, useEffect } from 'react'
import { format, subDays, addDays } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { useDailyMeals, useWaterLogs, useUserProfile } from '../hooks/useDB'
import { useDailyStats } from '../hooks/useDailyStats'
import { db } from '../db/database'

const MEAL_LABELS: Record<string, string> = {
  breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '點心',
}

export default function Records() {
  const [viewDate, setViewDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [tab, setTab] = useState<'day' | '7d' | '30d'>('day')
  const { profile } = useUserProfile()
  const { meals } = useDailyMeals(viewDate)
  const { logs: waterLogs, total: waterTotal } = useWaterLogs(viewDate)
  const stats = useDailyStats(meals, waterLogs)
  const [trendData, setTrendData] = useState<{ date: string; calories: number; protein: number; water: number }[]>([])

  const days = tab === '7d' ? 7 : 30
  const displayDate = format(new Date(viewDate + 'T00:00'), 'M月d日 EEEE', { locale: zhTW })

  useEffect(() => {
    if (tab === 'day') return
    async function loadTrend() {
      const today = new Date()
      const dates = Array.from({ length: days }, (_, i) => format(subDays(today, days - 1 - i), 'yyyy-MM-dd'))
      const rows = await Promise.all(dates.map(async date => {
        const ms = await db.meals.where('date').equals(date).toArray()
        const ws = await db.waterLogs.where('date').equals(date).toArray()
        const calories = ms.reduce((s, m) => s + m.totalCalories, 0)
        const protein = ms.reduce((s, m) => s + m.totalProtein, 0)
        const water = ws.reduce((s, w) => s + w.amount, 0)
        return { date, calories, protein, water }
      }))
      setTrendData(rows)
    }
    loadTrend()
  }, [tab, days])

  const calGoal = profile?.dailyCalorieGoal ?? 2000
  const wGoal = profile?.waterGoal ?? 2000

  return (
    <Layout>
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-[#2d2d2d] mb-4">紀錄</h1>

        {/* Tab */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 mb-4 shadow-sm">
          {([['day', '日'], ['7d', '7天'], ['30d', '30天']] as const).map(([t, l]) => (
            <button key={t}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all touch-manipulation ${tab === t ? 'bg-[#4caf7d] text-white' : 'text-[#8a8a8a]'}`}
              onClick={() => setTab(t)}
            >{l}</button>
          ))}
        </div>

        {tab === 'day' && (
          <>
            {/* Date nav */}
            <div className="flex items-center justify-between mb-4">
              <button className="p-2 rounded-full bg-white shadow-sm touch-manipulation" onClick={() => setViewDate(d => format(subDays(new Date(d + 'T00:00'), 1), 'yyyy-MM-dd'))}>
                <ChevronLeft size={20} className="text-[#2d2d2d]" />
              </button>
              <span className="font-medium text-[#2d2d2d]">{displayDate}</span>
              <button
                className="p-2 rounded-full bg-white shadow-sm touch-manipulation disabled:opacity-30"
                disabled={viewDate >= format(new Date(), 'yyyy-MM-dd')}
                onClick={() => setViewDate(d => format(addDays(new Date(d + 'T00:00'), 1), 'yyyy-MM-dd'))}
              >
                <ChevronRight size={20} className="text-[#2d2d2d]" />
              </button>
            </div>

            <Card className="mb-4">
              <div className="grid grid-cols-2 gap-3">
                <StatBox label="熱量" val={`${stats.totalCalories}`} sub={`/ ${calGoal} kcal`} color="#f5873c" />
                <StatBox label="蛋白質" val={`${Math.round(stats.totalProtein)}g`} sub={`/ ${profile?.proteinGoal ?? '-'}g`} color="#4a90d9" />
                <StatBox label="飲水" val={`${waterTotal}ml`} sub={`/ ${wGoal}ml`} color="#4a90d9" />
                <StatBox label="碳水" val={`${Math.round(stats.totalCarb)}g`} sub={`/ ${profile?.carbGoal ?? '-'}g`} color="#f5873c" />
              </div>
            </Card>

            {meals.length === 0 ? (
              <div className="text-center py-12 text-[#8a8a8a] text-sm">這一天還沒有紀錄</div>
            ) : (
              <div className="space-y-3">
                {meals.map(meal => (
                  <Card key={meal.id} padding={false}>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#4caf7d]">{MEAL_LABELS[meal.mealType]}</span>
                        <span className="text-xs text-[#8a8a8a]">{format(new Date(meal.createdAt), 'HH:mm')}</span>
                      </div>
                      <div className="text-sm text-[#2d2d2d]">{meal.totalCalories} kcal</div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {(tab === '7d' || tab === '30d') && (
          <TrendView data={trendData} calGoal={calGoal} wGoal={wGoal} days={days} />
        )}
      </div>
    </Layout>
  )
}

function StatBox({ label, val, sub, color }: { label: string; val: string; sub: string; color: string }) {
  return (
    <div className="bg-[#f5f0e8] rounded-2xl p-3">
      <div className="text-xs text-[#8a8a8a] mb-1">{label}</div>
      <div className="font-bold text-[#2d2d2d]" style={{ color }}>{val}</div>
      <div className="text-xs text-[#8a8a8a]">{sub}</div>
    </div>
  )
}

function TrendView({ data, calGoal, wGoal, days }: {
  data: { date: string; calories: number; protein: number; water: number }[]
  calGoal: number
  wGoal: number
  days: number
}) {
  const maxCal = Math.max(calGoal * 1.2, ...data.map(d => d.calories))
  const avgCal = data.length ? Math.round(data.reduce((s, d) => s + d.calories, 0) / data.length) : 0
  const avgProtein = data.length ? Math.round(data.reduce((s, d) => s + d.protein, 0) / data.length) : 0
  const waterHit = data.filter(d => d.water >= wGoal).length
  const recordDays = data.filter(d => d.calories > 0).length

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatBox label="平均熱量" val={`${avgCal}`} sub={`kcal / ${days}天`} color="#f5873c" />
          <StatBox label="平均蛋白質" val={`${avgProtein}g`} sub="每日平均" color="#4a90d9" />
          <StatBox label="飲水達標" val={`${waterHit}天`} sub={`共 ${days} 天`} color="#4a90d9" />
          <StatBox label="有記錄天數" val={`${recordDays}天`} sub={`共 ${days} 天`} color="#4caf7d" />
        </div>
      </Card>

      {/* Calorie chart */}
      <Card>
        <h3 className="text-sm font-semibold text-[#2d2d2d] mb-4">每日熱量</h3>
        <div className="flex items-end gap-1 h-32">
          {data.map((d, i) => {
            const h = maxCal > 0 ? Math.round((d.calories / maxCal) * 100) : 0
            const isOver = d.calories > calGoal
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end relative h-full">
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{ height: `${h}%`, backgroundColor: isOver ? '#f5873c' : '#4caf7d', opacity: d.calories > 0 ? 1 : 0.15 }}
                />
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-[#8a8a8a] mt-2">
          <span>{data[0]?.date.slice(5)}</span>
          <span className="text-[#4caf7d]">目標 {calGoal} kcal</span>
          <span>{data[data.length - 1]?.date.slice(5)}</span>
        </div>
      </Card>

      {/* Water chart */}
      <Card>
        <h3 className="text-sm font-semibold text-[#2d2d2d] mb-4">每日飲水</h3>
        <div className="flex items-end gap-1 h-20">
          {data.map((d, i) => {
            const h = wGoal > 0 ? Math.min(Math.round((d.water / wGoal) * 100), 100) : 0
            return (
              <div key={i} className="flex-1 h-full flex flex-col justify-end">
                <div className="w-full rounded-t-sm bg-[#4a90d9]" style={{ height: `${h}%`, opacity: d.water > 0 ? 1 : 0.1 }} />
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
