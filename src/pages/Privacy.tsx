import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'

export default function Privacy() {
  const navigate = useNavigate()
  return (
    <Layout hideNav>
      <div className="px-4 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white shadow-sm touch-manipulation">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-[#2d2d2d]">隱私說明</h1>
        </div>

        <div className="space-y-4 text-sm text-[#2d2d2d] leading-relaxed">
          <div className="bg-[#e8f5ed] rounded-3xl p-5">
            <h2 className="font-semibold text-[#2d6a4f] mb-3 text-base">你的資料只在你的裝置上</h2>
            <p className="text-[#4a7a5e]">這個 App 的所有資料，包括飲食紀錄、體重、照片，都只保存在你的手機或電腦上，不會傳送到任何伺服器。</p>
          </div>

          <Section title="不收集的資料">
            <ul className="space-y-1.5 text-[#8a8a8a]">
              {['不需要帳號或登入', '不收集姓名或電子郵件', '不上傳體重、飲食、照片', '不追蹤使用行為', '不使用廣告追蹤', '不使用分析工具（無 Google Analytics）', '不將任何資料提供給第三方', '不將照片用於 AI 訓練'].map(t => (
                <li key={t} className="flex items-start gap-2"><span className="text-[#4caf7d] mt-0.5">✓</span>{t}</li>
              ))}
            </ul>
          </Section>

          <Section title="資料儲存">
            <p className="text-[#8a8a8a]">資料使用瀏覽器的 IndexedDB 儲存在你的裝置上。照片在存入前會先在裝置上壓縮，不會上傳。</p>
          </Section>

          <Section title="資料安全提醒">
            <p className="text-[#8a8a8a]">清除瀏覽器資料或更換裝置時，資料可能遺失。請定期到「我的」頁面匯出備份。</p>
          </Section>

          <Section title="分享網址給朋友">
            <p className="text-[#8a8a8a]">每個使用者的資料都在自己的裝置上，彼此完全隔離，沒有共用資料庫。</p>
          </Section>

          <Section title="開源與免費">
            <p className="text-[#8a8a8a]">這個 App 完全免費，不需要付費，不會收集資料來賣廣告。部署在靜態網站主機，不需要後端伺服器。</p>
          </Section>
        </div>
      </div>
    </Layout>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="font-semibold text-[#2d2d2d] mb-2">{title}</h3>
      {children}
    </div>
  )
}
