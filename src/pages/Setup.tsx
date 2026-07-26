import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { calcBMR, calcTDEE, calcCalorieGoal, calcMacros, calcWaterGoal } from '../utils/calculations'
import { db } from '../db/database'
import type { UserProfile, DietGoal, ActivityLevel, Gender } from '../types'

const STEPS = ['基本資料', '體態目標', '飲食習慣', '確認設定']

const DIET_GOALS: { value: DietGoal; label: string; desc: string }[] = [
  { value: 'lose', label: '減脂', desc: '每日赤字約 500 kcal' },
  { value: 'maintain', label: '維持體態', desc: '維持現在體重' },
  { value: 'muscle', label: '增加肌肉', desc: '每日盈餘約 300 kcal' },
  { value: 'gain', label: '增加體重', desc: '每日盈餘約 500 kcal' },
  { value: 'healthy', label: '健康飲食', desc: '養成均衡飲食習慣' },
]

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentary', label: '久坐，幾乎沒有運動' },
  { value: 'light', label: '輕度活動（每週 1–2 次）' },
  { value: 'moderate', label: '中度活動（每週 3–4 次）' },
  { value: 'active', label: '高度活動（每週 5 次以上）' },
  { value: 'very_active', label: '工作活動量很高' },
]

interface FormData {
  nickname: string
  birthYear: number
  gender: Gender
  height: number
  weight: number
  goalWeight: number
  activityLevel: ActivityLevel
  dietGoal: DietGoal
  waterGoal: number
}

