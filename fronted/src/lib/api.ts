import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, { refresh_token: refresh })
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          error.config.headers.Authorization = `Bearer ${data.access_token}`
          return api.request(error.config)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  getGoogleUrl: () => api.get<{ url: string }>('/auth/google/url'),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refresh: (refresh_token: string) => api.post('/auth/refresh', { refresh_token }),
}

// ── Gmail ──────────────────────────────────────────────────────────────────────
export const gmailApi = {
  getStatus: () => api.get('/gmail/status'),
  discover: () => api.get('/gmail/discover'),
  triggerSync: () => api.post('/gmail/sync'),
  getSyncStatus: () => api.get('/gmail/sync/status'),
}

// ── Sources ───────────────────────────────────────────────────────────────────
export const sourcesApi = {
  list: () => api.get('/sources/'),
  select: (body: object) => api.post('/sources/select', body),
  update: (id: string, body: object) => api.patch(`/sources/${id}`, body),
  delete: (id: string) => api.delete(`/sources/${id}`),
  addCustom: (body: object) => api.post('/sources/custom', body),
}

// ── Emails ────────────────────────────────────────────────────────────────────
export const emailsApi = {
  list: (params?: object) => api.get('/emails/', { params }),
  get: (id: string) => api.get(`/emails/${id}`),
}

// ── Attachments ───────────────────────────────────────────────────────────────
export const attachmentsApi = {
  list: (params?: object) => api.get('/attachments/', { params }),
}

// ── Search ────────────────────────────────────────────────────────────────────
export const searchApi = {
  search: (body: object) => api.post('/search/', body),
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  timeline: (params?: object) => api.get('/analytics/timeline', { params }),
  activity: (limit?: number) => api.get('/analytics/activity', { params: { limit } }),
  deadlines: () => api.get('/analytics/deadlines'),
  notifications: () => api.get('/analytics/notifications'),
}