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
          <div class="notifications-empty">Brak nadchodzących lekcji 🗓️</div>
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
import { computed, inject } from 'vue'
import { useMessaging } from '@/composables/useMessaging.js'

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
  background: rgba(255, 255, 255, 0.92);
  border-radius: 36px;
  border: 1px solid rgba(148, 163, 184, 0.18);
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
  color: #111827;
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
  gap: 8px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  padding: 22px 24px;
  color: #0f172a;
  text-align: left;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
  cursor: pointer;
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
  color: #1f2937;
}

.panel-secondary {
  background: rgba(241, 245, 249, 0.92);
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
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.74);
  padding: 4px 0;
  overflow: hidden;
  transition:
    background 0.18s ease,
    border-color 0.18s ease;
}

.lessons-panel .panel-content-window:hover,
.notifications-panel .panel-content-window:hover {
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(79, 117, 199, 0.2);
}

.notifications-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 100%;
  overflow-y: auto;
}

.notifications-list li {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  border-bottom: 1px solid rgba(241, 245, 249, 0.9);
  transition: background 0.15s ease;
}

.notifications-list li:hover {
  background: rgba(239, 246, 255, 0.9);
}

.notifications-list li.unread {
  background: rgba(239, 247, 255, 0.96);
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
  color: #1f2937;
  font-weight: 600;
  line-height: 1.5;
}

.notif-time {
  font-size: 0.85rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}

.notifications-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
  color: #64748b;
  font-size: 0.95rem;
}

.lessons-panel .panel-content-window {
  transition:
    background 0.18s ease,
    border-color 0.18s ease;
}

.lessons-panel:hover .panel-content-window {
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(79, 117, 199, 0.2);
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
