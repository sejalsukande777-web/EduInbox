import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { AuthCallback } from './pages/AuthCallback'
import { ConnectGmail } from './pages/ConnectGmail'
import { DiscoverSources } from './pages/DiscoverSources'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { DashboardPage } from './pages/DashboardPage'
import { EmailsPage } from './pages/EmailsPage'
import { TimelinePage } from './pages/TimelinePage'
import { SearchPage } from './pages/Searchpage'
import { AttachmentsPage, SourcesPage, DeadlinesPage } from './pages/extra'
import { EmailDetailPage } from './pages/EmailDetailPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 2, retry: 1 },
  },
})

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function GmailRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user?.gmail_connected) return <Navigate to="/connect-gmail" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="/connect-gmail" element={
            <PrivateRoute><ConnectGmail /></PrivateRoute>
          } />
          <Route path="/discover-sources" element={
            <PrivateRoute><DiscoverSources /></PrivateRoute>
          } />

          <Route path="/app" element={
            <PrivateRoute>
              <GmailRoute>
                <DashboardLayout />
              </GmailRoute>
            </PrivateRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="emails" element={<EmailsPage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="attachments" element={<AttachmentsPage />} />
            <Route path="sources" element={<SourcesPage />} />
            <Route path="deadlines" element={<DeadlinesPage />} />
            <Route path="emails/:id" element={<EmailDetailPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
