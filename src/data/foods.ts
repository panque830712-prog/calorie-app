import type { Food, ServingSize } from '../types'

// 資料來源：台灣衛生福利部食品藥物管理署食品營養成分資料庫
// 部分台灣料理為估算值（isEstimate: true）
// 數值為每 100g 含量

const rice: ServingSize[] = [
  { label: '半碗', unit: '碗', grams: 80 },
  { label: '一碗', unit: '碗', grams: 160 },
  { label: '一碗半', unit: '碗', grams: 240 },
]

const bowl100: ServingSize[] = [
  { label: '半碗', unit: '碗', grams: 50 },
  { label: '一碗', unit: '碗', grams: 100 },
  { label: '一碗半', unit: '碗', grams: 150 },
]

const egg1: ServingSize[] = [
  { label: '一顆', unit: '顆', grams: 55 },
  { label: '兩顆', unit: '顆', grams: 110 },
]

const cup250: ServingSize[] = [
  { label: '一杯', unit: '杯', grams: 250 },
  { label: '半杯', unit: '杯', grams: 125 },
]

const box: ServingSize[] = [
  { label: '一盒', unit: '盒', grams: 700 },
  { label: '半盒', unit: '盒', grams: 350 },
]

const piece: ServingSize[] = [
  { label: '一片', unit: '片', grams: 30 },
  { label: '兩片', unit: '片', grams: 60 },
]

const grams: ServingSize[] = [
  { label: '100 克', unit: 'g', grams: 100 },
  { label: '150 克', unit: 'g', grams: 150 },
  { label: '200 克', unit: 'g', grams: 200 },
]

const TFDA = '台灣衛福部 TFDA'
const EST = '台灣常見料理估算值'

