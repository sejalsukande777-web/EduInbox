// LoginPage.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Mail } from 'lucide-react'
import { authApi } from '../lib/api'
import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/app')
  }, [isAuthenticated, navigate])

  const handleGoogleLogin = async () => {
    try {
      const { data } = await authApi.getGoogleUrl()
      window.location.href = data.url
    } catch (err) {
      console.error('Failed to get auth URL', err)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-brand-500 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="text-white" size={20} />
          </div>
          <span className="font-display font-700 text-white text-xl">EduInbox AI</span>
        </div>
        <div>
          <h2 className="text-5xl font-display font-700 text-white leading-tight mb-6">
            Never miss an assignment again.
          </h2>
          <div className="space-y-4">
            {['AI-powered email categorization', 'Auto-detects your learning sources', 'Smart deadline extraction', 'Works for any course or college'].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="text-brand-100 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-brand-300 text-sm">For engineering, commerce, arts, MBA, and certification learners.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white" size={18} />
            </div>
            <span className="font-display font-700 text-surface-900">EduInbox AI</span>
          </div>

          <h1 className="text-3xl font-display font-700 text-surface-900 mb-2">Welcome back</h1>
          <p className="text-surface-500 mb-8">Sign in to access your academic inbox.</p>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-surface-200 rounded-xl text-surface-700 font-medium hover:bg-surface-50 hover:border-surface-300 transition-all shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.638-.057-1.252-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-surface-400 text-center mt-6 leading-relaxed">
            We only request read-only Gmail access.<br />
            Your password is never stored.
          </p>
        </div>
      </div>
    </div>
  )
}
