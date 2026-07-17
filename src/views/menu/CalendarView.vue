<script setup>
import { computed, ref } from 'vue'
import { useAuth } from '@/composables/useAuth.js'

const { isAuthenticated, openAuthModal } = useAuth()

const todayDate = new Date()
const currentDate = ref(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1))
const weekdayLabels = ['Po', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Ni']
const selectedDay = ref(todayDate.getDate())
const today = ref(todayDate.getDate())
const monthNames = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
]

const notifications = ref([
  {
    id: 1,
    student: 'Anna Kowalska',
    topic: 'Angielski - mówienie',
    requestedAt: '18:30 · 18 lipca',
    message: 'Cześć! Chciałabym umówić lekcję na rozmowę i poprawę wymowy.',
    status: 'pending',
  },
  {
    id: 2,
    student: 'Michał Nowak',
    topic: 'Matematyka - funkcje',
    requestedAt: '20:00 · 19 lipca',
    message: 'Czy mogę przyjść na lekcję online w tym tygodniu?',
    status: 'pending',
  },
  {
    id: 3,
    student: 'Kasia Zielińska',
    topic: 'Biologia - genetyka',
    requestedAt: '16:15 · 20 lipca',
    message: 'Mam pytanie dotyczące sprawdzianu i chciałabym zrobić krótkie powtórzenie.',
    status: 'pending',
  },
  {
    id: 4,
    student: 'Piotr Wróbel',
    topic: 'Historia - antyk',
    requestedAt: '19:45 · 21 lipca',
    message: 'Czy da się zrobić lekcję w weekend? Chciałbym uporządkować notatki.',
    status: 'pending',
  },
  {
    id: 5,
    student: 'Ola Janicka',
    topic: 'Chemia - reakcje',
    requestedAt: '17:00 · 22 lipca',
    message: 'Chciałabym szybko przejrzeć zadania domowe przed sprawdzianem.',
    status: 'pending',
  },
  {
    id: 6,
    student: 'Tomasz Krawczyk',
    topic: 'Fizyka - ruch',
    requestedAt: '14:30 · 23 lipca',
    message: 'Czy możemy zrobić lekcję w środę po południu? Potrzebuję pomocy z wykresami.',
    status: 'pending',
  },
])

function formatDateLabel(date) {
  return new Intl.DateTimeFormat('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
    .format(date)
    .replace(/^./, (char) => char.toUpperCase())
}

const monthLabel = computed(() =>
  new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' })
    .format(currentDate.value)
    .replace(/^./, (char) => char.toUpperCase()),
)

const daysInMonth = computed(() => {
  const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 0)
  return date.getDate()
})

const calendarDays = computed(() => {
  const firstDayOfMonth = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth(),
    1,
  ).getDay()
  const leadingEmptyDays = Array.from(
    { length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 },
    (_, index) => ({ type: 'empty', key: `empty-${index}` }),
  )

  const monthDays = Array.from({ length: daysInMonth.value }, (_, index) => ({
    type: 'day',
    value: index + 1,
    key: `day-${index + 1}`,
  }))

  return [...leadingEmptyDays, ...monthDays]
})

const selectedDate = computed(() => {
  return new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), selectedDay.value)
})

const selectedDateLabel = computed(() => formatDateLabel(selectedDate.value))

const selectedWeekdayLabel = computed(() => {
  const jsDay = selectedDate.value.getDay()
  const weekdayIndex = jsDay === 0 ? 6 : jsDay - 1
  return weekdayLabels[weekdayIndex]
})

const pendingNotifications = computed(() =>
  notifications.value.filter((notification) => notification.status === 'pending'),
)

const notificationsCountLabel = computed(() => {
  if (pendingNotifications.value.length === 0) {
    return 'Brak próśb'
  }

  return pendingNotifications.value.length === 1
    ? '1 prośba'
    : `${pendingNotifications.value.length} prośby`
})

function hasLessons(day) {
  return day === selectedDay.value
}

function selectDay(day) {
  selectedDay.value = day
}

function changeMonth(event) {
  const monthIndex = Number(event.target.value)
  currentDate.value = new Date(currentDate.value.getFullYear(), monthIndex, 1)
  if (selectedDay.value > daysInMonth.value) {
    selectedDay.value = daysInMonth.value
  }
}

function goToPreviousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  if (selectedDay.value > daysInMonth.value) {
    selectedDay.value = daysInMonth.value
  }
}

function goToNextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  if (selectedDay.value > daysInMonth.value) {
    selectedDay.value = daysInMonth.value
  }
}

function goToToday() {
  currentDate.value = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1)
  selectedDay.value = today.value
}

function handleNotificationDecision(id, decision) {
  notifications.value = notifications.value.filter((notification) => notification.id !== id)

  if (decision === 'accept') {
    console.info(`Zaakceptowano prośbę o lekcję ${id}`)
  }
}
</script>

