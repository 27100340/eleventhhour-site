import { ClipboardList, Lock } from 'lucide-react'
import type { Service } from '@/lib/types'

type Row = Service & { qty: number }

type Props = {
  rows: Row[]
  subtotal: number
  discountAmount: number
  discountCode?: string
  total: number
}

export function BookingSummary({ rows, subtotal, discountAmount, discountCode, total }: Props) {
  const chosen = rows.filter((r) => r.qty > 0)

  return (
    <aside className="sticky top-24 h-max rounded-(--radius-card) border border-line bg-surface p-6 shadow-soft">
      <div className="border-b border-line pb-4">
        <h3 className="text-base">Booking summary</h3>
        <p className="mt-1 text-sm text-ink-faint">Review your selected services</p>
      </div>

      <div className="py-4">
        {chosen.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper">
              <ClipboardList className="h-6 w-6 text-ink-faint" />
            </div>
            <p className="mt-4 text-sm text-ink-soft">Select services to see your estimate</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {chosen.map((r) => (
              <li key={r.id} className="border-b border-line pb-3 last:border-b-0 last:pb-0">
                <p className="text-sm font-medium text-ink">{r.name}</p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {r.question_type === 'checkbox' ? 'Selected' : `Quantity: ${r.qty}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {chosen.length > 0 && (
        <>
          <div className="space-y-2.5 border-t border-line pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-soft">Subtotal</span>
              <span className="font-medium text-ink">£{subtotal.toFixed(2)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-accent">
                  Discount{discountCode ? ` (${discountCode})` : ''}
                </span>
                <span className="font-semibold text-accent">-£{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="font-semibold text-ink">Total</span>
              <span className="font-display text-2xl font-semibold text-accent-dark">
                £{total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-5 rounded-(--radius-ctl) bg-accent-tint p-3.5">
            <p className="text-xs leading-relaxed text-accent-dark">
              <strong>Note:</strong> This is an estimate. Final pricing may vary based on specific
              requirements and will be confirmed before service.
            </p>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 border-t border-line pt-4 text-xs text-ink-faint">
            <Lock className="h-3.5 w-3.5" />
            <span>Secured by</span>
            <img src="/stripe.png" alt="Stripe" className="h-4 w-auto" />
          </div>
        </>
      )}
    </aside>
  )
}
