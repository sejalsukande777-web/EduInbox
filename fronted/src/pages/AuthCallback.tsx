// AuthCallback.tsx
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../lib/api'
import { GraduationCap } from 'lucide-react'

export function AuthCallback() {
  const [params] = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  useEffect(() => {
    const access = params.get('access_token')
    const refresh = params.get('refresh_token')
    if (!access || !refresh) { navigate('/login'); return }

    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)

    authApi.getMe().then(({ data }) => {
      setAuth(data, access, refresh)
      navigate(data.gmail_connected ? '/app' : '/connect-gmail')
    }).catch(() => navigate('/login'))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="text-center animate-fade-in">
        <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="text-white" size={22} />
        </div>
        <p className="text-surface-500">Signing you in…</p>
        <div className="mt-4 flex gap-1 justify-center">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 bg-brand-400 rounded-full animate-pulse-soft" style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