<template>
  <section class="calendar-view-simple">
    <div v-if="!isAuthenticated" class="auth-required-card">
      <h3>Aby korzystać z kalendarza</h3>
      <p>Zarejestruj konto lub zaloguj się, żeby zapisywać i przeglądać swoje lekcje.</p>
      <div class="auth-actions">
        <button class="btn-primary" type="button" @click="openAuthModal('login')">
          Zaloguj się
        </button>
        <button class="btn-secondary" type="button" @click="openAuthModal('signup')">
          Zarejestruj się
        </button>
      </div>
    </div>

    <div v-else class="calendar-layout">
      <div class="calendar-card">
        <div class="calendar-top">
          <div>
            <p class="calendar-weekday">{{ selectedWeekdayLabel }}</p>
            <h2>{{ monthLabel }}</h2>
            <p class="calendar-meta">{{ selectedDateLabel }}</p>
          </div>
          <div class="calendar-actions">
            <div class="month-switcher">
              <button
                class="nav-button"
                type="button"
                @click="goToPreviousMonth"
                aria-label="Poprzedni miesiąc"
              >
                ‹
              </button>
              <select class="month-select" :value="currentDate.getMonth()" @change="changeMonth">
                <option v-for="(month, index) in monthNames" :key="month" :value="index">
                  {{ month }}
                </option>
              </select>
              <button
                class="nav-button"
                type="button"
                @click="goToNextMonth"
                aria-label="Następny miesiąc"
              >
                ›
              </button>
            </div>
            <button class="calendar-button" type="button" @click="goToToday">Dzisiaj</button>
          </div>
        </div>

        <div class="calendar-grid">
          <div class="weekday" v-for="weekday in weekdayLabels" :key="weekday">
            {{ weekday }}
          </div>

          <template v-for="item in calendarDays" :key="item.key">
            <div v-if="item.type === 'empty'" class="day empty" />
            <button
              v-else
              class="day"
              :class="{
                active: item.value === selectedDay,
                hasLesson: hasLessons(item.value),
              }"
              @click="selectDay(item.value)"
            >
              <span>{{ item.value }}</span>
              <span v-if="hasLessons(item.value)" class="lesson-dot" />
            </button>
          </template>
        </div>
      </div>

      <div class="lessons-card">
        <div class="lessons-header">
          <div>
            <p class="lessons-label">Zapytania o lekcję</p>
            <h3>{{ selectedDateLabel }}</h3>
          </div>
          <span class="lessons-count">{{ notificationsCountLabel }}</span>
        </div>

        <div v-if="pendingNotifications.length > 0" class="notification-list">
          <article
            v-for="notification in pendingNotifications"
            :key="notification.id"
            class="notification-item"
          >
            <div class="notification-top">
              <div>
                <p class="notification-student">{{ notification.student }}</p>
                <p class="notification-topic">{{ notification.topic }}</p>
              </div>
              <span class="notification-pill">Nowe</span>
            </div>
            <p class="notification-meta">{{ notification.requestedAt }}</p>
            <p class="notification-message">{{ notification.message }}</p>
            <div class="notification-actions">
              <button
                class="accept-button"
                type="button"
                @click="handleNotificationDecision(notification.id, 'accept')"
              >
                Akceptuj
              </button>
              <button
                class="decline-button"
                type="button"
                @click="handleNotificationDecision(notification.id, 'decline')"
              >
                Odrzuć
              </button>
            </div>
          </article>
        </div>

        <div v-else class="lesson-empty">Brak nowych próśb o lekcję.</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.calendar-view-simple {
  width: 100%;
  display: flex;
  justify-content: center;
}

.auth-required-card {
  width: min(100%, 560px);
  padding: 28px;
  border-radius: 24px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
  text-align: center;
  box-sizing: border-box;
}

.auth-required-card h3 {
  margin: 0 0 10px;
  color: var(--text);
  font-size: 22px;
}

.auth-required-card p {
  margin: 0 0 18px;
  color: var(--muted);
  line-height: 1.6;
  font-size: 15px;
}

.auth-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  border: none;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary {
  background: var(--accent-strong);
  color: white;
}

.btn-secondary {
  background: var(--surface-soft);
  color: var(--text);
  border: 1px solid var(--border);
}

.calendar-view-simple {
  width: 100%;
  display: flex;
  justify-content: center;
}

.calendar-layout {
  width: 100%;
  display: grid;
  grid-template-columns: 1.2fr 0.95fr;
  gap: 16px;
  align-items: start;
}

.calendar-card {
  background: var(--surface-strong);
  border-radius: 28px;
  padding: 18px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
  color: var(--text);
  align-self: start;
  height: fit-content;
}

