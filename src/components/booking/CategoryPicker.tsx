import type { Service } from '@/lib/types'
import {
  Home,
  Sparkles,
  KeyRound,
  AppWindow,
  Leaf,
  Trees,
  Wrench,
  Trash2,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react'

const categoryIcons: Record<string, LucideIcon> = {
  regular_cleaning: Home,
  deep_cleaning: Sparkles,
  end_of_tenancy: KeyRound,
  windows: AppWindow,
  gardening: Leaf,
  landscaping: Trees,
  handyman: Wrench,
  waste_removal: Trash2,
}

type Props = {
  categories: Service[]
  selectedId: string | null
  onSelect: (categoryId: string) => void
}

export function CategoryPicker({ categories, selectedId, onSelect }: Props) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-ink">Service categories (select one)</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => {
          const isSelected = selectedId === category.id
          const Icon = categoryIcons[category.category_type || ''] || ClipboardList
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              aria-pressed={isSelected}
              className={`rounded-(--radius-ctl) border px-4 py-3 text-left transition-colors duration-150 ${
                isSelected
                  ? 'border-accent bg-accent-tint'
                  : 'border-line bg-surface hover:border-ink/30'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isSelected ? 'text-accent' : 'text-ink-faint'}`} />
                <span className={`text-sm font-semibold ${isSelected ? 'text-accent-dark' : 'text-ink'}`}>
                  {category.name}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
