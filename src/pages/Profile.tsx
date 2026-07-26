import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Upload, Trash2, Shield, Settings, ChevronRight } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { useUserProfile, useWeightLogs } from '../hooks/useDB'
import { exportBackup, importBackup, restoreBackup, exportCSV } from '../utils/exportUtils'
import { getStorageEstimate } from '../db/database'

export default function Profile() {
  const navigate = useNavigate()
  const { profile } = useUserProfile()
  const { logs: weightLogs, deleteLog } = useWeightLogs()
  const [importModal, setImportModal] = useState(false)
  const [weightModal, setWeightModal] = useState(false)
  const [storage, setStorage] = useState<{ usageMB: string } | null>(null)
  const [importPreview, setImportPreview] = useState<{ preview: Record<string, number>; data: Record<string, unknown[]> } | null>(null)
  const [importErr, setImportErr] = useState('')
  const [restored, setRestored] = useState(false)

  const recentWeight = weightLogs[0]
  const sevenDayAvg = weightLogs.slice(0, 7).length
    ? (weightLogs.slice(0, 7).reduce((s, l) => s + l.weight, 0) / weightLogs.slice(0, 7).length).toFixed(1)
    : null

  async function handleExport() {
    try { await exportBackup(true) }
    catch (e) { alert((e as Error).message) }
  }

  async function handleExportNoPhoto() {
    try { await exportBackup(false) }
    catch (e) { alert((e as Error).message) }
  }

  async function handleCSV() {
    try { await exportCSV() }
    catch (e) { alert((e as Error).message) }
  }

  async function handleImportFile(file: File) {
    setImportErr('')
    try {
      const result = await importBackup(file)
      setImportPreview(result)
    } catch (e) {
      setImportErr((e as Error).message)
    }
  }

  async function handleRestore() {
    if (!importPreview) return
    await restoreBackup(importPreview.data)
    setRestored(true)
    setImportPreview(null)
  }

  async function loadStorage() {
    const s = await getStorageEstimate()
    setStorage(s)
  }

  return (
    <Layout>
      <div className="px-4 pt-12 pb-4 space-y-4">
        <h1 className="text-2xl font-bold text-[#2d2d2d]">我的</h1>

        {/* Profile card */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#e8f5ed] rounded-full flex items-center justify-center text-2xl">
              {profile?.nickname?.charAt(0) ?? '?'}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-[#2d2d2d]">{profile?.nickname ?? '未設定'}</div>
              <div className="text-sm text-[#8a8a8a]">每日目標 {profile?.dailyCalorieGoal ?? '-'} kcal</div>
            </div>
            <button className="p-2 text-[#8a8a8a] touch-manipulation" onClick={() => navigate('/settings')}>
              <Settings size={20} />
            </button>
          </div>
        </Card>

        {/* Weight */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#2d2d2d]">體重追蹤</h2>
            <button className="text-[#4caf7d] text-sm touch-manipulation" onClick={() => setWeightModal(true)}>查看全部</button>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-[#2d2d2d]">{profile?.weight ?? '-'}</div>
              <div className="text-xs text-[#8a8a8a]">起始 kg</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[#4caf7d]">{recentWeight?.weight ?? profile?.weight ?? '-'}</div>
              <div className="text-xs text-[#8a8a8a]">目前 kg</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[#4a90d9]">{profile?.goalWeight ?? '-'}</div>
              <div className="text-xs text-[#8a8a8a]">目標 kg</div>
            </div>
          </div>
          {sevenDayAvg && (
            <div className="mt-3 text-center text-sm text-[#8a8a8a]">近 7 天平均 {sevenDayAvg} kg</div>
          )}

          {/* Mini weight chart */}
          {weightLogs.length > 1 && (
            <div className="mt-4 h-16 flex items-end gap-1">
              {[...weightLogs].reverse().slice(-14).map((l, i) => {
                const vals = [...weightLogs].reverse().slice(-14).map(x => x.weight)
                const min = Math.min(...vals) - 0.5
                const max = Math.max(...vals) + 0.5
                const h = Math.round(((l.weight - min) / (max - min)) * 100)
                return (
                  <div key={i} className="flex-1 h-full flex flex-col justify-end">
                    <div className="w-full rounded-t-sm bg-[#4caf7d]" style={{ height: `${Math.max(h, 5)}%` }} />
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Backup */}
        <Card>
          <h2 className="font-semibold text-[#2d2d2d] mb-3">資料備份</h2>
          <div className="bg-[#fff0e6] rounded-2xl p-3 mb-3 text-xs text-[#7c4a1e]">
            ⚠ 你的資料只在這台裝置上，換裝置前請先匯出備份！
          </div>
          <div className="space-y-2">
            <button
              className="w-full flex items-center gap-3 p-3 bg-[#f5f0e8] rounded-2xl text-sm touch-manipulation active:bg-[#e8e0d4]"
              onClick={handleExport}
            >
              <Download size={18} className="text-[#4caf7d]" />
              <div className="flex-1 text-left">
                <div className="font-medium text-[#2d2d2d]">匯出完整備份（含照片）</div>
                <div className="text-xs text-[#8a8a8a]">JSON 格式，可日後還原</div>
              </div>
            </button>
            <button
              className="w-full flex items-center gap-3 p-3 bg-[#f5f0e8] rounded-2xl text-sm touch-manipulation active:bg-[#e8e0d4]"
              onClick={handleExportNoPhoto}
            >
              <Download size={18} className="text-[#4a90d9]" />
              <div className="flex-1 text-left">
                <div className="font-medium text-[#2d2d2d]">匯出備份（不含照片）</div>
                <div className="text-xs text-[#8a8a8a]">檔案較小，適合分享</div>
              </div>
            </button>
            <button
              className="w-full flex items-center gap-3 p-3 bg-[#f5f0e8] rounded-2xl text-sm touch-manipulation active:bg-[#e8e0d4]"
              onClick={handleCSV}
            >
              <Download size={18} className="text-[#9c6fe4]" />
              <div className="flex-1 text-left">
                <div className="font-medium text-[#2d2d2d]">匯出 CSV（可用 Excel 開啟）</div>
                <div className="text-xs text-[#8a8a8a]">匯出三個 CSV 檔</div>
              </div>
            </button>
            <button
              className="w-full flex items-center gap-3 p-3 bg-[#f5f0e8] rounded-2xl text-sm touch-manipulation active:bg-[#e8e0d4]"
              onClick={() => setImportModal(true)}
            >
              <Upload size={18} className="text-[#f5873c]" />
              <div className="flex-1 text-left">
                <div className="font-medium text-[#2d2d2d]">從備份檔還原</div>
                <div className="text-xs text-[#8a8a8a]">選擇之前匯出的 JSON 檔</div>
              </div>
            </button>
          </div>
        </Card>

        {/* Storage */}
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#2d2d2d]">儲存空間</h2>
            <button className="text-[#4caf7d] text-sm touch-manipulation" onClick={loadStorage}>查看</button>
          </div>
          {storage && (
            <div className="mt-2 text-sm text-[#8a8a8a]">目前使用 {storage.usageMB} MB</div>
          )}
        </Card>

        {/* Privacy */}
        <button
          className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm touch-manipulation active:bg-[#f5f0e8]"
          onClick={() => navigate('/privacy')}
        >
          <Shield size={20} className="text-[#4caf7d]" />
          <span className="flex-1 text-left text-sm font-medium text-[#2d2d2d]">隱私說明</span>
          <ChevronRight size={16} className="text-[#e8e0d4]" />
        </button>

        <div className="text-center text-xs text-[#c0b8ae] pb-4">
          我的飲食紀錄 · 所有資料存在你的裝置上
        </div>
      </div>

      {/* Import modal */}
      <Modal open={importModal} onClose={() => { setImportModal(false); setImportPreview(null); setImportErr('') }} title="從備份還原">
        <div className="p-5 space-y-4">
          {!importPreview && !restored && (
            <>
              <p className="text-sm text-[#8a8a8a]">選擇之前匯出的 <code>.json</code> 備份檔</p>
              {importErr && <div className="bg-red-50 rounded-2xl p-3 text-sm text-red-600">{importErr}</div>}
              <input type="file" accept=".json" className="w-full text-sm"
                onChange={e => e.target.files?.[0] && handleImportFile(e.target.files[0])} />
            </>
          )}
          {importPreview && (
            <>
              <div className="bg-[#e8f5ed] rounded-2xl p-4">
                <p className="text-sm font-semibold text-[#2d6a4f] mb-2">備份內容預覽</p>
                {Object.entries(importPreview.preview).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm text-[#2d2d2d] py-1 border-b border-[#c8e6c9]">
                    <span>{k}</span><span className="font-medium">{v} 筆</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#fff0e6] rounded-2xl p-3 text-xs text-[#7c4a1e]">
                ⚠ 還原後目前的資料將被備份覆蓋，無法復原
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" fullWidth onClick={() => setImportPreview(null)}>取消</Button>
                <Button fullWidth onClick={handleRestore}>確認還原</Button>
              </div>
            </>
          )}
          {restored && (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✓</div>
              <p className="font-semibold text-[#4caf7d]">還原成功！</p>
              <p className="text-sm text-[#8a8a8a] mt-2">請重新整理頁面以載入資料</p>
              <Button className="mt-4" onClick={() => window.location.reload()}>重新整理</Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Weight logs modal */}
      <Modal open={weightModal} onClose={() => setWeightModal(false)} title="體重紀錄">
        <div className="p-5 space-y-2">
          {weightLogs.length === 0 ? (
            <p className="text-center text-[#8a8a8a] text-sm py-8">還沒有體重紀錄</p>
          ) : weightLogs.map(l => (
            <div key={l.id} className="flex items-center justify-between py-3 border-b border-[#f5f0e8]">
              <div>
                <div className="text-sm font-medium text-[#2d2d2d]">{l.weight} kg</div>
                <div className="text-xs text-[#8a8a8a]">{l.date}</div>
              </div>
              <button className="p-2 text-[#ef5350] touch-manipulation" onClick={() => l.id && deleteLog(l.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </Layout>
  )
}
