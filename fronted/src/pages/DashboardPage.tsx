import { useAuthStore } from '../store/authStore'
import { useDashboardStats, useRecentActivity, useDeadlines } from '../hooks'
import { StatsCards, RecentActivity, DeadlineWidget, CategoryChart } from '../components/dashboard'
import { PageHeader } from '../components/ui'

export function DashboardPage() {
  const user = useAuthStore(s => s.user)
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activity, isLoading: activityLoading } = useRecentActivity(8)
  const { data: deadlines, isLoading: deadlinesLoading } = useDeadlines()

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] ?? 'there'} 👋`}
        description="Here's what's happening with your academic inbox."
      />
      <StatsCards stats={stats} loading={statsLoading} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentActivity items={activity} loading={activityLoading} />
        </div>
        <div className="space-y-4">
          <DeadlineWidget deadlines={deadlines} loading={deadlinesLoading} />
          <CategoryChart stats={stats} />
        </div>
      </div>
    </div>
  )
}