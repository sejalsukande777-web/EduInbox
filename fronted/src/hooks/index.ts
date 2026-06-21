import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, emailsApi, analyticsApi, sourcesApi, searchApi, gmailApi, attachmentsApi } from '../lib/api'
import { SearchRequest } from '../types'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => analyticsApi.dashboard().then(r => r.data),
    staleTime: 1000 * 60,
  })
}

export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ['activity', limit],
    queryFn: () => analyticsApi.activity(limit).then(r => r.data),
  })
}

export function useTimeline(days = 30, sourceId?: string, category?: string) {
  return useQuery({
    queryKey: ['timeline', days, sourceId, category],
    queryFn: () => analyticsApi.timeline({ days, source_id: sourceId, category }).then(r => r.data),
  })
}

export function useDeadlines() {
  return useQuery({
    queryKey: ['deadlines'],
    queryFn: () => analyticsApi.deadlines().then(r => r.data),
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => analyticsApi.notifications().then(r => r.data),
    refetchInterval: 1000 * 30,
  })
}

export function useEmails(params?: { category?: string; source_id?: string; page?: number }) {
  return useQuery({
    queryKey: ['emails', params],
    queryFn: () => emailsApi.list(params).then(r => r.data),
  })
}

export function useEmail(id: string) {
  return useQuery({
    queryKey: ['email', id],
    queryFn: () => emailsApi.get(id).then(r => r.data),
    enabled: !!id,
  })
}

export function useSources() {
  return useQuery({
    queryKey: ['sources'],
    queryFn: () => sourcesApi.list().then(r => r.data),
  })
}

export function useDiscoverSources() {
  return useQuery({
    queryKey: ['discover-sources'],
    queryFn: () => gmailApi.discover().then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

export function useSelectSources() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: object) => sourcesApi.select(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sources'] }),
  })
}

export function useUpdateSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) => sourcesApi.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sources'] }),
  })
}

export function useDeleteSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => sourcesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sources'] }),
  })
}

export function useAddCustomSource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: object) => sourcesApi.addCustom(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sources'] }),
  })
}

export function useSearch() {
  return useMutation({
    mutationFn: (body: Partial<SearchRequest>) => searchApi.search(body).then(r => r.data),
  })
}

export function useAttachments(params?: { file_type?: string }) {
  return useQuery({
    queryKey: ['attachments', params],
    queryFn: () => attachmentsApi.list(params).then(r => r.data),
  })
}

export function useSyncStatus() {
  return useQuery({
    queryKey: ['sync-status'],
    queryFn: () => gmailApi.getSyncStatus().then(r => r.data),
    refetchInterval: (data: any) => (data?.status === 'running' ? 2000 : false),
  })
}

export function useTriggerSync() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => gmailApi.triggerSync(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sync-status'] })
    },
  })
}

export function useMarkNotifsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/analytics/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
