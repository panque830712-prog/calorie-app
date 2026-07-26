import { type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  padding?: boolean
}

export function Card({ children, className = '', padding = true }: Props) {
  return (
    <div className={`bg-white rounded-3xl shadow-sm ${padding ? 'p-4' : ''} ${className}`}>
      {children}
    </div>
  )
}
