<template>
  <div class="home-shell">
    <div class="dashboard-top">
      <div>
        <p class="dashboard-welcome">Witamy w Kirker</p>
        <h2 class="dashboard-title">Znajdź korepetytora w kilka sekund</h2>
      </div>
      <div class="dashboard-actions">
        <button class="dashboard-action" @click="openLessonsModal">Najbliższe lekcje</button>

        <!-- Powiadomienia zintegrowane z czatem -->
        <div class="notifications-wrapper" ref="notifWrapper">
          <button class="dashboard-action action-secondary" @click="toggleNotifications">
            Powiadomienia
            <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
          </button>

          <!-- Dropdown powiadomień (dodano @click.stop aby kliknięcia wewnątrz nie zamykały czatu) -->
          <div v-if="isNotificationsOpen" class="notifications-dropdown" @click.stop>
            <div class="dropdown-header">
              <h4>Powiadomienia czatu</h4>
            </div>

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

    <div class="dashboard-grid">
      <article class="dashboard-card clickable-card" @click="openLessonsModal">
        <h3>Najbliższe lekcje</h3>
        <ul>
          <li v-for="lesson in lessons.slice(0, 2)" :key="lesson.id">
            <strong>{{ lesson.subject }} z {{ lesson.teacher }}</strong>
            <span>{{ lesson.date }} o {{ lesson.time }}</span>
          </li>
        </ul>
      </article>

      <article class="dashboard-card">
        <h3>Polecani nauczyciele</h3>
        <p>Sprawdź nauczycieli dopasowanych do Twoich filtrów i preferencji.</p>
      </article>

      <article class="dashboard-card">
        <h3>Ostatnie wiadomości</h3>
        <p>Przeglądaj ostatnie rozmowy i informacje od nauczycieli.</p>
      </article>
    </div>

    <!-- Modal Terminarza -->
    <Transition name="fade">
      <div v-if="isLessonsModalOpen" class="modal-backdrop" @click.self="closeLessonsModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Twój terminarz lekcji</h3>
            <button class="close-modal-btn" @click="closeLessonsModal">&times;</button>
          </div>
          <div class="modal-body">
            <div class="timeline">
              <div v-for="lesson in lessons" :key="lesson.id" class="timeline-item">
                <div class="timeline-icon">📚</div>
                <div class="timeline-details">
                  <h4>{{ lesson.subject }}</h4>
                  <p class="teacher">
                    Nauczyciel: <strong>{{ lesson.teacher }}</strong>
                  </p>
                  <div class="timeline-meta">
                    <span class="time">📅 {{ lesson.date }} | ⏰ {{ lesson.time }}</span>
                    <span :class="['status-badge', lesson.status]">{{ lesson.statusLabel }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useMessaging } from '@/composables/useMessaging.js'

const { conversations, notifications, markNotificationRead } = useMessaging()

const { openChatWithUser } = inject('globalChat', {
  openChatWithUser: () => {},
})

const isLessonsModalOpen = ref(false)
const isNotificationsOpen = ref(false)
const notifWrapper = ref(null)

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

  const combined = [...pendingFromConversations, ...pendingFromChat]
  const unique = new Map()
  for (const notif of combined) {
    if (!unique.has(notif.id)) {
      unique.set(notif.id, notif)
    }
  }
  return Array.from(unique.values())
})

const unreadCount = computed(() => notificationsToShow.value.length)

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value
}

const handleNotificationClick = (notificationId, senderId) => {
  openChatWithUser(senderId)
  markNotificationRead(notificationId)
  isNotificationsOpen.value = false
}

const openLessonsModal = () => {
  isLessonsModalOpen.value = true
  isNotificationsOpen.value = false
}

const closeLessonsModal = () => {
  isLessonsModalOpen.value = false
}

const handleClickOutside = (event) => {
  if (notifWrapper.value && !notifWrapper.value.contains(event.target)) {
    isNotificationsOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const lessons = ref([
  {
    id: 1,
    subject: 'Matematyka',
    teacher: 'Anna Kowalska',
    date: 'Dziś',
    time: '16:00',
    status: 'upcoming',
    statusLabel: 'Wkrótce',
  },
  {
    id: 2,
    subject: 'Fizyka',
    teacher: 'Jan Nowak',
    date: 'Jutro',
    time: '12:30',
    status: 'confirmed',
    statusLabel: 'Potwierdzona',
  },
])
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

.dashboard-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: center;
}

.dashboard-action {
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-hover));
  color: white;
  padding: 14px 24px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 18px 40px rgba(79, 117, 199, 0.18);
}

.dashboard-action:hover {
  background: linear-gradient(135deg, var(--primary-color-hover) 0%, var(--primary-color) 100%);
  transform: translateY(-2px);
}

.action-secondary {
  background: rgba(241, 245, 249, 0.92);
  color: #1f2937;
  border: 1px solid rgba(79, 117, 199, 0.12);
  box-shadow: none;
}

.action-secondary:hover {
  background: rgba(229, 236, 255, 0.92);
  box-shadow: none;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
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

.notifications-wrapper {
  position: relative;
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
}

.notifications-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 320px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24px;
  box-shadow: 0 26px 70px rgba(15, 23, 42, 0.16);
  z-index: 100;
  overflow: hidden;
  backdrop-filter: blur(16px);
  animation: slideIn 0.2s ease-out;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.dropdown-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.notifications-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 280px;
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
  padding: 24px;
  text-align: center;
  color: #64748b;
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
