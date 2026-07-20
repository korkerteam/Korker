<script setup>
import { computed, ref, watch } from 'vue'
import { supabase } from '@/lib/supabase.js'
import { useAuth } from '@/composables/useAuth.js'

const props = defineProps({
  isTutorAccount: {
    type: Boolean,
    default: false,
  },
  resetKey: {
    type: Number,
    default: 0,
  },
})

const { isAuthenticated, openAuthModal, user } = useAuth()

const todayDate = new Date()
const weekdayLabels = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']
const lessonRequests = ref([])
const userCache = ref({})
const loadingRequests = ref(false)
const selectedDayLessons = ref([])

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function toKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isToday(date) {
  return toKey(date) === toKey(todayDate)
}

const currentWeekStart = ref(getMonday(todayDate))
const selectedDayKey = ref(null)

const weekDays = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart.value)
    d.setDate(d.getDate() + i)
    return {
      date: d,
      key: toKey(d),
      dayNum: d.getDate(),
      weekday: weekdayLabels[i],
      isToday: isToday(d),
      isSelected: toKey(d) === selectedDayKey.value,
    }
  })
})

const weekLabel = computed(() => {
  const start = currentWeekStart.value
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmtShort = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short' })
  const fmtYear = new Intl.DateTimeFormat('pl-PL', { year: 'numeric' })
  return `${fmtShort.format(start)} – ${fmtShort.format(end)} ${fmtYear.format(end)}`
})

