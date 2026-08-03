const steps = [
  { n: 1, label: 'Your details' },
  { n: 2, label: 'Services & schedule' },
  { n: 3, label: 'Payment' },
]

export function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-4">
      {steps.map(({ n, label }, i) => {
        const active = current >= n
        return (
          <li key={n} className="flex items-center gap-2 sm:gap-4">
            {i > 0 && <span aria-hidden="true" className="h-px w-6 bg-line sm:w-10" />}
            <span
              className={`flex items-center gap-2 text-sm font-medium transition-colors duration-150 ${
                active ? 'text-ink' : 'text-ink-faint'
              }`}
              aria-current={current === n ? 'step' : undefined}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold tabular-nums transition-colors duration-150 ${
                  active ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-faint'
                }`}
              >
                {n}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
