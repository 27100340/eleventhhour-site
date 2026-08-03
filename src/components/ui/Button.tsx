import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cx } from '@/lib/cx'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-(--radius-ctl) transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

const variants: Record<ButtonVariant, string> = {
  primary: 'text-white bg-accent hover:bg-accent-dark focus-visible:ring-accent/40',
  secondary:
    'text-ink border border-ink/80 bg-transparent hover:bg-ink hover:text-paper focus-visible:ring-ink/30',
  ghost: 'text-ink-soft hover:text-ink hover:bg-ink/5 focus-visible:ring-ink/20',
  danger: 'text-white bg-red-700 hover:bg-red-800 focus-visible:ring-red-400',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'primary', size = 'md', className, type, ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        className={cx(base, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  },
)
