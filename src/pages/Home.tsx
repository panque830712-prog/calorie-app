import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Plus, Droplets, Scale, ChevronRight, Trash2, Copy, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { ProgressRing } from '../components/ui/ProgressRing'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { useUserProfile, useDailyMeals, useWaterLogs } from '../hooks/useDB'
import { useDailyStats } from '../hooks/useDailyStats'
import { generateSuggestions } from '../utils/suggestions'
import { db } from '../db/database'
import type { Meal, MealItem, WaterLog } from '../types'

const MEAL_LABELS: Record<string, string> = {
  breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '點心',
}
const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack']

const WATER_PRESETS = [150, 250, 350, 500]

export default function Home() {
  const navigate = useNavigate()
  const today = format(new Date(), 'yyyy-MM-dd')
  const displayDate = format(new Date(), 'M月d日 EEEE', { locale: zhTW })

  const { profile } = useUserProfile()
  const { meals, reload: reloadMeals, deleteMeal } = useDailyMeals(today)
  const { logs: waterLogs, total: waterTotal, addLog: addWater, deleteLog: deleteWater } = useWaterLogs(today)
  const stats = useDailyStats(meals, waterLogs)
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({})
  const [waterModal, setWaterModal] = useState(false)
  const [weightModal, setWeightModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [weightInput, setWeightInput] = useState('')

  useEffect(() => {
    const urls: Record<number, string> = {}
    const revoke: string[] = []
    meals.forEach(m => {
      if (m.photoBlob) {
        const url = URL.createObjectURL(m.photoBlob)
        urls[m.id!] = url
        revoke.push(url)
      }
    })
    setPhotoUrls(urls)
    return () => revoke.forEach(u => URL.revokeObjectURL(u))
  }, [meals])

  const calGoal = profile?.dailyCalorieGoal ?? 2000
  const proteinGoal = profile?.proteinGoal ?? 50
  const carbGoal = profile?.carbGoal ?? 250
  const fatGoal = profile?.fatGoal ?? 65
  const wGoal = profile?.waterGoal ?? 2000

  const remaining = calGoal - stats.totalCalories
  const suggestions = profile ? generateSuggestions(stats, profile) : []

  const grouped = MEAL_ORDER.map(type => ({
    type, label: MEAL_LABELS[type],
    meals: meals.filter(m => m.mealType === type),
  }))

  async function handleAddWater(ml: number) {
    await addWater({
      date: today, amount: ml, type: 'water',
      createdAt: Date.now(),
    })
  }

  async function handleSaveWeight() {
    const w = parseFloat(weightInput)
    if (isNaN(w)) return
    await db.weightLogs.add({
      date: today, weight: w, createdAt: Date.now(),
    })
    setWeightModal(false)
    setWeightInput('')
  }

  async function handleCopyMeal(meal: Meal & { items: MealItem[] }) {
    const newMeal = {
      ...meal, id: undefined, date: today,
      createdAt: Date.now(),
    }
    const mealId = await db.meals.add(newMeal as Meal)
    await db.mealItems.bulkAdd(meal.items.map(i => ({ ...i, id: undefined, mealId } as MealItem)))
    await reloadMeals()
  }

  return (
    <Layout>
      <div className="px-4 pt-12 pb-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[#8a8a8a] text-sm">{displayDate}</p>
            <h1 className="text-2xl font-bold text-[#2d2d2d]">
              {profile?.nickname ?? '你好'} 👋
            </h1>
          </div>
        </div>

        {/* Calorie summary */}
        <Card>
          <div className="flex items-center gap-4">
            <ProgressRing
              value={stats.totalCalories} max={calGoal}
              color={remaining < 0 ? '#f5873c' : '#4caf7d'}
              label={stats.totalCalories.toString()}
              sublabel="kcal"
            />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#8a8a8a]">目標</span>
                <span className="font-medium">{calGoal} kcal</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-[#8a8a8a]">{remaining >= 0 ? '剩餘' : '超出'}</span>
                <span className={`font-bold ${remaining < 0 ? 'text-[#f5873c]' : 'text-[#4caf7d]'}`}>
                  {Math.abs(remaining)} kcal
                </span>
              </div>
              {/* Macro bars */}
              {[
                { label: '蛋白質', val: stats.totalProtein, goal: proteinGoal, color: '#4a90d9', unit: 'g' },
                { label: '碳水', val: stats.totalCarb, goal: carbGoal, color: '#f5873c', unit: 'g' },
                { label: '脂肪', val: stats.totalFat, goal: fatGoal, color: '#9c6fe4', unit: 'g' },
              ].map(({ label, val, goal, color, unit }) => (
                <div key={label} className="mb-1.5">
                  <div className="flex justify-between text-xs text-[#8a8a8a] mb-0.5">
                    <span>{label}</span>
                    <span>{Math.round(val)}/{goal}{unit}</span>
                  </div>
                  <div className="h-1.5 bg-[#f0ebe2] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(val / goal * 100, 100)}%`, backgroundColor: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Water bar */}
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Droplets size={18} className="text-[#4a90d9]" />
            <span className="font-medium text-[#2d2d2d]">飲水</span>
            <span className="ml-auto text-[#4a90d9] font-bold">{waterTotal} / {wGoal} ml</span>
          </div>
          <div className="h-2 bg-[#e6f0fb] rounded-full overflow-hidden mb-3">
            <div className="h-full bg-[#4a90d9] rounded-full transition-all" style={{ width: `${Math.min(waterTotal / wGoal * 100, 100)}%` }} />
          </div>
          <div className="flex gap-2">
            {WATER_PRESETS.map(ml => (
              <button key={ml}
                className="flex-1 py-2 rounded-xl bg-[#e6f0fb] text-[#4a90d9] text-xs font-medium active:bg-[#4a90d9] active:text-white transition-colors touch-manipulation"
                onClick={() => handleAddWater(ml)}
              >+{ml}ml</button>
            ))}
            <button
              className="px-3 py-2 rounded-xl bg-[#e6f0fb] text-[#4a90d9] text-xs font-medium active:bg-[#4a90d9] active:text-white transition-colors touch-manipulation"
              onClick={() => setWaterModal(true)}
            >其他</button>
          </div>
        </Card>

        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-3">
          <button
            className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm active:bg-[#f5f0e8] touch-manipulation"
            onClick={() => navigate('/add-meal')}
          >
            <div className="w-12 h-12 bg-[#4caf7d] rounded-full flex items-center justify-center">
              <Camera size={22} className="text-white" />
            </div>
            <span className="text-xs text-[#2d2d2d] font-medium">拍照記錄</span>
          </button>
          <button
            className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm active:bg-[#f5f0e8] touch-manipulation"
            onClick={() => setWaterModal(true)}
          >
            <div className="w-12 h-12 bg-[#4a90d9] rounded-full flex items-center justify-center">
              <Droplets size={22} className="text-white" />
            </div>
            <span className="text-xs text-[#2d2d2d] font-medium">記錄飲水</span>
          </button>
          <button
            className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm active:bg-[#f5f0e8] touch-manipulation"
            onClick={() => setWeightModal(true)}
          >
            <div className="w-12 h-12 bg-[#9c6fe4] rounded-full flex items-center justify-center">
              <Scale size={22} className="text-white" />
            </div>
            <span className="text-xs text-[#2d2d2d] font-medium">記錄體重</span>
          </button>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <div key={i} className={`rounded-2xl p-4 text-sm ${
                s.type === 'good' ? 'bg-[#e8f5ed] text-[#2d6a4f]' :
                s.type === 'warn' ? 'bg-[#fff0e6] text-[#7c4a1e]' :
                'bg-[#e6f0fb] text-[#1a3c5e]'
              }`}>
                {s.text}
              </div>
            ))}
          </div>
        )}

        {/* Meal groups */}
        {grouped.map(({ type, label, meals: ms }) => (
          <div key={type}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-[#2d2d2d]">{label}</h2>
              <button
                className="text-xs text-[#4caf7d] flex items-center gap-1 touch-manipulation"
                onClick={() => navigate(`/add-meal?type=${type}`)}
              >
                <Plus size={14} /> 新增
              </button>
            </div>
            {ms.length === 0 ? (
              <button
                className="w-full bg-white rounded-2xl border-2 border-dashed border-[#e8e0d4] py-5 flex flex-col items-center gap-2 text-[#8a8a8a] active:border-[#4caf7d] transition-colors touch-manipulation"
                onClick={() => navigate(`/add-meal?type=${type}`)}
              >
                <Camera size={24} />
                <span className="text-sm">拍照或新增{label}</span>
              </button>
            ) : (
              <div className="space-y-2">
                {ms.map(meal => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    photoUrl={photoUrls[meal.id!]}
                    onDelete={() => setDeleteTarget(meal.id!)}
                    onCopy={() => handleCopyMeal(meal)}
                    onEdit={() => navigate(`/add-meal?edit=${meal.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="h-4" />
      </div>

      {/* Water modal */}
      <Modal open={waterModal} onClose={() => setWaterModal(false)} title="記錄飲水">
        <WaterModal
          onAdd={async (ml, type) => {
            const log: Omit<WaterLog, 'id'> = { date: today, amount: ml, type, createdAt: Date.now() }
            await addWater(log)
            setWaterModal(false)
          }}
          logs={waterLogs}
          onDelete={deleteWater}
        />
      </Modal>

      {/* Weight modal */}
      <Modal open={weightModal} onClose={() => setWeightModal(false)} title="記錄體重">
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-[#8a8a8a] mb-2">今天體重（kg）</label>
            <input
              type="number" inputMode="decimal"
              className="w-full border border-[#e8e0d4] rounded-2xl px-4 py-3 text-lg text-center bg-white outline-none focus:border-[#4caf7d]"
              placeholder="例：65.5"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              autoFocus
            />
          </div>
          <Button fullWidth onClick={handleSaveWeight} disabled={!weightInput}>儲存</Button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="確認刪除">
        <div className="p-5 space-y-4">
          <p className="text-[#2d2d2d]">確定要刪除這筆餐點紀錄嗎？</p>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setDeleteTarget(null)}>取消</Button>
            <Button variant="danger" fullWidth onClick={async () => {
              if (deleteTarget) await deleteMeal(deleteTarget)
              setDeleteTarget(null)
            }}>刪除</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}

function MealCard({ meal, photoUrl, onDelete, onCopy, onEdit }: {
  meal: Meal & { items: MealItem[] }
  photoUrl?: string
  onDelete: () => void
  onCopy: () => void
  onEdit: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const time = format(new Date(meal.createdAt), 'HH:mm')

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button className="w-full text-left flex gap-3 p-3 active:bg-[#f5f0e8] touch-manipulation" onClick={onEdit}>
        {photoUrl ? (
          <img src={photoUrl} alt="餐點" className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
        ) : (
          <div className="w-20 h-20 bg-[#f5f0e8] rounded-xl flex-shrink-0 flex items-center justify-center">
            <Camera size={24} className="text-[#e8e0d4]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <Clock size={12} className="text-[#8a8a8a]" />
            <span className="text-xs text-[#8a8a8a]">{time}</span>
          </div>
          <div className="text-sm text-[#2d2d2d] font-medium truncate">
            {meal.items.map(i => i.foodName).join('、') || '餐點'}
          </div>
          <div className="flex gap-3 mt-1.5 flex-wrap">
            <Macro label="熱量" val={meal.totalCalories} unit="kcal" color="text-[#f5873c]" />
            <Macro label="蛋白質" val={meal.totalProtein} unit="g" color="text-[#4a90d9]" />
            <Macro label="碳水" val={meal.totalCarb} unit="g" color="text-[#f5873c]" />
            <Macro label="脂肪" val={meal.totalFat} unit="g" color="text-[#9c6fe4]" />
          </div>
        </div>
        <ChevronRight size={16} className="text-[#e8e0d4] self-center flex-shrink-0" />
      </button>
      <div className="border-t border-[#f5f0e8] flex">
        <button className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs text-[#8a8a8a] active:bg-[#f5f0e8] touch-manipulation" onClick={onCopy}>
          <Copy size={13} /> 複製到今天
        </button>
        <div className="w-px bg-[#f5f0e8]" />
        <button className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs text-[#ef5350] active:bg-[#fff0f0] touch-manipulation" onClick={onDelete}>
          <Trash2 size={13} /> 刪除
        </button>
      </div>
      {menuOpen && <div onClick={() => setMenuOpen(false)} />}
    </div>
  )
}

function Macro({ label, val, unit, color }: { label: string; val: number; unit: string; color: string }) {
  return (
    <span className={`text-xs ${color}`}>
      {label} {Math.round(val)}{unit}
    </span>
  )
}

function WaterModal({ onAdd, logs, onDelete }: {
  onAdd: (ml: number, type: 'water' | 'unsweetened_tea' | 'black_coffee' | 'milk' | 'soymilk' | 'sweetened' | 'custom') => void
  logs: WaterLog[]
  onDelete: (id: number) => void
}) {
  const [amount, setAmount] = useState(250)
  const [type, setType] = useState<WaterLog['type']>('water')

  const types: { value: WaterLog['type']; label: string }[] = [
    { value: 'water', label: '白開水' },
    { value: 'unsweetened_tea', label: '無糖茶' },
    { value: 'black_coffee', label: '黑咖啡' },
    { value: 'milk', label: '牛奶' },
    { value: 'soymilk', label: '豆漿' },
    { value: 'sweetened', label: '有糖飲料' },
  ]

  return (
    <div className="p-5 space-y-4">
      <div>
        <label className="block text-sm text-[#8a8a8a] mb-2">飲品類型</label>
        <div className="flex flex-wrap gap-2">
          {types.map(t => (
            <button key={t.value}
              className={`px-3 py-1.5 rounded-xl text-sm border transition-all touch-manipulation ${type === t.value ? 'bg-[#4a90d9] text-white border-[#4a90d9]' : 'bg-white text-[#2d2d2d] border-[#e8e0d4]'}`}
              onClick={() => setType(t.value)}
            >{t.label}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm text-[#8a8a8a] mb-2">份量（ml）</label>
        <div className="flex gap-2 mb-3">
          {WATER_PRESETS.map(ml => (
            <button key={ml}
              className={`flex-1 py-2 rounded-xl text-sm border transition-all touch-manipulation ${amount === ml ? 'bg-[#4a90d9] text-white border-[#4a90d9]' : 'bg-white border-[#e8e0d4]'}`}
              onClick={() => setAmount(ml)}
            >{ml}</button>
          ))}
        </div>
        <input
          type="number" inputMode="numeric"
          className="w-full border border-[#e8e0d4] rounded-2xl px-4 py-3 text-base text-center bg-white outline-none focus:border-[#4a90d9]"
          value={amount}
          onChange={e => setAmount(+e.target.value)}
        />
      </div>
      <Button fullWidth onClick={() => onAdd(amount, type)}>新增 {amount}ml</Button>
      {logs.length > 0 && (
        <div>
          <p className="text-sm text-[#8a8a8a] mb-2">今日記錄</p>
          <div className="space-y-1">
            {logs.map(l => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-[#f5f0e8]">
                <span className="text-sm">{l.amount}ml {types.find(t => t.value === l.type)?.label}</span>
                <button className="text-[#ef5350] p-1 touch-manipulation" onClick={() => deleteWater(l.id!)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  function deleteWater(id: number) { onDelete(id) }
}
