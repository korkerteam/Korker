To klasyczny i bardzo częsty problem z tzw. **propagacją zdarzeń (event propagation)** w JavaScript!
🤦‍♂️ Czuję Twój ból, to potrafi zirytować. ### Dlaczego tak się działo? Gdy klikałeś w powiadomienie,
działy się dwie rzeczy jednocześnie w ułamku sekundy: 1. Kliknięcie odpalało funkcję otwierającą
czat (`showChat = true`). 2. To samo kliknięcie "leciało" dalej w górę do samego dokumentu
(`document`). Tam globalny detektor kliknięcia poza czatem (`onClickOutside`) stwierdzał: *"O,
użytkownik kliknął coś, co nie jest czatem! Zamykam czat!"* i natychmiast go ukrywał. ### Jak to
naprawiliśmy? Dodaliśmy modyfikator **`@click.stop`** (odpowiednik `event.stopPropagation()`) do
elementu listy powiadomień oraz do całego menu powiadomień. Dzięki temu kliknięcie w powiadomienie
"zatrzymuje się" w miejscu i nie informuje reszty strony, zapobiegając uruchomieniu autozamykania
czatu. Oto poprawiony, kompletny kod do pliku **`HomePage.vue`**. Podmień go, a czat pozostanie
otwarty jak skała! 🧱 ```vue
<template>
  <div class="home-shell">
    <div class="dashboard-top">
      <div>
        <p class="dashboard-welcome">Witamy w Korker</p>
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

            <div v-if="notifications.length === 0" class="notifications-empty">
              Brak nowych powiadomień 🎉
            </div>

            <ul v-else class="notifications-list">
              <!-- Dodano @click.stop, co rozwiązuje problem natychmiastowego zamykania -->
              <li
                v-for="notif in notifications"
                :key="notif.id"
                class="unread"
                @click.stop="handleNotificationClick(notif.id)"
              >
                <div class="notif-status-dot"></div>
                <div class="notif-info">
                  <p class="notif-text">{{ notif.text }}</p>
                  <span class="notif-time">{{ notif.lastMessage }}</span>
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

const { conversations } = useMessaging()

const { openChatWithUser } = inject('globalChat', {
  openChatWithUser: () => {},
})

const isLessonsModalOpen = ref(false)
const isNotificationsOpen = ref(false)
const notifWrapper = ref(null)

const notifications = computed(() => {
  return conversations.value
    .filter((c) => c.unread > 0)
    .map((c) => {
      const senderName = c.name || c.senderName || c.username || 'Użytkownik'
      const lastMsgText =
        typeof c.lastMessage === 'string'
          ? c.lastMessage
          : c.lastMessage?.content || 'Wysłał(a) wiadomość...'

      return {
        id: c.userId || c.id,
        text: `Nowa wiadomość od: ${senderName}`,
        lastMessage: lastMsgText,
      }
    })
})

const unreadCount = computed(() => notifications.value.length)

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value
}

const handleNotificationClick = (userId) => {
  openChatWithUser(userId)
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
  gap: 24px;
  width: 100%;
  min-height: 100%;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

.dashboard-top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 26px 28px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  position: relative;
}

.dashboard-welcome {
  margin: 0 0 6px;
  color: #4f75c7;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.dashboard-title {
  margin: 0;
  font-size: clamp(24px, 2.2vw, 32px);
  line-height: 1.1;
  color: #0f172a;
}

.dashboard-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.dashboard-action {
  border: none;
  border-radius: 16px;
  background: #2563eb;
  color: white;
  padding: 12px 20px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dashboard-action:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(37, 99, 235, 0.18);
}

.action-secondary {
  background: #f1f5f9;
  color: #1e293b;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.action-secondary:hover {
  background: #e2e8f0;
  box-shadow: none;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.dashboard-card {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 26px;
  padding: 24px;
  box-shadow: 0 22px 40px rgba(15, 23, 42, 0.07);
}

.clickable-card {
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.clickable-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 26px 46px rgba(15, 23, 42, 0.1);
}

.dashboard-card h3 {
  margin: 0 0 14px;
  font-size: 18px;
  color: #0f172a;
}

.dashboard-card p,
.dashboard-card span {
  color: #475569;
  font-size: 14px;
}

.dashboard-card ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 14px;
}

.dashboard-card li {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.dashboard-card li:last-child {
  border-bottom: none;
}

.dashboard-card strong {
  color: #111827;
}

/* DROPDOWN POWIADOMIEŃ */
.notifications-wrapper {
  position: relative;
}

.notif-badge {
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.notifications-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 320px;
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 20px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.15);
  z-index: 100;
  overflow: hidden;
  animation: slideIn 0.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.dropdown-header h4 {
  margin: 0;
  font-size: 16px;
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
  padding: 14px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.15s;
}

.notifications-list li:hover {
  background: #f8fafc;
}

.notifications-list li.unread {
  background: #f0f7ff;
}

.notif-status-dot {
  width: 8px;
  height: 8px;
  background: #2563eb;
  border-radius: 50%;
  margin-top: 6px;
}

.notif-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notif-text {
  margin: 0;
  font-size: 13px;
  color: #1e293b;
  font-weight: 600;
  line-height: 1.4;
}

.notif-time {
  font-size: 11px;
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
  font-size: 14px;
}

/* OKNO MODALNE TERMINARZA */
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
  background: white;
  width: 100%;
  max-width: 550px;
  border-radius: 28px;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.25);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 30px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #0f172a;
}

.close-modal-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #64748b;
  cursor: pointer;
}

.close-modal-btn:hover {
  color: #0f172a;
}

.modal-body {
  padding: 30px;
  max-height: 400px;
  overflow-y: auto;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline-item {
  display: flex;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.timeline-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.timeline-icon {
  font-size: 20px;
  background: #eff6ff;
  width: 44px;
  height: 44px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
}

.timeline-details h4 {
  margin: 0 0 4px;
  font-size: 16px;
  color: #0f172a;
}

.timeline-details .teacher {
  margin: 0 0 8px;
  font-size: 13px;
  color: #475569;
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.timeline-meta .time {
  font-size: 13px;
  color: #64748b;
}

.status-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 8px;
  text-transform: uppercase;
}

.status-badge.upcoming {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.confirmed {
  background: #dcfce7;
  color: #15803d;
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

```
