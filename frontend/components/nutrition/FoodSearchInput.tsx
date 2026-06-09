'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useFoodSearch } from '@/hooks/useNutrition'
import type { FoodSearchResult } from '@/types/nutrition'

function calcFromSearch(food: FoodSearchResult) {
  const w = food.serving_weight_g ?? 100
  return {
    food_name: food.food_name,
    calories: Math.round(((food.calories_per_100g ?? 0) * w) / 100),
    protein_g: food.protein_per_100g != null
      ? parseFloat(((food.protein_per_100g * w) / 100).toFixed(1))
      : null,
    carbs_g: food.carbs_per_100g != null
      ? parseFloat(((food.carbs_per_100g * w) / 100).toFixed(1))
      : null,
    fat_g: food.fat_per_100g != null
      ? parseFloat(((food.fat_per_100g * w) / 100).toFixed(1))
      : null,
  }
}

interface FoodSearchInputProps {
  value: string
  onChange: (value: string) => void
  onSelect: (result: ReturnType<typeof calcFromSearch>) => void
  error?: boolean
}

export function FoodSearchInput({ value, onChange, onSelect, error }: FoodSearchInputProps) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync external value changes (e.g. when a food is selected)
  useEffect(() => {
    setQuery(value)
  }, [value])

  const { data, isFetching } = useFoodSearch(query)
  const results = data?.items ?? []

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  function handleChange(val: string) {
    setQuery(val)
    onChange(val)
    setOpen(val.length >= 2)
  }

  function handleSelect(food: FoodSearchResult) {
    const calc = calcFromSearch(food)
    setQuery(calc.food_name)
    onChange(calc.food_name)
    onSelect(calc)
    setOpen(false)
  }

  function handleClear() {
    setQuery('')
    onChange('')
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder="e.g. Oatmeal, Chicken breast…"
          className={`pl-9 pr-9 ${error ? 'border-destructive' : ''}`}
          autoComplete="off"
        />
        {query ? (
          isFetching ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )
        ) : null}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg overflow-hidden">
          <ul className="max-h-56 overflow-y-auto divide-y">
            {results.map((food, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => handleSelect(food)}
                  className="w-full flex items-start justify-between gap-3 px-3 py-2.5 hover:bg-muted text-left transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{food.food_name}</p>
                    {food.brand && (
                      <p className="text-xs text-muted-foreground truncate">{food.brand}</p>
                    )}
                    {food.serving_description && (
                      <p className="text-xs text-muted-foreground">{food.serving_description}</p>
                    )}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground shrink-0 tabular-nums pt-0.5">
                    {Math.round(((food.calories_per_100g ?? 0) * (food.serving_weight_g ?? 100)) / 100)} kcal
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
