import type { Service } from '@/lib/types'

const categoryDescriptions: Record<string, string> = {
  regular_cleaning: 'Select number of hours and cleaners needed',
  deep_cleaning: 'Select rooms to be cleaned and any extras',
  end_of_tenancy: 'Select rooms to be cleaned and any extras',
  windows: 'Exterior window cleaning - enter square footage',
  gardening: 'Select gardening services needed',
  landscaping: 'Professional landscaping services',
  handyman: 'Handyman services for your property',
  waste_removal: 'Waste and junk removal services',
}

export type CategorySectionProps = {
  services: Service[]
  description: string
  showExtras: boolean
  extrasStartIndex: number
}

/**
 * Shared between /book and the admin CreateBookingTab: given a selected
 * top-level category, work out what ServiceSection should render.
 * Parent categories with their own price/time render as a single nested
 * selector; otherwise the children are listed directly.
 */
export function buildCategorySection(selectedCategory: Service): CategorySectionProps {
  const childServices = selectedCategory.children || []
  const showExtras =
    selectedCategory.category_type === 'deep_cleaning' ||
    selectedCategory.category_type === 'end_of_tenancy'

  const services: Service[] = []
  if (selectedCategory.price > 0 || selectedCategory.time_minutes > 0) {
    // Children are rendered by NestedServiceSelector when expanded
    services.push(selectedCategory)
  } else if (childServices.length > 0) {
    services.push(...childServices)
  }
  if (services.length === 0) {
    services.push(selectedCategory)
  }

  const extrasStartIndex =
    showExtras && services[0]?.id === selectedCategory.id ? 1 : showExtras ? 8 : 0

  return {
    services,
    description: categoryDescriptions[selectedCategory.category_type || ''] || '',
    showExtras,
    extrasStartIndex,
  }
}
