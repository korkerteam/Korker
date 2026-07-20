<template>
  <div class="home-shell">
    <div class="dashboard-top">
      <div>
        <p class="dashboard-welcome">Witamy w Kirker</p>
        <h2 class="dashboard-title">Znajdź korepetytora w kilka sekund</h2>
      </div>
    </div>

    <div class="dashboard-panels">
      <div class="dashboard-panel lessons-panel">
        <div class="panel-header">
          <div class="panel-text-block">
            <span class="panel-label">Najbliższe lekcje</span>
            <span class="panel-value">Sprawdź nadchodzące spotkania</span>
          </div>
        </div>

        <div class="panel-content-window">
          <div v-if="upcomingLoading" class="notifications-empty">Ładowanie...</div>
          <div v-else-if="upcomingLessons.length === 0" class="notifications-empty">
            Brak nadchodzących lekcji 🗓️
          </div>
          <div v-else class="home-lessons-list">
            <div class="home-lesson-featured">
              <div class="hl-top">
                <strong class="hl-name-featured">{{ getOtherName(upcomingLessons[0]) }}</strong>
                <span v-if="getOtherSubject(upcomingLessons[0])" class="hl-subject-featured">{{
                  getOtherSubject(upcomingLessons[0])
                }}</span>
              </div>
              <div class="hl-slots">
                <span
                  v-for="slot in slotLabelsFromMasks(upcomingLessons[0].requested_slots)"
                  :key="slot.day + slot.time"
                  class="hl-chip-featured"
                >
                  <span class="hl-chip-day">{{ slot.day }}</span>
                  <span class="hl-chip-time">{{ slot.time }}</span>
                </span>
              </div>
            </div>
            <div
              v-for="lesson in upcomingLessons.slice(1, 3)"
              :key="lesson.id"
              class="home-lesson-compact"
            >
              <div class="hl-top">
                <strong class="hl-name-compact">{{ getOtherName(lesson) }}</strong>
                <span v-if="getOtherSubject(lesson)" class="hl-subject-compact">{{
                  getOtherSubject(lesson)
                }}</span>
              </div>
              <div class="hl-slots">
                <span
                  v-for="slot in slotLabelsFromMasks(lesson.requested_slots)"
                  :key="slot.day + slot.time"
                  class="hl-chip-compact"
                >
                  {{ slot.day }} {{ slot.time }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dashboard-panel panel-secondary notifications-panel">
        <div class="panel-header">
          <div class="panel-text-block">
            <span class="panel-label">Powiadomienia</span>
            <span class="panel-value">
              {{ unreadCount > 0 ? `${unreadCount} nowe` : 'Brak nowych' }}
            </span>
          </div>
          <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
        </div>

        <div class="panel-content-window">
          <div v-if="notificationsToShow.length === 0" class="notifications-empty">
            Brak nowych powiadomień 🎉
          </div>

          <ul v-else class="notifications-list">
            <li
              v-for="notif in notificationsToShow"
              :key="notif.id"
              class="unread"
              @click.stop="handleNotificationClick(notif.id, notif.senderId)"
            >
              <div class="notif-status-dot"></div>
              <div class="notif-info">
                <p class="notif-text">{{ notif.sender }}: {{ notif.message }}</p>
                <span class="notif-time">{{ notif.time }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, inject, watch } from 'vue'
import { supabase } from '@/lib/supabase.js'
import { useAuth } from '@/composables/useAuth.js'
import { useMessaging } from '@/composables/useMessaging.js'

const { isAuthenticated, profileData, user } = useAuth()
const { conversations, notifications, markNotificationRead } = useMessaging()

const { openChatWithUser } = inject('globalChat', {
  openChatWithUser: () => {},
})

const notificationsToShow = computed(() => {
  const pendingFromChat = (notifications.value || []).filter((notif) => !notif.isRead)
  const pendingFromConversations = (conversations.value || [])
    .filter((c) => c.unread > 0)
    .map((c) => ({
      id: c.userId,
      senderId: c.userId,
      sender: c.name || 'Użytkownik',
      message: c.lastMessage || 'Nowa wiadomość...',
      time: c.lastTimeLabel || 'Teraz',
      isRead: false,
    }))

  const merged = new Map()

  const upsert = (entry) => {
    if (!entry?.senderId) return

    const existing = merged.get(entry.senderId)
    if (!existing) {
      merged.set(entry.senderId, { ...entry })
      return
    }

    merged.set(entry.senderId, {
      ...existing,
      ...entry,
      id: entry.id ?? existing.id,
      sender: entry.sender || existing.sender,
      message: entry.message || existing.message,
      time: entry.time || existing.time,
      isRead: existing.isRead || entry.isRead,
    })
  }

  pendingFromConversations.forEach(upsert)
  pendingFromChat.forEach((notif) => {
    upsert({
      id: notif.id,
      senderId: notif.senderId,
      sender: notif.sender,
      message: notif.message,
      time: notif.time,
      isRead: notif.isRead,
    })
  })

  return Array.from(merged.values())
})

const unreadCount = computed(() => notificationsToShow.value.length)

const isTutorAccount = computed(() => {
  const p = profileData.value
  const t = [p?.account_type, p?.accountType].find(Boolean)
  return `${t || ''}`.toLowerCase().includes('tutor')
})

const upcomingLessons = ref([])
const upcomingLoading = ref(false)
const otherUsers = ref({})

function slotLabelsFromMasks(masks) {
  const dayKeys = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']
  const labels = []
  if (!Array.isArray(masks)) return labels
  for (let di = 0; di < masks.length; di++) {
    const mask = masks[di]
    if (typeof mask === 'number' && mask > 0) {
      for (let h = 0; h < 24; h++) {
        if (mask & (1 << h)) {
          labels.push({ day: dayKeys[di], time: `${String(h).padStart(2, '0')}:00` })
        }
      }
    }
  }
  return labels
}

async function fetchUpcomingLessons() {
  if (!user.value) return
  upcomingLoading.value = true

  const column = isTutorAccount.value ? 'tutor_id' : 'student_id'
  const { data, error } = await supabase
    .from('lesson_requests')
    .select('*')
    .eq(column, user.value.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch upcoming lessons:', error)
    upcomingLessons.value = []
    upcomingLoading.value = false
    return
  }

  upcomingLessons.value = data || []

  const otherIds = new Set()
  for (const r of data || []) {
    otherIds.add(isTutorAccount.value ? r.student_id : r.tutor_id)
  }

  if (otherIds.size > 0) {
    const { data: profiles } = await supabase
      .from('users')
      .select('*')
      .in('auth_id', [...otherIds])

    const map = {}
    for (const p of profiles || []) {
      map[p.auth_id] = p
    }
    otherUsers.value = map
  }

  upcomingLoading.value = false
}

function getOtherName(entry) {
  const authId = isTutorAccount.value ? entry.student_id : entry.tutor_id
  const p = otherUsers.value[authId]
  if (!p) return 'Ładowanie...'
  return p.nickname || [p.name, p.surname].filter(Boolean).join(' ') || 'Nieznany'
}

function getOtherSubject(entry) {
  const authId = isTutorAccount.value ? entry.student_id : entry.tutor_id
  const p = otherUsers.value[authId]
  return p?.tutor_post?.subject || ''
}

watch(
  () => user.value,
  (u) => {
    if (u) fetchUpcomingLessons()
  },
  { immediate: true },
)

watch(
  () => profileData.value,
  () => {
    if (user.value) fetchUpcomingLessons()
  },
)

const handleNotificationClick = (notificationId, senderId) => {
  openChatWithUser(senderId)
  markNotificationRead(notificationId)
}
</script>

<style scoped>
.home-shell {
  display: grid;
  gap: 26px;
  width: 100%;
  min-height: calc(100vh - 220px);
  padding-bottom: 10px;
}

.dashboard-top {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  padding: 32px 36px;
  background: var(--surface-strong);
  border-radius: 36px;
  border: 1px solid var(--border);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(18px);
}

:root[data-contrast='high'] .dashboard-top {
  border-color: #000000;
}

:root[data-theme='dark'][data-contrast='high'] .dashboard-top {
  border-color: #ffffff;
}

.dashboard-welcome {
  margin: 0 0 10px;
  color: var(--accent-strong);
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.dashboard-title {
  margin: 0;
  font-size: clamp(2.4rem, 3vw, 3.5rem);
  line-height: 1.02;
  color: var(--text-strong);
}

.dashboard-panels {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.dashboard-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  border: 1px solid var(--border);
  border-radius: 24px;
  background: var(--surface);
  padding: 22px 24px;
  color: var(--text);
  text-align: left;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
  min-height: 260px;
  height: 100%;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.panel-label {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--accent-strong);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.panel-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-strong);
}

.panel-secondary {
  background: var(--surface-muted);
  position: relative;
  justify-content: flex-start;
  cursor: default;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.lessons-panel {
  justify-content: flex-start;
  background: var(--surface-muted);
  gap: 14px;
}

.lessons-panel .panel-label {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.lessons-panel .panel-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--muted);
}

.notifications-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  flex-shrink: 0;
}

