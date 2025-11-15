'use client'

import { useState } from 'react'
import type { Service } from '@/lib/types'
import { NestedServiceSelector } from './NestedServiceSelector'

type Props = {
  category: Service
  items: Record<string, number | string>
  onItemChange: (serviceId: string, value: number | string) => void
  isSelected: boolean
  onSelect: () => void
}

export function CategoryCard({ category, items, onItemChange, isSelected, onSelect }: Props) {
  const getCategoryIcon = (categoryType: string | null | undefined) => {
    switch (categoryType) {
      case 'regular_cleaning':
        return '🏠'
      case 'deep_cleaning':
        return '✨'
      case 'windows':
        return '🪟'
      case 'gardening':
        return '🌿'
      default:
        return '📋'
    }
  }

  const getCategoryDescription = (categoryType: string | null | undefined) => {
    switch (categoryType) {
      case 'regular_cleaning':
        return 'Routine maintenance cleaning for your home'
      case 'deep_cleaning':
        return 'Thorough cleaning for move-ins, move-outs, or deep refresh'
      case 'windows':
        return 'Professional exterior window cleaning'
      case 'gardening':
        return 'Garden maintenance and outdoor services'
      default:
        return 'Select services from this category'
    }
  }

  return (
    <div className="relative">
      {/* Selection Card */}
      {!isSelected ? (
        <button
          type="button"
          onClick={onSelect}
          className="w-full p-6 rounded-2xl border-2 border-brand-stone hover:border-brand-amber hover:bg-brand-amber/5 transition-all duration-200 text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">{getCategoryIcon(category.category_type)}</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-brand-charcoal group-hover:text-brand-amber transition-colors mb-2">
                {category.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                {getCategoryDescription(category.category_type)}
              </p>
              <div className="flex items-center gap-2 text-brand-amber font-semibold text-sm">
                <span>Select this category</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </button>
      ) : (
        /* Expanded Service Selection */
        <div className="p-6 rounded-2xl border-2 border-brand-amber bg-white shadow-soft-lg">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{getCategoryIcon(category.category_type)}</div>
              <div>
                <h3 className="text-xl font-bold text-brand-charcoal">{category.name}</h3>
                <p className="text-gray-600 text-sm">{getCategoryDescription(category.category_type)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onSelect}
              className="text-gray-500 hover:text-red-600 transition-colors p-2"
              title="Deselect category"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Render nested services */}
          <div className="space-y-2">
            {category.children && category.children.length > 0 ? (
              category.children.map((service) => (
                <NestedServiceSelector
                  key={service.id}
                  service={service}
                  items={items}
                  onItemChange={onItemChange}
                />
              ))
            ) : (
              /* Single service (like Windows Outside) */
              <NestedServiceSelector
                service={category}
                items={items}
                onItemChange={onItemChange}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
