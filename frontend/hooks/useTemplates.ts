import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { templatesApi } from '@/lib/api/templates'
import type { SaveAsTemplateRequest, TemplateCreateRequest } from '@/types/template'

const TEMPLATE_KEYS = {
  all: ['templates'] as const,
  list: () => [...TEMPLATE_KEYS.all, 'list'] as const,
  detail: (id: string) => [...TEMPLATE_KEYS.all, 'detail', id] as const,
}

export function useTemplates() {
  return useQuery({
    queryKey: TEMPLATE_KEYS.list(),
    queryFn: () => templatesApi.list({ limit: 50 }),
    staleTime: 5 * 60 * 1000,
  })
}

export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: TEMPLATE_KEYS.detail(id!),
    queryFn: () => templatesApi.get(id!),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TemplateCreateRequest) => templatesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATE_KEYS.list() })
    },
    onError: () => {
      toast.error('Failed to create template')
    },
  })
}

export function useDeleteTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => templatesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATE_KEYS.list() })
      toast.success('Template deleted')
    },
    onError: () => {
      toast.error('Failed to delete template')
    },
  })
}

export function useSaveAsTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ workoutId, data }: { workoutId: string; data: SaveAsTemplateRequest }) =>
      templatesApi.saveFromWorkout(workoutId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TEMPLATE_KEYS.list() })
      toast.success('Template saved!')
    },
    onError: () => {
      toast.error('Failed to save template')
    },
  })
}
