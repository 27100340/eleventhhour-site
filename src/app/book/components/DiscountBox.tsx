import { Check, X } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'

type AppliedDiscount = {
  code: string
  description?: string
  discount_amount?: number
} | null

type Props = {
  discountCode: string
  onCodeChange: (code: string) => void
  appliedDiscount: AppliedDiscount
  discountAmount: number
  discountError: string
  validating: boolean
  onApply: () => void
  onRemove: () => void
}

export function DiscountBox({
  discountCode,
  onCodeChange,
  appliedDiscount,
  discountAmount,
  discountError,
  validating,
  onApply,
  onRemove,
}: Props) {
  return (
    <div className="rounded-(--radius-card) border border-line bg-surface p-4">
      <p className="mb-3 text-sm font-medium text-ink">Have a discount code?</p>

      {!appliedDiscount ? (
        <div className="flex gap-2">
          <input
            type="text"
            className="input flex-1 uppercase"
            placeholder="Enter code (e.g., SAVE20)"
            value={discountCode}
            onChange={(e) => onCodeChange(e.target.value.toUpperCase())}
            disabled={validating}
          />
          <button
            type="button"
            onClick={onApply}
            disabled={validating || !discountCode.trim()}
            className="btn-secondary shrink-0"
          >
            {validating ? (
              <span className="flex items-center gap-2">
                <Spinner />
                Checking…
              </span>
            ) : (
              'Apply'
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-(--radius-ctl) bg-accent-tint p-3.5">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent">
              <Check className="h-4 w-4 text-white" />
            </span>
            <div>
              <p className="text-sm font-semibold text-accent-dark">{appliedDiscount.code} applied</p>
              {appliedDiscount.description && (
                <p className="mt-0.5 text-xs text-accent-dark/80">{appliedDiscount.description}</p>
              )}
              <p className="mt-0.5 text-xs font-medium text-accent-dark">
                You save £{discountAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-(--radius-ctl) p-2 text-accent-dark/70 transition-colors duration-150 hover:bg-surface hover:text-ink"
            aria-label="Remove discount"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {discountError && (
        <p className="mt-2 text-sm font-medium text-red-700">{discountError}</p>
      )}
    </div>
  )
}