const fullDateLabel = computed(() => {
  if (!selectedDayKey.value) return ''
  const [y, m, d] = selectedDayKey.value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return new Intl.DateTimeFormat('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
    .format(date)
    .replace(/^./, (c) => c.toUpperCase())
})

const filteredRequests = computed(() => {
  if (props.isTutorAccount) {
    return lessonRequests.value.filter((r) => r.status === 'pending')
  }
  return lessonRequests.value
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
    for (const p of profiles || []) map[p.auth_id] = p
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

async function handleCancel(lessonId, dayOfWeek, hourNums) {
  if (!lessonId || dayOfWeek == null) return
  const request = lessonRequests.value.find((r) => r.id === lessonId)
  if (!request) return
  const masks = [...(request.requested_slots || [])]
  const bitsToClear = hourNums.reduce((acc, h) => acc | (1 << h), 0)
  masks[dayOfWeek] = (masks[dayOfWeek] || 0) & ~bitsToClear
  const { error } = await supabase
    .from('lesson_requests')
    .update({ requested_slots: masks, updated_at: new Date().toISOString() })
    .eq('id', lessonId)
  if (error) {
    console.error('Failed to cancel lesson:', error)
    return
  }
  request.requested_slots = masks
}

const lessonsByDate = computed(() => {
  const map = {}
  const approvedRequests = lessonRequests.value.filter((r) => r.status === 'approved')
  for (const request of approvedRequests) {
    const masks = request.requested_slots
    if (!Array.isArray(masks)) continue
    for (let dayOfWeek = 0; dayOfWeek < masks.length; dayOfWeek++) {
      const mask = masks[dayOfWeek]
      if (typeof mask !== 'number' || mask === 0) continue
      const hours = []
      const hourNums = []
      for (let h = 0; h < 24; h++) {
        if (mask & (1 << h)) {
          hours.push(`${String(h).padStart(2, '0')}:00`)
          hourNums.push(h)
        }
      }
      if (hours.length === 0) continue
      for (const day of weekDays.value) {
        const jsDay = day.date.getDay()
        const mondayBased = jsDay === 0 ? 6 : jsDay - 1
        if (mondayBased === dayOfWeek) {
          if (!map[day.key]) map[day.key] = []
          map[day.key].push({
            name: getOtherName(request),
            subject: getOtherSubject(request),
            hours,
            hourNums,
            dayOfWeek,
            id: request.id,
          })
        }
      }
    }
  }
  return map
})

const weekLessons = computed(() => {
  const all = []
  for (const day of weekDays.value) {
    const lessons = lessonsByDate.value[day.key]
    if (lessons) all.push(...lessons.map((l) => ({ ...l, dayKey: day.key, weekday: day.weekday })))
  }
  return all
})

function hasLessons(dayKey) {
  return lessonsByDate.value[dayKey]?.length > 0
}

function selectDay(key) {
  selectedDayKey.value = key
  selectedDayLessons.value = lessonsByDate.value[key] || []
}

function goToPreviousWeek() {
  const d = new Date(currentWeekStart.value)
  d.setDate(d.getDate() - 7)
  currentWeekStart.value = d
}

function goToNextWeek() {
  const d = new Date(currentWeekStart.value)
  d.setDate(d.getDate() + 7)
  currentWeekStart.value = d
}

function goToToday() {
  currentWeekStart.value = getMonday(todayDate)
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

watch(
  () => props.resetKey,
  () => {
    selectedDayKey.value = null
    selectedDayLessons.value = []
  },
)

watch(
  selectedDayKey,
  (key) => {
    selectedDayLessons.value = lessonsByDate.value[key] || []
  },
  { immediate: true },
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

    <div v-else class="calendar-card">
      <div class="cal-header">
        <div class="cal-nav">
          <button
            class="nav-btn"
            type="button"
            @click="goToPreviousWeek"
            aria-label="Poprzedni tydzień"
          >
            ‹
          </button>
          <span class="cal-week-label">{{ weekLabel }}</span>
          <button class="nav-btn" type="button" @click="goToNextWeek" aria-label="Następny tydzień">
            ›
          </button>
        </div>
        <button class="today-btn" type="button" @click="goToToday">Dzisiaj</button>
      </div>

      <div class="week-grid">
        <button
          v-for="day in weekDays"
          :key="day.key"
          class="day-cell"
          :class="{
            active: day.isSelected,
            today: day.isToday,
            hasLesson: hasLessons(day.key),
          }"
          @click="selectDay(day.key)"
        >
          <span class="day-cell-weekday">{{ day.weekday }}</span>
          <span class="day-cell-num">{{ day.dayNum }}</span>
          <span v-if="hasLessons(day.key)" class="day-cell-dot" />
        </button>
      </div>

      <div class="cal-divider" />

      <p class="cal-section-title">
        {{ selectedDayKey ? fullDateLabel : 'Nadchodzące lekcje' }}
      </p>

      <div v-if="selectedDayKey" class="lessons-list">
        <article v-for="lesson in selectedDayLessons" :key="lesson.id" class="lesson-card">
          <div class="lesson-card-top">
            <strong class="lesson-card-name">{{ lesson.name }}</strong>
            <span v-if="lesson.subject" class="lesson-card-subject">{{ lesson.subject }}</span>
          </div>
          <div class="lesson-card-footer">
            <div class="lesson-card-hours">
              <span v-for="hour in lesson.hours" :key="hour" class="hour-chip">{{ hour }}</span>
            </div>
          </div>
        </article>
        <p v-if="selectedDayLessons.length === 0" class="empty-text">Brak lekcji tego dnia</p>
      </div>

      <div v-else class="week-lessons-list">
        <template v-if="weekLessons.length > 0">
          <div v-for="day in weekDays" :key="day.key">
            <p
              v-if="weekLessons.filter((l) => l.dayKey === day.key).length"
              class="day-group-label"
            >
              {{ day.weekday }} {{ day.dayNum }}
            </p>
            <article
              v-for="lesson in weekLessons.filter((l) => l.dayKey === day.key)"
              :key="lesson.id"
              class="lesson-card"
            >
              <div class="lesson-card-top">
                <strong class="lesson-card-name">{{ lesson.name }}</strong>
                <span v-if="lesson.subject" class="lesson-card-subject">{{ lesson.subject }}</span>
              </div>
              <div class="lesson-card-footer">
                <div class="lesson-card-hours">
                  <span v-for="hour in lesson.hours" :key="hour" class="hour-chip">{{ hour }}</span>
                </div>
                <button
                  class="cancel-btn"
                  type="button"
                  @click="handleCancel(lesson.id, lesson.dayOfWeek, lesson.hourNums)"
                >
                  Anuluj
                </button>
              </div>
            </article>
          </div>
        </template>
        <p v-else class="empty-text">Brak zaplanowanych lekcji w tym tygodniu</p>
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

.calendar-card {
  width: 100%;
  background: var(--surface-strong);
  border-radius: 28px;
  padding: 28px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
  color: var(--text);
  box-sizing: border-box;
}

:root[data-theme='dark'] .calendar-card {
  background: var(--surface-strong);
  border-color: rgba(148, 163, 184, 0.22);
  color: var(--text);
}

:root[data-theme='dark'] .nav-btn,
:root[data-theme='dark'] .today-btn,
:root[data-theme='dark'] .day-cell {
  background: var(--surface-soft);
  color: var(--text);
  border-color: var(--border);
  color-scheme: dark;
}

.cal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.cal-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cal-week-label {
  font-weight: 800;
  font-size: 1.15rem;
  color: var(--text);
  white-space: nowrap;
  min-width: 220px;
  text-align: center;
}

.nav-btn {
  width: 52px;
  height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  color: var(--text);
  border-radius: 16px;
  cursor: pointer;
  font-weight: 700;
  transition: background-color var(--theme-transition-duration) var(--theme-transition-easing);
}

.nav-btn:hover {
  background: var(--surface-hover);
}

.today-btn {
  border: none;
  background: var(--primary-color);
  color: white;
  padding: 16px 30px;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  transition: opacity 0.15s ease;
}

.today-btn:hover {
  opacity: 0.85;
}

:root[data-theme='dark'] .today-btn {
  background: var(--primary-color);
  color: white;
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 14px;
}

.day-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 96px;
  border-radius: 22px;
  background: var(--surface-soft);
  color: var(--text);
  font-weight: 700;
  border: 2px solid var(--border);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.day-cell:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.1);
  border-color: var(--primary-color);
}

.day-cell-weekday {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.day-cell-num {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
}

.day-cell.today .day-cell-num {
  color: var(--primary-color);
}

.day-cell-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  display: block;
}

.day-cell.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  box-shadow: 0 12px 28px rgba(91, 120, 198, 0.25);
}

.day-cell.active .day-cell-weekday,
.day-cell.active .day-cell-num {
  color: white;
}
.day-cell.active .day-cell-dot {
  background: white;
}

.cal-divider {
  height: 1px;
  background: var(--border);
  margin: 24px 0 18px;
}

.cal-section-title {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.lessons-list,
.week-lessons-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lesson-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border-radius: 20px;
  background: var(--accent-soft);
  border: 1px solid var(--accent);
}

.lesson-card-top {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}

.lesson-card-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text);
}

.lesson-card-subject {
  font-size: 0.95rem;
  color: var(--accent-strong);
  font-weight: 600;
}

.lesson-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.lesson-card-hours {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hour-chip {
  background: var(--primary-color);
  color: white;
  padding: 5px 14px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
}

.cancel-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
  font-weight: 600;
  font-size: 0.8rem;
  padding: 5px 12px;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

.cancel-btn:hover {
  color: #ef4444;
  border-color: #ef4444;
}

.empty-text {
  margin: 0;
  color: var(--muted);
  font-size: 1rem;
  padding: 8px 0;
}

.day-group-label {
  margin: 2px 0 6px;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

@media (max-width: 760px) {
  .calendar-card {
    padding: 20px;
  }
  .week-grid {
    gap: 8px;
  }
  .day-cell {
    min-height: 76px;
    gap: 4px;
  }
  .day-cell-num {
    font-size: 1.3rem;
  }
  .cal-week-label {
    min-width: 160px;
    font-size: 1rem;
  }
  .nav-btn {
    width: 44px;
    height: 44px;
    font-size: 1.2rem;
  }
  .today-btn {
    padding: 14px 24px;
  }
  .lesson-card {
    padding: 16px;
  }
}
</style>