export default function Setup() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>({
    nickname: '',
    birthYear: 1995,
    gender: 'prefer_not',
    height: 165,
    weight: 65,
    goalWeight: 60,
    activityLevel: 'sedentary',
    dietGoal: 'healthy',
    waterGoal: 2000,
  })
  const [saving, setSaving] = useState(false)

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function calcGoals() {
    const bmr = calcBMR(form)
    const tdee = calcTDEE(bmr, form.activityLevel)
    const calories = calcCalorieGoal(tdee, form.dietGoal)
    const macros = calcMacros(calories, form.dietGoal, form.weight)
    const water = calcWaterGoal(form.weight)
    return { bmr, tdee, calories, ...macros, water }
  }

  const goals = calcGoals()
  const [overrides, setOverrides] = useState<Partial<typeof goals>>({})
  const final = { ...goals, ...overrides }

  async function handleSave() {
    setSaving(true)
    const profile: UserProfile = {
      nickname: form.nickname || '朋友',
      birthYear: form.birthYear,
      gender: form.gender,
      height: form.height,
      weight: form.weight,
      goalWeight: form.goalWeight,
      activityLevel: form.activityLevel,
      dietGoal: form.dietGoal,
      dailyCalorieGoal: final.calories,
      proteinGoal: final.protein,
      carbGoal: final.carb,
      fatGoal: final.fat,
      waterGoal: final.water,
      allergies: [],
      avoidFoods: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await db.userProfile.add(profile)
    // Force full reload so App.tsx re-checks isFirstTime() with updated DB
    window.location.replace(import.meta.env.BASE_URL || '/')
  }

  const canNext = [
    form.nickname.trim().length > 0 && form.height > 0 && form.weight > 0,
    true,
    true,
    true,
  ][step]

  return (
    <div className="min-h-dvh bg-[#f5f0e8] flex flex-col max-w-lg mx-auto">
      {/* Progress */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-[#4caf7d]' : 'bg-[#e8e0d4]'}`} />
          ))}
        </div>
        <p className="text-[#8a8a8a] text-sm">{step + 1} / {STEPS.length}</p>
        <h1 className="text-2xl font-bold text-[#2d2d2d] mt-1">{STEPS[step]}</h1>
      </div>

      <div className="flex-1 px-5 scrollable">
        {step === 0 && (
          <div className="space-y-4">
            <Field label="你的暱稱">
              <input
                className="w-full border border-[#e8e0d4] rounded-2xl px-4 py-3 text-base bg-white outline-none focus:border-[#4caf7d]"
                placeholder="怎麼稱呼你？"
                value={form.nickname}
                onChange={e => set('nickname', e.target.value)}
              />
            </Field>
            <Field label="出生年份">
              <input
                type="number" inputMode="numeric"
                className="w-full border border-[#e8e0d4] rounded-2xl px-4 py-3 text-base bg-white outline-none focus:border-[#4caf7d]"
                value={form.birthYear}
                onChange={e => set('birthYear', +e.target.value)}
              />
            </Field>
            <Field label="生理性別">
              <div className="grid grid-cols-2 gap-2">
                {[['male', '男'], ['female', '女'], ['other', '其他'], ['prefer_not', '不透露']] .map(([v, l]) => (
                  <button key={v}
                    className={`py-3 rounded-2xl border text-sm font-medium transition-all ${form.gender === v ? 'bg-[#4caf7d] text-white border-[#4caf7d]' : 'bg-white text-[#2d2d2d] border-[#e8e0d4]'}`}
                    onClick={() => set('gender', v as Gender)}
                  >{l}</button>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="身高（cm）">
                <input type="number" inputMode="decimal"
                  className="w-full border border-[#e8e0d4] rounded-2xl px-4 py-3 text-base bg-white outline-none focus:border-[#4caf7d]"
                  value={form.height} onChange={e => set('height', +e.target.value)} />
              </Field>
              <Field label="目前體重（kg）">
                <input type="number" inputMode="decimal"
                  className="w-full border border-[#e8e0d4] rounded-2xl px-4 py-3 text-base bg-white outline-none focus:border-[#4caf7d]"
                  value={form.weight} onChange={e => set('weight', +e.target.value)} />
              </Field>
            </div>
            <Field label="目標體重（kg）">
              <input type="number" inputMode="decimal"
                className="w-full border border-[#e8e0d4] rounded-2xl px-4 py-3 text-base bg-white outline-none focus:border-[#4caf7d]"
                value={form.goalWeight} onChange={e => set('goalWeight', +e.target.value)} />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="text-[#8a8a8a] text-sm mb-4">選擇你的主要飲食目標</p>
            {DIET_GOALS.map(({ value, label, desc }) => (
              <button key={value}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${form.dietGoal === value ? 'border-[#4caf7d] bg-[#e8f5ed]' : 'border-[#e8e0d4] bg-white'}`}
                onClick={() => set('dietGoal', value)}
              >
                <div className="font-semibold text-[#2d2d2d]">{label}</div>
                <div className="text-sm text-[#8a8a8a] mt-0.5">{desc}</div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-[#8a8a8a] text-sm mb-4">選擇你平均的日常活動量</p>
            {ACTIVITY_LEVELS.map(({ value, label }) => (
              <button key={value}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${form.activityLevel === value ? 'border-[#4caf7d] bg-[#e8f5ed]' : 'border-[#e8e0d4] bg-white'}`}
                onClick={() => set('activityLevel', value)}
              >
                <span className="font-medium text-[#2d2d2d] text-sm">{label}</span>
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-4 space-y-3">
              <div className="text-sm font-semibold text-[#8a8a8a]">系統計算建議值</div>
              <div className="text-xs text-[#aaa]">BMR {Math.round(goals.bmr)} kcal · TDEE {goals.tdee} kcal</div>
              {[
                { key: 'calories', label: '每日熱量目標', unit: 'kcal' },
                { key: 'protein', label: '蛋白質目標', unit: 'g' },
                { key: 'carb', label: '碳水目標', unit: 'g' },
                { key: 'fat', label: '脂肪目標', unit: 'g' },
                { key: 'water', label: '每日飲水目標', unit: 'ml' },
              ].map(({ key, label, unit }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-[#2d2d2d]">{label}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number" inputMode="numeric"
                      className="w-20 border border-[#e8e0d4] rounded-xl px-2 py-1.5 text-sm text-right bg-[#f5f0e8] outline-none focus:border-[#4caf7d]"
                      value={(overrides as Record<string, number>)[key] ?? (goals as Record<string, number>)[key]}
                      onChange={e => setOverrides(o => ({ ...o, [key]: +e.target.value }))}
                    />
                    <span className="text-xs text-[#8a8a8a]">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-[#fff0e6] rounded-2xl p-4 text-xs text-[#8a8a8a] leading-relaxed">
              以上為一般估算值，不是醫療診斷。若有疾病、懷孕、飲食障礙或特殊健康需求，請諮詢專業人員。
            </div>
            <div className="bg-[#e6f0fb] rounded-2xl p-4 text-xs text-[#8a8a8a] leading-relaxed">
              你的資料目前只保存在這台裝置中。更換裝置或清除瀏覽器資料前，請先到「我的」頁面匯出備份。
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-6 space-y-3">
        <Button fullWidth size="lg" onClick={() => {
          if (step < STEPS.length - 1) setStep(s => s + 1)
          else handleSave()
        }} disabled={!canNext || saving}>
          {step < STEPS.length - 1 ? '繼續' : (saving ? '儲存中…' : '開始使用')}
        </Button>
        {step > 0 && (
          <Button fullWidth variant="ghost" onClick={() => setStep(s => s - 1)}>返回</Button>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#2d2d2d] mb-2">{label}</label>
      {children}
    </div>
  )
}
