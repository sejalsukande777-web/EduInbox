// ConnectGmail.tsx
import { useNavigate } from 'react-router-dom'
import { Mail, Shield, Eye, Lock } from 'lucide-react'
import { authApi } from '../lib/api'

export function ConnectGmail() {
  const navigate = useNavigate()

  const handleConnect = async () => {
    const { data } = await authApi.getGoogleUrl()
    window.location.href = data.url
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full animate-slide-up">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="text-blue-600" size={28} />
          </div>
          <h1 className="text-2xl font-display font-700 text-surface-900 mb-3">Connect your Gmail</h1>
          <p className="text-surface-500 mb-8 leading-relaxed">
            EduInbox needs read-only access to your Gmail to find and organize your academic emails.
          </p>

          <div className="space-y-3 mb-8 text-left">
            {[
              { icon: <Eye size={16} />, text: 'Read email metadata and content' },
              { icon: <Shield size={16} />, text: 'Read-only — we never send or delete emails' },
              { icon: <Lock size={16} />, text: 'Your Gmail password is never stored' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-surface-600">
                <div className="text-brand-500 flex-shrink-0">{icon}</div>
                {text}
              </div>
            ))}
          </div>

          <button onClick={handleConnect} className="btn-primary w-full justify-center py-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.638-.057-1.252-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="white" fillOpacity="0.9"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="white" fillOpacity="0.9"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="white" fillOpacity="0.9"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="white" fillOpacity="0.9"/>
            </svg>
            Connect Gmail Account
          </button>
        </div>
      </div>
    </div>
  )
}
