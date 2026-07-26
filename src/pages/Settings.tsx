import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useUserProfile } from '../hooks/useDB'
import { calcBMR, calcTDEE, calcCalorieGoal, calcMacros, calcWaterGoal } from '../utils/calculations'
import type { UserProfile, ActivityLevel, DietGoal } from '../types'

export default function Settings() {
  const navigate = useNavigate()
  const { profile, save } = useUserProfile()
  const [form, setForm] = useState<Partial<UserProfile>>(profile ?? {})
  const [saved, setSaved] = useState(false)

  if (!profile) return null

  function set<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    const updated: UserProfile = { ...profile, ...form as UserProfile, updatedAt: Date.now() }
    await save(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function recalcGoals() {
    if (!form.weight || !form.height || !form.birthYear || !form.gender) return
    const bmr = calcBMR(form as UserProfile)
    const tdee = calcTDEE(bmr, (form.activityLevel ?? profile!.activityLevel) as ActivityLevel)
    const calories = calcCalorieGoal(tdee, (form.dietGoal ?? profile!.dietGoal) as DietGoal)
    const macros = calcMacros(calories, (form.dietGoal ?? profile!.dietGoal) as DietGoal, form.weight)
    const water = calcWaterGoal(form.weight)
    setForm(prev => ({ ...prev, dailyCalorieGoal: calories, ...macros, waterGoal: water }))
  }

  const f = { ...profile, ...form }

  return (
    <Layout hideNav>
      <div className="px-4 pt-12 pb-8 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white shadow-sm touch-manipulation">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-[#2d2d2d]">個人設定</h1>
        </div>

        <Card>
          <h2 className="font-semibold text-[#2d2d2d] mb-3">基本資料</h2>
          <div className="space-y-3">
            <Field label="暱稱">
              <input className="input" value={f.nickname ?? ''} onChange={e => set('nickname', e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="身高 cm">
                <input type="number" inputMode="decimal" className="input" value={f.height ?? ''} onChange={e => set('height', +e.target.value)} />
              </Field>
              <Field label="體重 kg">
                <input type="number" inputMode="decimal" className="input" value={f.weight ?? ''} onChange={e => set('weight', +e.target.value)} />
              </Field>
            </div>
            <Field label="目標體重 kg">
              <input type="number" inputMode="decimal" className="input" value={f.goalWeight ?? ''} onChange={e => set('goalWeight', +e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="font-semibold text-[#2d2d2d] mb-3">每日目標</h2>
          <div className="space-y-3">
            {([
              ['dailyCalorieGoal', '熱量目標 kcal'],
              ['proteinGoal', '蛋白質 g'],
              ['carbGoal', '碳水 g'],
              ['fatGoal', '脂肪 g'],
              ['waterGoal', '飲水目標 ml'],
            ] as const).map(([key, label]) => (
              <Field key={key} label={label}>
                <input type="number" inputMode="numeric" className="input"
                  value={(f as unknown as Record<string, number>)[key] ?? ''}
                  onChange={e => set(key, +e.target.value)} />
              </Field>
            ))}
          </div>
          <button
            className="mt-3 text-sm text-[#4caf7d] touch-manipulation"
            onClick={recalcGoals}
          >根據身高體重重新計算建議值</button>
        </Card>

        {saved && (
          <div className="bg-[#e8f5ed] rounded-2xl p-3 text-center text-sm text-[#2d6a4f]">
            已儲存！
          </div>
        )}
        <Button fullWidth size="lg" onClick={handleSave}>儲存設定</Button>
      </div>

      <style>{`.input { width: 100%; border: 1px solid #e8e0d4; border-radius: 1rem; padding: 0.75rem 1rem; font-size: 1rem; background: white; outline: none; } .input:focus { border-color: #4caf7d; }`}</style>
    </Layout>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-[#8a8a8a] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
