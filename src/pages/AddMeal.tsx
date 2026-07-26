import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Camera, Image, X, Plus, Trash2, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { compressImage, createThumbnail } from '../utils/imageUtils'
import { calcNutrition } from '../utils/calculations'
import { useFoods, useDailyMeals } from '../hooks/useDB'
import { searchFoods, FOOD_CATEGORIES, OIL_OPTIONS } from '../data/foods'
import type { Food, MealType, MealItem, Meal, ServingSize } from '../types'

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '點心',
}

interface TempItem extends Omit<MealItem, 'id' | 'mealId'> {
  _key: string
}

export default function AddMeal() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const defaultType = (params.get('type') as MealType) ?? 'lunch'
  const today = format(new Date(), 'yyyy-MM-dd')

  const { foods, addCustomFood } = useFoods()
  const { addMeal } = useDailyMeals(today)

  const [mealType, setMealType] = useState<MealType>(defaultType)
  const [photo, setPhoto] = useState<Blob | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [items, setItems] = useState<TempItem[]>([])
  const [note, setNote] = useState('')
  const [foodModal, setFoodModal] = useState(false)
  const [oilModal, setOilModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (photo) {
      const url = URL.createObjectURL(photo)
      setPhotoUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPhotoUrl(null)
  }, [photo])

  async function handleFile(file: File) {
    setErr(null)
    try {
      if (file.size > 20 * 1024 * 1024) throw new Error('照片太大，請選擇 20MB 以下的照片')
      const compressed = await compressImage(file, 1024, 0.75)
      setPhoto(compressed)
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  function addItem(food: Food, serving: ServingSize) {
    const n = calcNutrition(
      { calories: food.per100gCalories, protein: food.per100gProtein, carb: food.per100gCarb, fat: food.per100gFat, sugar: food.per100gSugar, fiber: food.per100gFiber, sodium: food.per100gSodium },
      serving.grams
    )
    const item: TempItem = {
      _key: Math.random().toString(36).slice(2),
      foodId: food.id ?? null, foodName: food.name,
      amount: serving.grams === 100 ? 1 : 1,
      unit: serving.unit, grams: serving.grams,
      ...n, isCustom: food.isCustom, cookingNote: '',
    }
    setItems(prev => [...prev, item])
    setFoodModal(false)
  }

  function removeItem(key: string) {
    setItems(prev => prev.filter(i => i._key !== key))
  }

  function updateGrams(key: string, grams: number) {
    setItems(prev => prev.map(item => {
      if (item._key !== key) return item
      const food = foods.find(f => f.id === item.foodId)
      if (!food) return { ...item, grams }
      const n = calcNutrition(
        { calories: food.per100gCalories, protein: food.per100gProtein, carb: food.per100gCarb, fat: food.per100gFat, sugar: food.per100gSugar, fiber: food.per100gFiber, sodium: food.per100gSodium },
        grams
      )
      return { ...item, grams, ...n }
    }))
  }

  function addOil(grams: number) {
    if (grams === 0) { setOilModal(false); return }
    const oilFood = foods.find(f => f.name === '沙拉油（炒菜用油）')
    if (oilFood) {
      const n = calcNutrition(
        { calories: oilFood.per100gCalories, protein: 0, carb: 0, fat: 100, sugar: 0, fiber: 0, sodium: 0 },
        grams
      )
      setItems(prev => [...prev, {
        _key: Math.random().toString(36).slice(2),
        foodId: oilFood.id ?? null, foodName: '額外用油',
        amount: grams, unit: 'g', grams, ...n, isCustom: false,
      }])
    }
    setOilModal(false)
  }

  const totals = items.reduce((acc, i) => ({
    calories: acc.calories + i.calories,
    protein: acc.protein + i.protein,
    carb: acc.carb + i.carb,
    fat: acc.fat + i.fat,
  }), { calories: 0, protein: 0, carb: 0, fat: 0 })

  async function handleSave() {
    if (items.length === 0) { setErr('請至少新增一項食物'); return }
    setSaving(true)
    try {
      let thumbnail: string | undefined
      if (photo) thumbnail = await createThumbnail(photo)
      const meal: Omit<Meal, 'id'> = {
        date: today, mealType,
        photoBlob: photo ?? undefined,
        photoThumbnail: thumbnail,
        totalCalories: Math.round(totals.calories),
        totalProtein: Math.round(totals.protein * 10) / 10,
        totalCarb: Math.round(totals.carb * 10) / 10,
        totalFat: Math.round(totals.fat * 10) / 10,
        note, createdAt: Date.now(),
      }
      await addMeal(meal, items as unknown as Omit<MealItem, 'id' | 'mealId'>[])
      navigate('/')
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#f5f0e8] flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white shadow-sm touch-manipulation">
          <X size={20} className="text-[#2d2d2d]" />
        </button>
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm">
          {(Object.keys(MEAL_LABELS) as MealType[]).map(t => (
            <button key={t}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all touch-manipulation ${mealType === t ? 'bg-[#4caf7d] text-white' : 'text-[#8a8a8a]'}`}
              onClick={() => setMealType(t)}
            >{MEAL_LABELS[t]}</button>
          ))}
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-4 space-y-4 scrollable overflow-y-auto pb-32">
        {/* Photo section */}
        <div>
          {photoUrl ? (
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
              <img src={photoUrl} alt="餐點" className="w-full h-full object-cover" />
              <button
                className="absolute top-3 right-3 bg-black/50 rounded-full p-2 touch-manipulation"
                onClick={() => { setPhoto(null); setPhotoUrl(null) }}
              >
                <X size={16} className="text-white" />
              </button>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <button
                  className="bg-white/80 backdrop-blur rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1 touch-manipulation"
                  onClick={() => cameraRef.current?.click()}
                >
                  <Camera size={14} /> 重拍
                </button>
                <button
                  className="bg-white/80 backdrop-blur rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1 touch-manipulation"
                  onClick={() => fileRef.current?.click()}
                >
                  <Image size={14} /> 換圖
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-[#e8e0d4] bg-white aspect-[4/3] flex flex-col items-center justify-center gap-4">
              <div className="text-[#8a8a8a] text-sm font-medium">拍照記錄這一餐</div>
              <div className="flex gap-3">
                <button
                  className="flex flex-col items-center gap-2 px-6 py-4 bg-[#4caf7d] rounded-2xl text-white touch-manipulation active:bg-[#3d9a6a]"
                  onClick={() => cameraRef.current?.click()}
                >
                  <Camera size={28} />
                  <span className="text-xs font-medium">拍照</span>
                </button>
                <button
                  className="flex flex-col items-center gap-2 px-6 py-4 bg-white border border-[#e8e0d4] rounded-2xl text-[#2d2d2d] touch-manipulation active:bg-[#f5f0e8]"
                  onClick={() => fileRef.current?.click()}
                >
                  <Image size={28} className="text-[#8a8a8a]" />
                  <span className="text-xs font-medium text-[#8a8a8a]">相簿</span>
                </button>
              </div>
              <button
                className="text-xs text-[#8a8a8a] underline touch-manipulation"
                onClick={() => setFoodModal(true)}
              >跳過，直接選擇食物</button>
            </div>
          )}
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>

        {err && <div className="bg-red-50 rounded-2xl p-3 text-sm text-red-600">{err}</div>}

        {/* Food items */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#2d2d2d]">食物明細</h2>
            <button
              className="flex items-center gap-1 text-[#4caf7d] text-sm font-medium touch-manipulation"
              onClick={() => setFoodModal(true)}
            ><Plus size={16} /> 新增食物</button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-6 text-[#8a8a8a]">
              <p className="text-sm">尚未新增食物</p>
              <button className="mt-2 text-[#4caf7d] text-sm font-medium touch-manipulation" onClick={() => setFoodModal(true)}>
                點這裡搜尋食物
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <ItemRow key={item._key} item={item}
                  onDelete={() => removeItem(item._key)}
                  onGramsChange={g => updateGrams(item._key, g)}
                />
              ))}
            </div>
          )}

          {/* Oil option */}
          <button
            className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-[#e8e0d4] text-xs text-[#8a8a8a] flex items-center justify-center gap-2 touch-manipulation active:bg-[#f5f0e8]"
            onClick={() => setOilModal(true)}
          >
            <Plus size={14} /> 額外用油或醬料
          </button>
        </Card>

        {/* Totals */}
        {items.length > 0 && (
          <Card className="bg-[#e8f5ed]">
            <div className="text-sm font-semibold text-[#2d6a4f] mb-2">合計</div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: '熱量', val: Math.round(totals.calories), unit: 'kcal' },
                { label: '蛋白質', val: Math.round(totals.protein), unit: 'g' },
                { label: '碳水', val: Math.round(totals.carb), unit: 'g' },
                { label: '脂肪', val: Math.round(totals.fat), unit: 'g' },
              ].map(({ label, val, unit }) => (
                <div key={label}>
                  <div className="text-lg font-bold text-[#2d6a4f]">{val}</div>
                  <div className="text-xs text-[#4caf7d]">{unit}</div>
                  <div className="text-xs text-[#8a8a8a]">{label}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Note */}
        <Card>
          <textarea
            className="w-full text-sm text-[#2d2d2d] resize-none outline-none placeholder:text-[#c0b8ae]"
            rows={2}
            placeholder="備註（選填）：烹調方式、口感…"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </Card>
      </div>

      {/* Save */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-4 py-4 bg-[#f5f0e8]/90 backdrop-blur"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
        <Button fullWidth size="lg" onClick={handleSave} disabled={saving || items.length === 0}>
          {saving ? '儲存中…' : `儲存${MEAL_LABELS[mealType]}`}
        </Button>
      </div>

      {/* Food search modal */}
      <Modal open={foodModal} onClose={() => setFoodModal(false)} title="搜尋食物">
        <FoodSearchModal foods={foods} onSelect={addItem} onAddCustom={addCustomFood} />
      </Modal>

      {/* Oil modal */}
      <Modal open={oilModal} onClose={() => setOilModal(false)} title="額外用油">
        <div className="p-5 space-y-3">
          <p className="text-sm text-[#8a8a8a]">這餐是否有額外用油？</p>
          {OIL_OPTIONS.map(o => (
            <button key={o.label}
              className="w-full text-left px-4 py-3 bg-white rounded-2xl border border-[#e8e0d4] text-sm text-[#2d2d2d] active:bg-[#f5f0e8] touch-manipulation"
              onClick={() => addOil(o.grams)}
            >{o.label}</button>
          ))}
        </div>
      </Modal>
    </div>
  )
}

function ItemRow({ item, onDelete, onGramsChange }: {
  item: TempItem
  onDelete: () => void
  onGramsChange: (g: number) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#f0ebe2] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[#2d2d2d] truncate">{item.foodName}</div>
          <div className="text-xs text-[#8a8a8a]">{item.grams}g · {item.calories} kcal</div>
        </div>
        <button className="p-1.5 touch-manipulation" onClick={() => setOpen(o => !o)}>
          {open ? <ChevronUp size={16} className="text-[#8a8a8a]" /> : <ChevronDown size={16} className="text-[#8a8a8a]" />}
        </button>
        <button className="p-1.5 text-[#ef5350] touch-manipulation" onClick={onDelete}>
          <Trash2 size={16} />
        </button>
      </div>
      {open && (
        <div className="px-3 pb-3 border-t border-[#f5f0e8] pt-3 space-y-2">
          <div className="flex items-center gap-3">
            <label className="text-xs text-[#8a8a8a] w-12">克數</label>
            <input
              type="number" inputMode="decimal"
              className="flex-1 border border-[#e8e0d4] rounded-xl px-3 py-2 text-sm text-center bg-white outline-none focus:border-[#4caf7d]"
              value={item.grams}
              onChange={e => onGramsChange(+e.target.value)}
            />
            <span className="text-xs text-[#8a8a8a]">g</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div><span className="text-[#4a90d9] font-medium">{item.protein}g</span><br /><span className="text-[#8a8a8a]">蛋白質</span></div>
            <div><span className="text-[#f5873c] font-medium">{item.carb}g</span><br /><span className="text-[#8a8a8a]">碳水</span></div>
            <div><span className="text-[#9c6fe4] font-medium">{item.fat}g</span><br /><span className="text-[#8a8a8a]">脂肪</span></div>
          </div>
        </div>
      )}
    </div>
  )
}

function FoodSearchModal({ foods, onSelect, onAddCustom }: {
  foods: Food[]
  onSelect: (food: Food, serving: ServingSize) => void
  onAddCustom: (food: Omit<Food, 'id'>) => Promise<number>
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const results = useCallback(() => {
    let list = foods
    if (category) list = list.filter(f => f.category === category)
    if (query.trim()) list = searchFoods(query, list)
    else list = list.slice(0, 50)
    return list
  }, [foods, query, category])

  if (selectedFood) {
    return (
      <ServingPicker
        food={selectedFood}
        onSelect={serving => onSelect(selectedFood, serving)}
        onBack={() => setSelectedFood(null)}
      />
    )
  }

  if (showAddForm) {
    return (
      <AddCustomFoodForm
        initialName={query}
        onSave={async (food) => {
          const id = await onAddCustom(food)
          const newFood: Food = { ...food, id }
          onSelect(newFood, food.servingSizes[0])
        }}
        onBack={() => setShowAddForm(false)}
      />
    )
  }

  return (
    <div className="flex flex-col" style={{ height: '70dvh' }}>
      <div className="p-4 pb-2 flex-shrink-0">
        <div className="flex items-center gap-2 bg-[#f5f0e8] rounded-2xl px-3 py-2.5">
          <Search size={16} className="text-[#8a8a8a]" />
          <input
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#c0b8ae]"
            placeholder="搜尋食物名稱…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex gap-2 mt-2 overflow-x-auto scrollable py-1">
          <button
            className={`px-3 py-1.5 rounded-xl text-xs flex-shrink-0 border touch-manipulation ${!category ? 'bg-[#4caf7d] text-white border-[#4caf7d]' : 'bg-white border-[#e8e0d4] text-[#8a8a8a]'}`}
            onClick={() => setCategory(null)}
          >全部</button>
          {FOOD_CATEGORIES.map(c => (
            <button key={c}
              className={`px-3 py-1.5 rounded-xl text-xs flex-shrink-0 border touch-manipulation ${category === c ? 'bg-[#4caf7d] text-white border-[#4caf7d]' : 'bg-white border-[#e8e0d4] text-[#8a8a8a]'}`}
              onClick={() => setCategory(c === category ? null : c)}
            >{c}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollable px-4 pb-4">
        {results().map(food => (
          <button key={food.id ?? food.name}
            className="w-full flex items-center justify-between py-3.5 border-b border-[#f5f0e8] text-left touch-manipulation active:bg-[#f5f0e8] -mx-1 px-1 rounded-xl"
            onClick={() => setSelectedFood(food)}
          >
            <div>
              <div className="text-sm font-medium text-[#2d2d2d]">{food.name}</div>
              <div className="text-xs text-[#8a8a8a]">{food.per100gCalories} kcal / 100g · {food.category}</div>
            </div>
            <ChevronDown size={16} className="text-[#e8e0d4] -rotate-90" />
          </button>
        ))}
        <button
          className="w-full mt-3 py-3 rounded-2xl border border-dashed border-[#4caf7d] text-[#4caf7d] text-sm flex items-center justify-center gap-1 touch-manipulation active:bg-[#e8f5ed]"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={15} /> 找不到？自己新增食物
        </button>
      </div>
    </div>
  )
}

function AddCustomFoodForm({ initialName, onSave, onBack }: {
  initialName: string
  onSave: (food: Omit<Food, 'id'>) => Promise<void>
  onBack: () => void
}) {
  const [name, setName] = useState(initialName)
  const [category, setCategory] = useState('其他')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carb, setCarb] = useState('')
  const [fat, setFat] = useState('')
  const [servingG, setServingG] = useState('100')
  const [servingLabel, setServingLabel] = useState('一份')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const allCategories = [...FOOD_CATEGORIES, '其他']

  async function handleSave() {
    if (!name.trim()) { setErr('請輸入食物名稱'); return }
    if (!calories || +calories < 0) { setErr('請輸入每100g熱量'); return }
    setSaving(true)
    try {
      const food: Omit<Food, 'id'> = {
        name: name.trim(),
        category,
        per100gCalories: +calories,
        per100gProtein: +protein || 0,
        per100gCarb: +carb || 0,
        per100gFat: +fat || 0,
        per100gSugar: 0, per100gFiber: 0, per100gSodium: 0,
        servingSizes: [
          { label: servingLabel || '一份', unit: 'g', grams: +servingG || 100 },
          { label: '100克', unit: 'g', grams: 100 },
        ],
        source: '自行輸入', isEstimate: true, isCustom: true, createdAt: Date.now(),
      }
      await onSave(food)
    } catch {
      setErr('儲存失敗，請再試一次')
      setSaving(false)
    }
  }

  return (
    <div className="p-5 space-y-4" style={{ maxHeight: '70dvh', overflowY: 'auto' }}>
      <button className="text-sm text-[#4caf7d] flex items-center gap-1 touch-manipulation" onClick={onBack}>← 返回搜尋</button>
      <h3 className="font-semibold text-[#2d2d2d]">新增自訂食物</h3>
      <p className="text-xs text-[#8a8a8a]">填入每 100g 的營養資訊</p>

      {err && <div className="text-xs text-red-500 bg-red-50 rounded-xl p-2">{err}</div>}

      <div>
        <label className="text-xs text-[#8a8a8a] block mb-1">食物名稱 *</label>
        <input className="w-full border border-[#e8e0d4] rounded-2xl px-4 py-3 text-sm bg-white outline-none focus:border-[#4caf7d]"
          placeholder="例：自家料理、某品牌產品"
          value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div>
        <label className="text-xs text-[#8a8a8a] block mb-1">分類</label>
        <div className="flex flex-wrap gap-2">
          {allCategories.map(c => (
            <button key={c}
              className={`px-3 py-1.5 rounded-xl text-xs border touch-manipulation ${category === c ? 'bg-[#4caf7d] text-white border-[#4caf7d]' : 'bg-white border-[#e8e0d4] text-[#8a8a8a]'}`}
              onClick={() => setCategory(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#8a8a8a] block mb-1">熱量 kcal/100g *</label>
          <input type="number" inputMode="decimal" className="w-full border border-[#e8e0d4] rounded-2xl px-4 py-3 text-sm bg-white outline-none focus:border-[#4caf7d]"
            placeholder="0" value={calories} onChange={e => setCalories(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-[#8a8a8a] block mb-1">蛋白質 g/100g</label>
          <input type="number" inputMode="decimal" className="w-full border border-[#e8e0d4] rounded-2xl px-4 py-3 text-sm bg-white outline-none focus:border-[#4caf7d]"
            placeholder="0" value={protein} onChange={e => setProtein(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-[#8a8a8a] block mb-1">碳水 g/100g</label>
          <input type="number" inputMode="decimal" className="w-full border border-[#e8e0d4] rounded-2xl px-4 py-3 text-sm bg-white outline-none focus:border-[#4caf7d]"
            placeholder="0" value={carb} onChange={e => setCarb(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-[#8a8a8a] block mb-1">脂肪 g/100g</label>
          <input type="number" inputMode="decimal" className="w-full border border-[#e8e0d4] rounded-2xl px-4 py-3 text-sm bg-white outline-none focus:border-[#4caf7d]"
            placeholder="0" value={fat} onChange={e => setFat(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#8a8a8a] block mb-1">一份名稱</label>
          <input className="w-full border border-[#e8e0d4] rounded-2xl px-4 py-3 text-sm bg-white outline-none focus:border-[#4caf7d]"
            placeholder="一包、一瓶" value={servingLabel} onChange={e => setServingLabel(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-[#8a8a8a] block mb-1">一份克數 g</label>
          <input type="number" inputMode="decimal" className="w-full border border-[#e8e0d4] rounded-2xl px-4 py-3 text-sm bg-white outline-none focus:border-[#4caf7d]"
            placeholder="100" value={servingG} onChange={e => setServingG(e.target.value)} />
        </div>
      </div>

      <Button fullWidth size="lg" onClick={handleSave} disabled={saving}>
        {saving ? '儲存中…' : '新增並加入這餐'}
      </Button>
    </div>
  )
}

function ServingPicker({ food, onSelect, onBack }: {
  food: Food
  onSelect: (s: ServingSize) => void
  onBack: () => void
}) {
  const [customG, setCustomG] = useState('')

  return (
    <div className="p-5 space-y-4">
      <button className="text-sm text-[#4caf7d] flex items-center gap-1 touch-manipulation" onClick={onBack}>
        ← 返回搜尋
      </button>
      <div>
        <div className="font-semibold text-[#2d2d2d]">{food.name}</div>
        <div className="text-xs text-[#8a8a8a]">每 100g：{food.per100gCalories} kcal · 蛋白 {food.per100gProtein}g · 碳水 {food.per100gCarb}g · 脂肪 {food.per100gFat}g</div>
        {food.isEstimate && <div className="text-xs text-[#f5873c] mt-1">⚠ 估算值，實際可能有差異</div>}
      </div>
      <div className="space-y-2">
        <p className="text-sm text-[#8a8a8a]">選擇份量</p>
        {food.servingSizes.map(s => (
          <button key={s.label}
            className="w-full text-left px-4 py-3 bg-white rounded-2xl border border-[#e8e0d4] touch-manipulation active:border-[#4caf7d] active:bg-[#e8f5ed]"
            onClick={() => onSelect(s)}
          >
            <div className="text-sm font-medium text-[#2d2d2d]">{s.label}</div>
            <div className="text-xs text-[#8a8a8a]">{s.grams}g · 約 {Math.round(food.per100gCalories * s.grams / 100)} kcal</div>
          </button>
        ))}
        <button
          className="w-full text-left px-4 py-3 bg-white rounded-2xl border border-[#e8e0d4] touch-manipulation active:border-[#4caf7d]"
          onClick={() => onSelect({ label: '100克', unit: 'g', grams: 100 })}
        >
          <div className="text-sm font-medium text-[#2d2d2d]">100g</div>
        </button>
      </div>
      <div>
        <p className="text-sm text-[#8a8a8a] mb-2">或自訂克數</p>
        <div className="flex gap-2">
          <input
            type="number" inputMode="decimal"
            className="flex-1 border border-[#e8e0d4] rounded-2xl px-4 py-3 text-base outline-none focus:border-[#4caf7d]"
            placeholder="例：150"
            value={customG}
            onChange={e => setCustomG(e.target.value)}
          />
          <Button onClick={() => customG && onSelect({ label: `${customG}g`, unit: 'g', grams: +customG })}
            disabled={!customG || +customG <= 0}>確認</Button>
        </div>
      </div>
    </div>
  )
}
