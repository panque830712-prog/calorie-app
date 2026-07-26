import { type ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface Props {
  children: ReactNode
  hideNav?: boolean
  className?: string
}

export function Layout({ children, hideNav, className = '' }: Props) {
  return (
    <div className={`flex flex-col min-h-dvh max-w-lg mx-auto ${className}`}>
      <main className={`flex-1 ${hideNav ? '' : 'pb-24'}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