.panel-text-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  text-align: left;
}

.notif-badge {
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
}

.dashboard-card:first-child {
  grid-column: 1 / -1;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 32px;
  padding: 28px;
  box-shadow: 0 26px 60px rgba(15, 23, 42, 0.08);
}

:root[data-contrast='high'] .dashboard-card {
  border-color: #000000;
}

:root[data-theme='dark'][data-contrast='high'] .dashboard-card {
  border-color: #ffffff;
}

.clickable-card {
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.clickable-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 32px 70px rgba(15, 23, 42, 0.12);
}

.dashboard-card h3 {
  margin: 0 0 18px;
  font-size: 1.12rem;
  color: #111827;
}

.dashboard-card p,
.dashboard-card span {
  color: #475569;
  font-size: 0.96rem;
}

.dashboard-card ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 16px;
}

.dashboard-card li {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.dashboard-card li:last-child {
  border-bottom: none;
}

.dashboard-card strong {
  color: #111827;
}

.panel-content-window {
  flex: 1;
  min-height: 0;
  width: 100%;
  border-radius: 20px;
  border: 1px solid var(--border-soft);
  background: var(--surface-strong);
  padding: 4px 0;
  overflow: hidden;
  margin-top: 2px;
}

.notifications-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 100%;
  overflow-y: auto;
  background: transparent;
}