.lessons-card {
  background: var(--surface-strong);
  border-radius: 28px;
  padding: 18px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
  color: var(--text);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: fit-content;
  align-self: start;
}

:root[data-theme='dark'] .calendar-card,
:root[data-theme='dark'] .lessons-card,
:root[data-theme='dark'] .notification-item,
:root[data-theme='dark'] .lesson-empty {
  background: var(--surface-strong);
  border-color: rgba(148, 163, 184, 0.22);
  color: var(--text);
}

:root[data-theme='dark'] .nav-button,
:root[data-theme='dark'] .month-select,
:root[data-theme='dark'] .calendar-button,
:root[data-theme='dark'] .decline-button,
:root[data-theme='dark'] .day {
  background: var(--surface-soft);
  color: var(--text);
  border-color: var(--border);
  color-scheme: dark;
}

:root[data-theme='dark'] .month-select option {
  background: var(--surface-strong);
  color: var(--text);
}

.calendar-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 14px;
}

.calendar-weekday {
  margin: 0 0 6px;
  color: var(--muted);
  font-weight: 700;
}

h2 {
  margin: 0;
  font-size: 1.6rem;
  color: var(--text);
}

.calendar-meta,
.lessons-label {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 0.95rem;
}

.calendar-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.month-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-button,
.month-select,
.calendar-button {
  border: 1px solid var(--border);
  background: var(--surface-soft);
  color: var(--text);
  border-radius: 14px;
  padding: 10px 12px;
  cursor: pointer;
  font-weight: 700;
  transition:
    background-color var(--theme-transition-duration) var(--theme-transition-easing),
    transform var(--theme-transition-duration) var(--theme-transition-easing);
}

.nav-button {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.month-select {
  min-width: 118px;
  appearance: none;
}

.calendar-button {
  border: none;
  background: var(--primary-color);
  color: white;
  padding: 12px 22px;
  border-radius: 16px;
}

:root[data-theme='dark'] .calendar-button {
  background: var(--primary-color);
  color: white;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 10px;
}

.weekday {
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
}

.day {
  min-height: 58px;
  border-radius: 20px;
  background: var(--surface-soft);
  color: var(--text);
  display: grid;
  place-items: center;
  font-weight: 700;
  border: 1px solid var(--border);
  cursor: pointer;
  transition:
    transform var(--theme-transition-duration) var(--theme-transition-easing),
    box-shadow var(--theme-transition-duration) var(--theme-transition-easing),
    background-color var(--theme-transition-duration) var(--theme-transition-easing),
    color var(--theme-transition-duration) var(--theme-transition-easing);
}

.day:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
  background: color-mix(in srgb, var(--surface-soft) 88%, var(--primary-color) 12%);
}

.lesson-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--primary-color);
  display: block;
  margin-top: 6px;
  box-shadow: 0 0 0 2px rgba(91, 120, 198, 0.2);
}

.day.empty {
  background: transparent;
  opacity: 0;
  cursor: default;
}

.day.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  box-shadow: 0 10px 20px rgba(91, 120, 198, 0.22);
}

.lessons-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 12px;
}

.lessons-header h3 {
  margin: 4px 0 0;
  font-size: 1.25rem;
}

.lessons-count {
  color: var(--accent-strong);
  font-weight: 700;
}

.notification-list {
  display: grid;
  gap: 10px;
  overflow-y: auto;
  padding-right: 4px;
  min-height: 0;
  flex: 1;
  max-height: calc(2 * 132px + 10px);
}

.notification-item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 18px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  min-height: 132px;
}

.notification-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.notification-student {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
}

.notification-topic {
  margin: 4px 0 0;
  color: var(--accent-strong);
  font-weight: 600;
}

.notification-pill {
  border-radius: 999px;
  padding: 6px 10px;
  background: rgba(91, 120, 198, 0.12);
  color: var(--accent-strong);
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
}

.notification-meta {
  margin: 0;
  color: var(--muted);
  font-size: 0.92rem;
}

.notification-message {
  margin: 0;
  color: var(--text);
  line-height: 1.6;
}

.notification-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.accept-button,
.decline-button {
  border: none;
  border-radius: 10px;
  padding: 8px 10px;
  font-weight: 700;
  cursor: pointer;
}

.accept-button {
  background: var(--primary-color);
  color: white;
}

.decline-button {
  background: var(--surface-soft);
  color: var(--text);
  border: 1px solid var(--border);
}

.lesson-empty {
  padding: 24px;
  border-radius: 20px;
  background: var(--surface-soft);
  color: var(--muted);
  font-weight: 600;
}

@media (max-width: 980px) {
  .calendar-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .calendar-card,
  .lessons-card {
    padding: 18px;
  }

  .calendar-grid {
    gap: 8px;
  }

  .day {
    min-height: 60px;
  }
}
</style>
