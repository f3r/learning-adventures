import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ButtonProps {
  readonly children: ReactNode
  readonly onClick: () => void
  readonly variant?: 'primary' | 'secondary' | 'success'
  readonly size?: 'sm' | 'md' | 'lg'
  readonly disabled?: boolean
  readonly className?: string
}

const variantStyles = {
  primary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
  success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30',
} as const

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
} as const

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        font-bold rounded-xl transition-colors cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
