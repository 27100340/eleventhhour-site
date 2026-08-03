import type { HTMLAttributes } from 'react'
import { cx } from '@/lib/cx'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** 'raised' adds the floating shadow — reserve for overlays/sticky panels. */
  tone?: 'flat' | 'raised'
  padded?: boolean
}

export function Card({ tone = 'flat', padded = true, className, ...props }: CardProps) {
  return (
    <div
      className={cx(
        'bg-surface rounded-(--radius-card) border border-line',
        tone === 'raised' && 'shadow-soft',
        padded && 'p-6',
        className,
      )}
      {...props}
    />
  )
}
