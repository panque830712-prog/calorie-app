import { NavLink } from 'react-router-dom'
import { Home, BookOpen, Camera, User } from 'lucide-react'

const tabs = [
  { to: '/', icon: Home, label: '今日' },
  { to: '/records', icon: BookOpen, label: '紀錄' },
  { to: '/add-meal', icon: Camera, label: '拍照' },
  { to: '/profile', icon: User, label: '我的' },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e8e0d4]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch max-w-lg mx-auto">
        {tabs.map(({ to, icon: Icon, label }, i) => {
          const isCamera = i === 2
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center py-2 transition-colors touch-manipulation select-none
                ${isCamera ? 'relative' : ''}
                ${isActive && !isCamera ? 'text-[#4caf7d]' : 'text-[#8a8a8a]'}`
              }
            >
              {({ isActive }) =>
                isCamera ? (
                  <div className={`flex flex-col items-center -mt-5 transition-colors ${isActive ? 'text-[#4caf7d]' : 'text-white'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${isActive ? 'bg-[#3d9a6a]' : 'bg-[#4caf7d]'}`}>
                      <Icon size={26} className="text-white" />
                    </div>
                    <span className="text-[10px] mt-1 text-[#8a8a8a]">{label}</span>
                  </div>
                ) : (
                  <>
                    <Icon size={22} />
                    <span className="text-[10px] mt-0.5">{label}</span>
                  </>
                )
              }
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
