export type EmailCategory = 'notes' | 'assignments' | 'announcements' | 'events' | 'resources' | 'other'

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  gmail_connected: boolean
  created_at: string
}

export interface LearningSource {
  id: string
  name: string
  sender_patterns: string[]
  is_active: boolean
  is_custom: boolean
  email_count: number
  detected_at: string
}

export interface DiscoveredSource {
  name: string
  sender_patterns: string[]
  email_count: number
  sample_subject: string | null
}

export interface Attachment {
  id: string
  filename: string
  file_type: string | null
  mime_type: string | null
  size_bytes: number | null
  storage_url: string | null
  created_at: string
}

export interface Email {
  id: string
  gmail_id: string
  subject: string | null
  sender: string | null
  sender_email: string | null
  snippet: string | null
  category: EmailCategory
  ai_confidence: number | null
  ai_summary: string | null
  detected_deadlines: Array<{ title: string; date_text: string; type: string }>
  received_at: string | null
  is_read: boolean
  source_id: string | null
  attachments: Attachment[]
}

export interface DashboardStats {
  total_notes: number
  total_assignments: number
  total_announcements: number
  total_events: number
  total_resources: number
  total_emails: number
  total_attachments: number
  upcoming_deadlines: number
  new_today: number
  sources_active: number
}

export interface TimelineItem {
  date: string
  items: Array<{
    id: string
    subject: string | null
    category: EmailCategory
    sender: string | null
    source_name: string | null
    received_at: string
  }>
}

export interface Deadline {
  id: string
  title: string
  deadline_date: string | null
  deadline_type: string | null
  source_name: string | null
  is_completed: boolean
  email_id: string | null
  created_at: string
}

export interface SearchRequest {
  query: string
  category?: EmailCategory
  source_id?: string
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}

export interface SearchResult {
  email_id: string
  subject: string | null
  snippet: string | null
  sender: string | null
  category: EmailCategory
  received_at: string | null
  source_name: string | null
  matched_attachments: Attachment[]
}

export interface Notification {
  id: string
  title: string | null
  message: string | null
  notification_type: string | null
  is_read: boolean
  created_at: string
}

export const CATEGORY_META: Record<EmailCategory, { label: string; color: string; icon: string }> = {
  notes:         { label: 'Notes',         color: 'blue',   icon: '📝' },
  assignments:   { label: 'Assignments',   color: 'orange', icon: '📋' },
  announcements: { label: 'Announcements', color: 'purple', icon: '📢' },
  events:        { label: 'Events',        color: 'green',  icon: '🗓️' },
  resources:     { label: 'Resources',     color: 'teal',   icon: '📚' },
  other:         { label: 'Other',         color: 'gray',   icon: '📧' },
}