.notifications-list li {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-soft);
  transition: background 0.15s ease;
}

.notifications-list li:hover {
  background: var(--surface-hover);
}

.notifications-list li.unread {
  background: var(--accent-soft);
}

.notif-status-dot {
  width: 10px;
  height: 10px;
  background: var(--accent-strong);
  border-radius: 50%;
  margin-top: 6px;
}

.notif-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notif-text {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-strong);
  font-weight: 600;
  line-height: 1.5;
}

.notif-time {
  font-size: 0.85rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}

.home-lessons-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px 10px;
}

.home-lesson-featured {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: 18px;
  background: var(--accent-soft);
  border: 1px solid var(--accent);
  margin-bottom: 2px;
}

.home-lesson-compact {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
}

.hl-top {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.hl-name-featured {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text);
}

.hl-subject-featured {
  font-size: 0.9rem;
  color: var(--accent-strong);
  font-weight: 600;
}

.hl-name-compact {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
}

.hl-subject-compact {
  font-size: 0.8rem;
  color: var(--accent-strong);
  font-weight: 600;
}

.hl-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.hl-chip-featured {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: var(--primary-color);
  color: white;
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
}

.hl-chip-compact {
  background: var(--surface-soft);
  color: var(--muted);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid var(--border);
}

.hl-chip-day {
  font-size: 0.72rem;
  text-transform: uppercase;
}

.hl-chip-time {
  font-weight: 700;
}

.notifications-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  width: 100%;
  max-width: 560px;
  border-radius: 32px;
  box-shadow: 0 36px 90px rgba(15, 23, 42, 0.18);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 30px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #111827;
}

.close-modal-btn {
  background: none;
  border: none;
  font-size: 30px;
  color: #64748b;
  cursor: pointer;
}

.close-modal-btn:hover {
  color: #111827;
}

.modal-body {
  padding: 32px;
  max-height: 420px;
  overflow-y: auto;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.timeline-item {
  display: flex;
  gap: 18px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.timeline-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.timeline-icon {
  font-size: 22px;
  background: #eff6ff;
  width: 48px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 16px;
}

.timeline-details h4 {
  margin: 0 0 6px;
  font-size: 1rem;
  color: #111827;
}

.timeline-details .teacher {
  margin: 0 0 10px;
  font-size: 0.96rem;
  color: #475569;
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.timeline-meta .time {
  font-size: 0.95rem;
  color: #64748b;
}

.status-badge {
  font-size: 0.82rem;
  font-weight: 700;
  padding: 6px 10px;
  border-radius: 999px;
  text-transform: uppercase;
}

.status-badge.upcoming {
  background: #fef3c7;
  color: #b45309;
}

.status-badge.confirmed {
  background: #dcfce7;
  color: #166534;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