export const SEED_FOODS: Omit<Food, 'id'>[] = [
  // ── 主食 ──────────────────────────────────────────
  {
    name: '白飯', category: '主食',
    per100gCalories: 183, per100gProtein: 3.1, per100gCarb: 40.4, per100gFat: 0.3,
    per100gSugar: 0, per100gFiber: 0.3, per100gSodium: 2,
    servingSizes: rice, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '糙米飯', category: '主食',
    per100gCalories: 171, per100gProtein: 3.5, per100gCarb: 36.5, per100gFat: 0.8,
    per100gSugar: 0, per100gFiber: 1.6, per100gSodium: 3,
    servingSizes: rice, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '地瓜（紅心）', category: '主食',
    per100gCalories: 124, per100gProtein: 1.0, per100gCarb: 29.6, per100gFat: 0.1,
    per100gSugar: 5.1, per100gFiber: 2.4, per100gSodium: 57,
    servingSizes: [{ label: '一條中', unit: '條', grams: 150 }, { label: '半條', unit: '條', grams: 75 }],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '馬鈴薯', category: '主食',
    per100gCalories: 77, per100gProtein: 1.8, per100gCarb: 17.5, per100gFat: 0.1,
    per100gSugar: 0.9, per100gFiber: 1.3, per100gSodium: 5,
    servingSizes: [{ label: '一顆中', unit: '顆', grams: 150 }, ...grams],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '麵條（水煮）', category: '主食',
    per100gCalories: 130, per100gProtein: 3.8, per100gCarb: 26.9, per100gFat: 0.5,
    per100gSugar: 0, per100gFiber: 0.9, per100gSodium: 2,
    servingSizes: [{ label: '一份', unit: '份', grams: 200 }, { label: '半份', unit: '份', grams: 100 }],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '吐司（白）', category: '主食',
    per100gCalories: 264, per100gProtein: 8.3, per100gCarb: 51.8, per100gFat: 3.2,
    per100gSugar: 4.5, per100gFiber: 2.3, per100gSodium: 460,
    servingSizes: piece, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '全麥吐司', category: '主食',
    per100gCalories: 246, per100gProtein: 9.0, per100gCarb: 46.8, per100gFat: 3.5,
    per100gSugar: 3.8, per100gFiber: 4.8, per100gSodium: 420,
    servingSizes: piece, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '饅頭', category: '主食',
    per100gCalories: 236, per100gProtein: 6.4, per100gCarb: 50.1, per100gFat: 0.7,
    per100gSugar: 2.5, per100gFiber: 1.5, per100gSodium: 220,
    servingSizes: [{ label: '一個', unit: '個', grams: 90 }, { label: '半個', unit: '個', grams: 45 }],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '燕麥片', category: '主食',
    per100gCalories: 389, per100gProtein: 16.9, per100gCarb: 66.3, per100gFat: 6.9,
    per100gSugar: 0, per100gFiber: 10.6, per100gSodium: 2,
    servingSizes: [{ label: '一份（40g）', unit: 'g', grams: 40 }, { label: '半份', unit: 'g', grams: 20 }],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '飯糰', category: '主食',
    per100gCalories: 190, per100gProtein: 5.5, per100gCarb: 36.0, per100gFat: 3.5,
    per100gSugar: 0.5, per100gFiber: 0.5, per100gSodium: 450,
    servingSizes: [{ label: '一個', unit: '個', grams: 180 }],
    source: EST, isEstimate: true, isCustom: false,
  },

  // ── 蛋白質 ──────────────────────────────────────────
  {
    name: '雞胸肉（水煮）', category: '蛋白質',
    per100gCalories: 116, per100gProtein: 23.1, per100gCarb: 0, per100gFat: 2.5,
    per100gSugar: 0, per100gFiber: 0, per100gSodium: 64,
    servingSizes: grams, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '雞腿肉（帶皮）', category: '蛋白質',
    per100gCalories: 196, per100gProtein: 17.5, per100gCarb: 0, per100gFat: 14.0,
    per100gSugar: 0, per100gFiber: 0, per100gSodium: 77,
    servingSizes: grams, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '豬里肌', category: '蛋白質',
    per100gCalories: 139, per100gProtein: 22.0, per100gCarb: 0, per100gFat: 5.7,
    per100gSugar: 0, per100gFiber: 0, per100gSodium: 52,
    servingSizes: grams, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '牛肉（里肌）', category: '蛋白質',
    per100gCalories: 155, per100gProtein: 22.6, per100gCarb: 0, per100gFat: 7.2,
    per100gSugar: 0, per100gFiber: 0, per100gSodium: 60,
    servingSizes: grams, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '鮭魚', category: '蛋白質',
    per100gCalories: 201, per100gProtein: 20.1, per100gCarb: 0, per100gFat: 13.1,
    per100gSugar: 0, per100gFiber: 0, per100gSodium: 65,
    servingSizes: grams, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '鯖魚', category: '蛋白質',
    per100gCalories: 209, per100gProtein: 20.5, per100gCarb: 0.1, per100gFat: 13.7,
    per100gSugar: 0, per100gFiber: 0, per100gSodium: 83,
    servingSizes: grams, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '鮪魚（水煮罐頭）', category: '蛋白質',
    per100gCalories: 109, per100gProtein: 24.8, per100gCarb: 0, per100gFat: 0.9,
    per100gSugar: 0, per100gFiber: 0, per100gSodium: 320,
    servingSizes: [{ label: '半罐', unit: '罐', grams: 85 }, { label: '一罐', unit: '罐', grams: 170 }],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '雞蛋', category: '蛋白質',
    per100gCalories: 138, per100gProtein: 12.5, per100gCarb: 0.7, per100gFat: 9.6,
    per100gSugar: 0.4, per100gFiber: 0, per100gSodium: 138,
    servingSizes: egg1, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '板豆腐', category: '蛋白質',
    per100gCalories: 88, per100gProtein: 8.5, per100gCarb: 1.9, per100gFat: 5.4,
    per100gSugar: 0.1, per100gFiber: 0.6, per100gSodium: 8,
    servingSizes: bowl100, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '嫩豆腐', category: '蛋白質',
    per100gCalories: 57, per100gProtein: 5.3, per100gCarb: 1.5, per100gFat: 3.2,
    per100gSugar: 0.1, per100gFiber: 0.3, per100gSodium: 12,
    servingSizes: bowl100, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '毛豆', category: '蛋白質',
    per100gCalories: 135, per100gProtein: 13.8, per100gCarb: 7.9, per100gFat: 6.0,
    per100gSugar: 2.8, per100gFiber: 4.2, per100gSodium: 7,
    servingSizes: bowl100, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '無糖豆漿', category: '飲料',
    per100gCalories: 35, per100gProtein: 3.6, per100gCarb: 1.5, per100gFat: 1.8,
    per100gSugar: 0.3, per100gFiber: 0.1, per100gSodium: 55,
    servingSizes: cup250, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '有糖豆漿', category: '飲料',
    per100gCalories: 58, per100gProtein: 3.0, per100gCarb: 7.5, per100gFat: 1.5,
    per100gSugar: 6.0, per100gFiber: 0.1, per100gSodium: 50,
    servingSizes: cup250, source: EST, isEstimate: true, isCustom: false,
  },

  // ── 蔬菜 ──────────────────────────────────────────
  {
    name: '高麗菜', category: '蔬菜',
    per100gCalories: 23, per100gProtein: 1.3, per100gCarb: 4.4, per100gFat: 0.2,
    per100gSugar: 2.5, per100gFiber: 1.7, per100gSodium: 12,
    servingSizes: bowl100, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '青江菜', category: '蔬菜',
    per100gCalories: 13, per100gProtein: 1.5, per100gCarb: 1.7, per100gFat: 0.2,
    per100gSugar: 0.9, per100gFiber: 1.4, per100gSodium: 34,
    servingSizes: bowl100, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '花椰菜', category: '蔬菜',
    per100gCalories: 28, per100gProtein: 2.5, per100gCarb: 4.4, per100gFat: 0.3,
    per100gSugar: 1.8, per100gFiber: 2.4, per100gSodium: 25,
    servingSizes: bowl100, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '菠菜', category: '蔬菜',
    per100gCalories: 22, per100gProtein: 2.9, per100gCarb: 2.3, per100gFat: 0.3,
    per100gSugar: 0.4, per100gFiber: 2.2, per100gSodium: 79,
    servingSizes: bowl100, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '地瓜葉', category: '蔬菜',
    per100gCalories: 30, per100gProtein: 3.2, per100gCarb: 4.3, per100gFat: 0.4,
    per100gSugar: 1.0, per100gFiber: 3.1, per100gSodium: 30,
    servingSizes: bowl100, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '空心菜', category: '蔬菜',
    per100gCalories: 25, per100gProtein: 2.5, per100gCarb: 3.4, per100gFat: 0.2,
    per100gSugar: 0.6, per100gFiber: 2.1, per100gSodium: 45,
    servingSizes: bowl100, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '生菜（萵苣）', category: '蔬菜',
    per100gCalories: 13, per100gProtein: 1.0, per100gCarb: 2.2, per100gFat: 0.2,
    per100gSugar: 0.9, per100gFiber: 1.2, per100gSodium: 8,
    servingSizes: bowl100, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '番茄', category: '蔬菜',
    per100gCalories: 18, per100gProtein: 0.9, per100gCarb: 3.7, per100gFat: 0.2,
    per100gSugar: 2.6, per100gFiber: 1.2, per100gSodium: 10,
    servingSizes: [{ label: '一顆', unit: '顆', grams: 120 }, { label: '半顆', unit: '顆', grams: 60 }],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '小黃瓜', category: '蔬菜',
    per100gCalories: 14, per100gProtein: 0.8, per100gCarb: 2.8, per100gFat: 0.1,
    per100gSugar: 1.7, per100gFiber: 0.6, per100gSodium: 3,
    servingSizes: [{ label: '一條', unit: '條', grams: 120 }, { label: '半條', unit: '條', grams: 60 }],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '香菇', category: '蔬菜',
    per100gCalories: 24, per100gProtein: 2.5, per100gCarb: 4.5, per100gFat: 0.2,
    per100gSugar: 0.5, per100gFiber: 3.7, per100gSodium: 5,
    servingSizes: bowl100, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '洋蔥', category: '蔬菜',
    per100gCalories: 40, per100gProtein: 1.1, per100gCarb: 9.0, per100gFat: 0.1,
    per100gSugar: 4.7, per100gFiber: 1.7, per100gSodium: 4,
    servingSizes: [{ label: '半顆', unit: '顆', grams: 80 }, { label: '一顆', unit: '顆', grams: 160 }],
    source: TFDA, isEstimate: false, isCustom: false,
  },

  // ── 台灣常見料理 ──────────────────────────────────────────
  {
    name: '雞腿便當', category: '台灣料理',
    per100gCalories: 155, per100gProtein: 9.0, per100gCarb: 20.5, per100gFat: 4.0,
    per100gSugar: 1.0, per100gFiber: 0.8, per100gSodium: 380,
    servingSizes: box, source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '排骨便當', category: '台灣料理',
    per100gCalories: 160, per100gProtein: 8.5, per100gCarb: 21.0, per100gFat: 4.8,
    per100gSugar: 1.0, per100gFiber: 0.8, per100gSodium: 420,
    servingSizes: box, source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '滷肉飯', category: '台灣料理',
    per100gCalories: 178, per100gProtein: 6.5, per100gCarb: 26.0, per100gFat: 5.5,
    per100gSugar: 2.0, per100gFiber: 0.5, per100gSodium: 480,
    servingSizes: [{ label: '一碗', unit: '碗', grams: 280 }, { label: '半碗', unit: '碗', grams: 140 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '牛肉麵', category: '台灣料理',
    per100gCalories: 95, per100gProtein: 6.0, per100gCarb: 12.0, per100gFat: 2.5,
    per100gSugar: 0.5, per100gFiber: 0.5, per100gSodium: 550,
    servingSizes: [{ label: '一碗', unit: '碗', grams: 550 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '水餃', category: '台灣料理',
    per100gCalories: 197, per100gProtein: 9.5, per100gCarb: 26.5, per100gFat: 5.8,
    per100gSugar: 1.0, per100gFiber: 1.0, per100gSodium: 380,
    servingSizes: [
      { label: '五顆', unit: '顆', grams: 100 },
      { label: '十顆', unit: '顆', grams: 200 },
      { label: '一份', unit: '份', grams: 150 },
    ],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '鍋貼', category: '台灣料理',
    per100gCalories: 220, per100gProtein: 8.5, per100gCarb: 28.0, per100gFat: 8.0,
    per100gSugar: 1.0, per100gFiber: 1.0, per100gSodium: 420,
    servingSizes: [
      { label: '四個', unit: '個', grams: 120 },
      { label: '六個', unit: '個', grams: 180 },
    ],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '蛋餅', category: '台灣料理',
    per100gCalories: 180, per100gProtein: 7.5, per100gCarb: 22.0, per100gFat: 7.0,
    per100gSugar: 1.0, per100gFiber: 0.5, per100gSodium: 480,
    servingSizes: [{ label: '一份', unit: '份', grams: 180 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '蘿蔔糕', category: '台灣料理',
    per100gCalories: 130, per100gProtein: 2.5, per100gCarb: 24.5, per100gFat: 3.0,
    per100gSugar: 0.5, per100gFiber: 0.5, per100gSodium: 350,
    servingSizes: [{ label: '兩片', unit: '片', grams: 160 }, { label: '一片', unit: '片', grams: 80 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '鹽酥雞', category: '台灣料理',
    per100gCalories: 278, per100gProtein: 16.5, per100gCarb: 18.0, per100gFat: 14.5,
    per100gSugar: 0.5, per100gFiber: 0.5, per100gSodium: 620,
    servingSizes: [{ label: '一份（約一杯）', unit: '份', grams: 150 }, { label: '小份', unit: '份', grams: 100 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '滷味（綜合）', category: '台灣料理',
    per100gCalories: 120, per100gProtein: 10.0, per100gCarb: 8.0, per100gFat: 5.0,
    per100gSugar: 2.0, per100gFiber: 0.5, per100gSodium: 700,
    servingSizes: [{ label: '一份', unit: '份', grams: 200 }, { label: '小份', unit: '份', grams: 120 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '炒飯', category: '台灣料理',
    per100gCalories: 185, per100gProtein: 5.5, per100gCarb: 30.0, per100gFat: 5.0,
    per100gSugar: 0.5, per100gFiber: 0.5, per100gSodium: 520,
    servingSizes: [{ label: '一盤', unit: '盤', grams: 350 }, { label: '半盤', unit: '盤', grams: 175 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '炒麵', category: '台灣料理',
    per100gCalories: 155, per100gProtein: 5.0, per100gCarb: 24.0, per100gFat: 4.5,
    per100gSugar: 0.5, per100gFiber: 1.0, per100gSodium: 580,
    servingSizes: [{ label: '一盤', unit: '盤', grams: 350 }, { label: '半盤', unit: '盤', grams: 175 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '肉燥麵', category: '台灣料理',
    per100gCalories: 148, per100gProtein: 6.5, per100gCarb: 22.5, per100gFat: 3.8,
    per100gSugar: 1.0, per100gFiber: 0.8, per100gSodium: 560,
    servingSizes: [{ label: '一碗', unit: '碗', grams: 400 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '雞肉飯', category: '台灣料理',
    per100gCalories: 162, per100gProtein: 8.5, per100gCarb: 24.0, per100gFat: 3.5,
    per100gSugar: 0.5, per100gFiber: 0.3, per100gSodium: 450,
    servingSizes: [{ label: '一碗', unit: '碗', grams: 280 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '自助餐（一般）', category: '台灣料理',
    per100gCalories: 145, per100gProtein: 7.0, per100gCarb: 18.5, per100gFat: 4.5,
    per100gSugar: 1.0, per100gFiber: 1.0, per100gSodium: 500,
    servingSizes: [{ label: '一份', unit: '份', grams: 500 }, { label: '小份', unit: '份', grams: 350 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '火鍋（清湯底）', category: '台灣料理',
    per100gCalories: 85, per100gProtein: 7.5, per100gCarb: 6.5, per100gFat: 3.0,
    per100gSugar: 0.5, per100gFiber: 0.8, per100gSodium: 600,
    servingSizes: [{ label: '一人份', unit: '份', grams: 600 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '便利商店三角飯糰', category: '台灣料理',
    per100gCalories: 178, per100gProtein: 4.5, per100gCarb: 34.0, per100gFat: 3.5,
    per100gSugar: 1.0, per100gFiber: 0.5, per100gSodium: 380,
    servingSizes: [{ label: '一個', unit: '個', grams: 110 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '豆花', category: '台灣料理',
    per100gCalories: 62, per100gProtein: 2.8, per100gCarb: 11.0, per100gFat: 1.0,
    per100gSugar: 9.5, per100gFiber: 0.1, per100gSodium: 20,
    servingSizes: [{ label: '一碗', unit: '碗', grams: 300 }],
    source: EST, isEstimate: true, isCustom: false,
  },

  // ── 飲料 ──────────────────────────────────────────
  {
    name: '白開水', category: '飲料',
    per100gCalories: 0, per100gProtein: 0, per100gCarb: 0, per100gFat: 0,
    per100gSugar: 0, per100gFiber: 0, per100gSodium: 0,
    servingSizes: [
      { label: '一杯 250ml', unit: 'ml', grams: 250 },
      { label: '一瓶 500ml', unit: 'ml', grams: 500 },
      { label: '一瓶 350ml', unit: 'ml', grams: 350 },
    ],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '鮮奶', category: '飲料',
    per100gCalories: 63, per100gProtein: 3.1, per100gCarb: 4.7, per100gFat: 3.5,
    per100gSugar: 4.7, per100gFiber: 0, per100gSodium: 43,
    servingSizes: cup250, source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '拿鐵咖啡', category: '飲料',
    per100gCalories: 42, per100gProtein: 1.8, per100gCarb: 4.0, per100gFat: 2.0,
    per100gSugar: 3.5, per100gFiber: 0, per100gSodium: 40,
    servingSizes: [{ label: '一杯 350ml', unit: 'ml', grams: 350 }, { label: '大杯 480ml', unit: 'ml', grams: 480 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '美式咖啡（黑）', category: '飲料',
    per100gCalories: 3, per100gProtein: 0.2, per100gCarb: 0.3, per100gFat: 0,
    per100gSugar: 0, per100gFiber: 0, per100gSodium: 2,
    servingSizes: [{ label: '一杯 350ml', unit: 'ml', grams: 350 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '無糖茶', category: '飲料',
    per100gCalories: 1, per100gProtein: 0.1, per100gCarb: 0.1, per100gFat: 0,
    per100gSugar: 0, per100gFiber: 0, per100gSodium: 3,
    servingSizes: [{ label: '一杯 500ml', unit: 'ml', grams: 500 }, { label: '一杯 350ml', unit: 'ml', grams: 350 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '奶茶', category: '飲料',
    per100gCalories: 55, per100gProtein: 1.0, per100gCarb: 9.5, per100gFat: 1.5,
    per100gSugar: 8.5, per100gFiber: 0, per100gSodium: 35,
    servingSizes: [{ label: '一杯 700ml', unit: 'ml', grams: 700 }, { label: '一杯 500ml', unit: 'ml', grams: 500 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '珍珠奶茶', category: '飲料',
    per100gCalories: 75, per100gProtein: 0.8, per100gCarb: 16.0, per100gFat: 1.2,
    per100gSugar: 12.0, per100gFiber: 0, per100gSodium: 30,
    servingSizes: [{ label: '一杯 700ml', unit: 'ml', grams: 700 }, { label: '一杯 500ml', unit: 'ml', grams: 500 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '柳橙汁', category: '飲料',
    per100gCalories: 45, per100gProtein: 0.7, per100gCarb: 10.4, per100gFat: 0.2,
    per100gSugar: 8.4, per100gFiber: 0.2, per100gSodium: 1,
    servingSizes: cup250, source: TFDA, isEstimate: false, isCustom: false,
  },

  // ── 醬料與油脂 ──────────────────────────────────────────
  {
    name: '沙拉油（炒菜用油）', category: '油脂',
    per100gCalories: 884, per100gProtein: 0, per100gCarb: 0, per100gFat: 100,
    per100gSugar: 0, per100gFiber: 0, per100gSodium: 0,
    servingSizes: [
      { label: '一茶匙', unit: '茶匙', grams: 5 },
      { label: '一湯匙', unit: '湯匙', grams: 14 },
      { label: '兩湯匙', unit: '湯匙', grams: 28 },
    ],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '醬油', category: '醬料',
    per100gCalories: 62, per100gProtein: 7.0, per100gCarb: 5.5, per100gFat: 0.1,
    per100gSugar: 3.5, per100gFiber: 0, per100gSodium: 5700,
    servingSizes: [
      { label: '一茶匙', unit: '茶匙', grams: 6 },
      { label: '一湯匙', unit: '湯匙', grams: 18 },
    ],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '沙茶醬', category: '醬料',
    per100gCalories: 361, per100gProtein: 7.8, per100gCarb: 12.5, per100gFat: 31.5,
    per100gSugar: 5.0, per100gFiber: 0.5, per100gSodium: 870,
    servingSizes: [{ label: '一茶匙', unit: '茶匙', grams: 8 }, { label: '一湯匙', unit: '湯匙', grams: 20 }],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '美乃滋', category: '醬料',
    per100gCalories: 672, per100gProtein: 1.5, per100gCarb: 7.5, per100gFat: 70.0,
    per100gSugar: 4.5, per100gFiber: 0, per100gSodium: 650,
    servingSizes: [{ label: '一茶匙', unit: '茶匙', grams: 7 }, { label: '一湯匙', unit: '湯匙', grams: 15 }],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '番茄醬', category: '醬料',
    per100gCalories: 105, per100gProtein: 1.5, per100gCarb: 25.0, per100gFat: 0.2,
    per100gSugar: 19.5, per100gFiber: 1.0, per100gSodium: 900,
    servingSizes: [{ label: '一茶匙', unit: '茶匙', grams: 6 }, { label: '一湯匙', unit: '湯匙', grams: 16 }],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '胡麻醬', category: '醬料',
    per100gCalories: 320, per100gProtein: 5.5, per100gCarb: 18.0, per100gFat: 26.0,
    per100gSugar: 8.0, per100gFiber: 1.5, per100gSodium: 580,
    servingSizes: [{ label: '一茶匙', unit: '茶匙', grams: 8 }, { label: '一湯匙', unit: '湯匙', grams: 20 }],
    source: EST, isEstimate: true, isCustom: false,
  },

  // ── 零食與點心 ──────────────────────────────────────────
  {
    name: '香蕉', category: '水果',
    per100gCalories: 91, per100gProtein: 1.1, per100gCarb: 23.4, per100gFat: 0.2,
    per100gSugar: 12.2, per100gFiber: 1.7, per100gSodium: 1,
    servingSizes: [{ label: '一根中', unit: '根', grams: 100 }, { label: '一根大', unit: '根', grams: 130 }],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '蘋果', category: '水果',
    per100gCalories: 52, per100gProtein: 0.3, per100gCarb: 13.7, per100gFat: 0.2,
    per100gSugar: 10.4, per100gFiber: 2.4, per100gSodium: 1,
    servingSizes: [{ label: '一顆中', unit: '顆', grams: 180 }, { label: '半顆', unit: '顆', grams: 90 }],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '芭樂', category: '水果',
    per100gCalories: 38, per100gProtein: 0.8, per100gCarb: 9.1, per100gFat: 0.3,
    per100gSugar: 5.8, per100gFiber: 3.0, per100gSodium: 2,
    servingSizes: [{ label: '半顆', unit: '顆', grams: 150 }, { label: '一顆', unit: '顆', grams: 300 }],
    source: TFDA, isEstimate: false, isCustom: false,
  },
  {
    name: '茶葉蛋', category: '台灣料理',
    per100gCalories: 151, per100gProtein: 13.0, per100gCarb: 1.0, per100gFat: 10.5,
    per100gSugar: 0.5, per100gFiber: 0, per100gSodium: 520,
    servingSizes: [{ label: '一顆', unit: '顆', grams: 60 }],
    source: EST, isEstimate: true, isCustom: false,
  },
  {
    name: '雞蛋糕', category: '台灣料理',
    per100gCalories: 290, per100gProtein: 8.0, per100gCarb: 43.0, per100gFat: 10.0,
    per100gSugar: 15.0, per100gFiber: 0.5, per100gSodium: 200,
    servingSizes: [{ label: '一份（10個）', unit: '份', grams: 150 }],
    source: EST, isEstimate: true, isCustom: false,
  },
]

export function searchFoods(query: string, foods: Food[]): Food[] {
  if (!query.trim()) return foods.slice(0, 20)
  const q = query.toLowerCase().trim()
  return foods.filter(f =>
    f.name.includes(q) || f.category.includes(q)
  ).slice(0, 30)
}

export function getFoodsByCategory(category: string, foods: Food[]): Food[] {
  return foods.filter(f => f.category === category)
}

export const FOOD_CATEGORIES = ['主食', '蛋白質', '蔬菜', '台灣料理', '飲料', '油脂', '醬料', '水果']

export const OIL_OPTIONS = [
  { label: '幾乎沒有', grams: 0 },
  { label: '約一茶匙（5ml）', grams: 5 },
  { label: '約一湯匙（14ml）', grams: 14 },
  { label: '約兩湯匙（28ml）', grams: 28 },
  { label: '不確定', grams: 7 },
]

export const SAUCE_OPTIONS = [
  '醬油', '沙茶醬', '胡麻醬', '美乃滋', '番茄醬', '辣椒醬', '烤肉醬',
]
