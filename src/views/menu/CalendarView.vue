<script setup>
import { computed, ref, watch } from 'vue'
import { supabase } from '@/lib/supabase.js'
import { useAuth } from '@/composables/useAuth.js'

const props = defineProps({
  isTutorAccount: {
    type: Boolean,
    default: false,
  },
})

const { isAuthenticated, openAuthModal, user } = useAuth()

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

const lessonRequests = ref([])
const userCache = ref({})
const loadingRequests = ref(false)

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

const filteredRequests = computed(() => {
  if (props.isTutorAccount) {
    return lessonRequests.value.filter((r) => r.status === 'pending')
  }
  return lessonRequests.value
})

const requestsCountLabel = computed(() => {
  const count = filteredRequests.value.length
  if (count === 0) return props.isTutorAccount ? 'Brak próśb' : 'Brak lekcji'

  if (props.isTutorAccount) {
    return count === 1 ? '1 prośba' : `${count} prośby`
  }

  const approved = lessonRequests.value.filter((r) => r.status === 'approved').length
  const rejected = lessonRequests.value.filter((r) => r.status === 'rejected').length
  const pending = lessonRequests.value.filter((r) => r.status === 'pending').length
  const parts = []
  if (approved) parts.push(`${approved} zaakceptowanych`)
  if (pending) parts.push(`${pending} oczekujących`)
  if (rejected) parts.push(`${rejected} odrzuconych`)
  return parts.join(', ')
})

function getOtherProfile(entry) {
  const authId = props.isTutorAccount ? entry.student_id : entry.tutor_id
  return userCache.value[authId] || null
}

function getOtherName(entry) {
  const p = getOtherProfile(entry)
  if (!p) return 'Ładowanie...'
  return p.nickname || [p.name, p.surname].filter(Boolean).join(' ') || 'Nieznany'
}

function getOtherSubject(entry) {
  const p = getOtherProfile(entry)
  return p?.tutor_post?.subject || ''
}

function slotLabelsFromMasks(masks) {
  const dayKeys = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela']
  const labels = []
  if (!Array.isArray(masks)) return labels
  for (let di = 0; di < masks.length; di++) {
    const mask = masks[di]
    if (typeof mask === 'number' && mask > 0) {
      for (let h = 0; h < 24; h++) {
        if (mask & (1 << h)) {
          labels.push(`${dayKeys[di]} ${String(h).padStart(2, '0')}:00`)
        }
      }
    }
  }
  return labels
}

async function fetchLessonRequests() {
  if (!user.value) return
  loadingRequests.value = true

  const column = props.isTutorAccount ? 'tutor_id' : 'student_id'
  const { data, error } = await supabase
    .from('lesson_requests')
    .select('*')
    .eq(column, user.value.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch lesson requests:', error)
    lessonRequests.value = []
    loadingRequests.value = false
    return
  }

  lessonRequests.value = data || []

  const otherIds = new Set()
  for (const r of data || []) {
    otherIds.add(props.isTutorAccount ? r.student_id : r.tutor_id)
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
    userCache.value = map
  }

  loadingRequests.value = false
}

async function handleAccept(entry) {
  const { error } = await supabase
    .from('lesson_requests')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', entry.id)

  if (error) {
    console.error('Failed to accept request:', error)
    return
  }

  const { data: tutorProfile } = await supabase
    .from('users')
    .select('saved_tutors')
    .eq('auth_id', user.value.id)
    .maybeSingle()

  const current = tutorProfile?.saved_tutors || []
  if (!current.includes(entry.student_id)) {
    await supabase
      .from('users')
      .update({ saved_tutors: [...current, entry.student_id] })
      .eq('auth_id', user.value.id)
  }

  entry.status = 'approved'
}

async function handleReject(entry) {
  const { error } = await supabase
    .from('lesson_requests')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', entry.id)

  if (error) {
    console.error('Failed to reject request:', error)
    return
  }

  entry.status = 'rejected'
}

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

watch(
  () => user.value,
  (u) => {
    if (u) fetchLessonRequests()
  },
  { immediate: true },
)

watch(
  () => props.isTutorAccount,
  () => {
    if (user.value) fetchLessonRequests()
  },
)
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
          <div class="weekday" v-for="weekday in weekdayLabels" :key="weekday">{{ weekday }}</div>
          <button
            v-for="day in calendarDays"
            :key="day"
            class="day"
            :class="{ active: day === selectedDay, hasLesson: hasLessons(day) }"
            @click="selectDay(day)"
          >
            <span>{{ day }}</span>
            <span v-if="hasLessons(day)" class="lesson-dot" />
          </button>
        </div>
      </div>

      <div class="lessons-card">
        <div class="lessons-header">
          <div>
            <p class="lessons-label">
              {{ props.isTutorAccount ? 'Prośby o lekcję' : 'Moje zgłoszenia' }}
            </p>
            <h3>{{ selectedDateLabel }}</h3>
          </div>
          <span class="lessons-count">{{ requestsCountLabel }}</span>
        </div>

        <div v-if="loadingRequests" class="lesson-empty">Ładowanie...</div>

        <div v-else-if="filteredRequests.length > 0" class="notification-list">
          <article v-for="entry in filteredRequests" :key="entry.id" class="notification-item">
            <div class="notification-top">
              <div>
                <p class="notification-student">{{ getOtherName(entry) }}</p>
                <p v-if="getOtherSubject(entry)" class="notification-topic">
                  {{ getOtherSubject(entry) }}
                </p>
              </div>
              <span v-if="entry.status === 'pending'" class="notification-pill new-pill">Nowe</span>
              <span v-else-if="entry.status === 'approved'" class="notification-pill approved-pill"
                >Zaakceptowano</span
              >
              <span v-else-if="entry.status === 'rejected'" class="notification-pill rejected-pill"
                >Odrzucono</span
              >
            </div>

            <div class="notification-slots">
              <span
                v-for="slot in slotLabelsFromMasks(entry.requested_slots)"
                :key="slot"
                class="slot-chip"
                >{{ slot }}</span
              >
            </div>

            <p class="notification-meta">
              {{
                new Date(entry.created_at).toLocaleDateString('pl-PL', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              }}
            </p>

            <div
              v-if="props.isTutorAccount && entry.status === 'pending'"
              class="notification-actions"
            >
              <button class="accept-button" type="button" @click="handleAccept(entry)">
                Akceptuj
              </button>
              <button class="decline-button" type="button" @click="handleReject(entry)">
                Odrzuć
              </button>
            </div>
          </article>
        </div>
        <div v-else class="lesson-empty">
          {{ props.isTutorAccount ? 'Brak nowych próśb o lekcję.' : 'Brak zgłoszeń.' }}
        </div>
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
  max-height: calc(2 * 200px);
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
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
}

.new-pill {
  background: rgba(91, 120, 198, 0.12);
  color: var(--accent-strong);
}

.approved-pill {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}

.rejected-pill {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}

.notification-meta {
  margin: 0;
  color: var(--muted);
  font-size: 0.92rem;
}

.notification-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.slot-chip {
  background: rgba(79, 117, 199, 0.1);
  color: var(--accent-strong);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
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
