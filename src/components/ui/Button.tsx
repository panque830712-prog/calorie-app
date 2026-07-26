import { type ButtonHTMLAttributes, type ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  fullWidth?: boolean
}

const variants = {
  primary: 'bg-[#4caf7d] text-white active:bg-[#3d9a6a] disabled:opacity-40',
  secondary: 'bg-white text-[#2d2d2d] border border-[#e8e0d4] active:bg-[#f5f0e8]',
  ghost: 'bg-transparent text-[#4caf7d] active:bg-[#e8f5ed]',
  danger: 'bg-[#ef5350] text-white active:bg-[#c62828] disabled:opacity-40',
}
const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-xl',
  md: 'px-4 py-3 text-base rounded-2xl',
  lg: 'px-6 py-4 text-lg rounded-2xl font-medium',
}

export function Button({ variant = 'primary', size = 'md', fullWidth, children, className = '', ...props }: Props) {
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} font-medium transition-all touch-manipulation select-none ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
