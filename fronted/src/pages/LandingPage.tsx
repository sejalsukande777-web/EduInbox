import { Link } from 'react-router-dom'
import { BookOpen, Zap, Shield, Search, Bell, BarChart3, ArrowRight, Check, GraduationCap } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-surface-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="font-display font-700 text-surface-900 text-lg">EduInbox AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-surface-600">Sign in</Link>
            <Link to="/login" className="btn-primary">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-purple-50 pointer-events-none" />
        <div className="absolute top-20 left-1/3 w-96 h-96 bg-brand-200 rounded-full blur-3xl opacity-20 pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 rounded-full px-4 py-1.5 text-sm font-medium mb-8 border border-brand-200">
            <Zap size={14} />
            AI-powered for every learner
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-800 text-surface-950 mb-6 leading-[1.05]">
            Your academic inbox,
            <br />
            <span className="text-brand-500">finally organized.</span>
          </h1>

          <p className="text-xl text-surface-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            EduInbox AI connects to your Gmail and automatically sorts lecture notes, assignments, 
            announcements, and deadlines — for any course, any college, any learner.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login" className="btn-primary text-base px-8 py-3.5">
              Connect your inbox
              <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn-secondary text-base px-8 py-3.5">
              See how it works
            </a>
          </div>

          <p className="text-sm text-surface-400 mt-4">
            Works for Engineering · Commerce · Arts · MBA · Certifications · Coaching classes
          </p>
        </div>

        {/* Dashboard preview mockup */}
        <div className="max-w-5xl mx-auto mt-16 relative animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="card overflow-hidden shadow-2xl border-surface-200">
            <div className="bg-surface-950 px-5 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-surface-500 text-xs ml-2 font-mono">eduinbox.ai/app</span>
            </div>
            <div className="bg-surface-50 p-6 grid grid-cols-4 gap-4">
              {[
                { label: 'Notes', value: 47, color: 'bg-blue-500' },
                { label: 'Assignments', value: 12, color: 'bg-orange-500' },
                { label: 'Announcements', value: 8, color: 'bg-purple-500' },
                { label: 'Deadlines', value: 3, color: 'bg-red-500' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-4 border border-surface-200">
                  <div className={`w-8 h-1.5 ${stat.color} rounded mb-3`} />
                  <div className="text-2xl font-display font-700 text-surface-900">{stat.value}</div>
                  <div className="text-xs text-surface-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-700 text-surface-900 mb-4">
              Everything in one place
            </h2>
            <p className="text-lg text-surface-500 max-w-xl mx-auto">
              No more digging through hundreds of emails to find that one assignment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {[
              {
                icon: <BookOpen className="text-blue-600" />,
                title: 'Smart categorization',
                desc: 'AI automatically sorts emails into Notes, Assignments, Announcements, Events, and Resources.',
              },
              {
                icon: <Search className="text-brand-600" />,
                title: 'Natural language search',
                desc: '"Show all accounting notes" or "Find assignments from March" — just ask.',
              },
              {
                icon: <Bell className="text-orange-600" />,
                title: 'Deadline detection',
                desc: 'AI extracts exam dates and submission deadlines and reminds you before they pass.',
              },
              {
                icon: <Shield className="text-green-600" />,
                title: 'Privacy first',
                desc: 'We only request read-only Gmail access. Your passwords are never stored.',
              },
              {
                icon: <BarChart3 className="text-purple-600" />,
                title: 'Timeline & analytics',
                desc: 'See your academic activity chronologically. Filter by source, date, or category.',
              },
              {
                icon: <Zap className="text-yellow-600" />,
                title: 'Source discovery',
                desc: 'Automatically finds your professors, institutes, and course platforms. You decide what to track.',
              },
            ].map((f) => (
              <div key={f.title} className="card-hover p-6 animate-slide-up">
                <div className="w-10 h-10 bg-surface-50 rounded-xl flex items-center justify-center mb-4 border border-surface-100">
                  {f.icon}
                </div>
                <h3 className="font-display font-600 text-surface-900 mb-2">{f.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learner types */}
      <section className="py-20 px-6 bg-surface-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-700 text-surface-900 mb-4">Built for every learner</h2>
          <p className="text-surface-500 mb-12">No assumptions about your subjects — EduInbox adapts to your inbox.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Engineering students', 'Commerce & MBA', 'Arts & Humanities', 'Certification learners',
              'Coaching class students', 'Online course takers', 'PhD researchers', 'Bootcamp students'].map((t) => (
              <span key={t} className="px-4 py-2 bg-white border border-surface-200 rounded-full text-sm text-surface-700 font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-brand-500">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-display font-700 text-white mb-4">
            Stop missing important emails
          </h2>
          <p className="text-brand-200 text-lg mb-8">
            Connect your Gmail in 60 seconds. Free to use.
          </p>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-600 rounded-xl font-display font-600 text-base hover:bg-brand-50 transition-colors">
            Get started for free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-surface-950 text-center">
        <p className="text-surface-500 text-sm">
          © 2026 EduInbox AI · Built with ♥ for learners everywhere
        </p>
      </footer>
    </div>
  )
}
