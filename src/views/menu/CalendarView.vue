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

const calendarDays = computed(() =>
  Array.from({ length: daysInMonth.value }, (_, index) => index + 1),
)

const lessonsByDay = ref({})
const lessonForm = ref({
  time: '',
  title: '',
  student: '',
  location: 'Online',
})
const formError = ref('')
const timeInput = ref(null)
const titleInput = ref(null)
const studentInput = ref(null)

function getLessonKey(day = selectedDay.value) {
  return `${currentDate.value.getFullYear()}-${currentDate.value.getMonth() + 1}-${String(day).padStart(2, '0')}`
}

const selectedLessons = computed(() => lessonsByDay.value[getLessonKey()] || [])
const selectedDateLabel = computed(() => {
  const date = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth(),
    selectedDay.value,
  )
  return formatDateLabel(date)
})

function hasLessons(day) {
  const lessonKey = getLessonKey(day)
  return Array.isArray(lessonsByDay.value[lessonKey]) && lessonsByDay.value[lessonKey].length > 0
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

function showValidationPopup(
  input,
  message = 'Wprowadź prawidłową wartość. Pole jest niekompletne lub ma nieprawidłową datę.',
) {
  if (input?.value) {
    input.value.setCustomValidity(message)
    input.value.reportValidity()
  }
}

function clearValidation(input) {
  if (input?.value) {
    input.value.setCustomValidity('')
  }
}

function addLesson() {
  const timeValue = lessonForm.value.time.trim()
  const titleValue = lessonForm.value.title.trim()
  const studentValue = lessonForm.value.student.trim()

  if (!timeValue) {
    formError.value =
      'Wprowadź prawidłową wartość. Pole jest niekompletne lub ma nieprawidłową datę.'
    showValidationPopup(timeInput)
    return
  }

  if (!titleValue) {
    formError.value = 'Wprowadź prawidłową wartość. Pole jest niekompletne.'
    return
  }

  if (!studentValue) {
    formError.value = 'Wprowadź prawidłową wartość. Pole jest niekompletne.'
    return
  }

  const studentWords = studentValue.split(/\s+/).filter(Boolean)
  if (studentWords.length !== 2) {
    formError.value = 'Wprowadź prawidłową wartość. Pole jest niekompletne.'
    return
  }

  const validTimePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/
  if (!validTimePattern.test(timeValue)) {
    formError.value =
      'Wprowadź prawidłową wartość. Pole jest niekompletne lub ma nieprawidłową datę.'
    showValidationPopup(timeInput)
    return
  }

  formError.value = ''
  clearValidation(timeInput)
  clearValidation(titleInput)
  clearValidation(studentInput)

  const lessonKey = getLessonKey(selectedDay.value)
  const dayLessons = lessonsByDay.value[lessonKey] || []
  lessonsByDay.value = {
    ...lessonsByDay.value,
    [lessonKey]: [
      ...dayLessons,
      {
        time: timeValue,
        title: titleValue,
        student: studentValue,
        location: lessonForm.value.location,
      },
    ],
  }

  lessonForm.value = {
    time: '',
    title: '',
    student: '',
    location: 'Online',
  }
}

function removeLesson(index) {
  const lessonKey = getLessonKey(selectedDay.value)
  const dayLessons = [...(lessonsByDay.value[lessonKey] || [])]
  dayLessons.splice(index, 1)

  if (dayLessons.length === 0) {
    const updatedLessons = { ...lessonsByDay.value }
    delete updatedLessons[lessonKey]
    lessonsByDay.value = updatedLessons
    return
  }

  lessonsByDay.value = {
    ...lessonsByDay.value,
    [lessonKey]: dayLessons,
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
            <p class="calendar-weekday">Śr</p>
            <h2>{{ monthLabel }}</h2>
            <p class="calendar-meta">Dzień 196, Tydzień 29</p>
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

          <button
            v-for="day in calendarDays"
            :key="day"
            class="day"
            :class="{
              active: day === selectedDay,
              hasLesson: hasLessons(day),
            }"
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
            <p class="lessons-label">Zaplanowane lekcje</p>
            <h3>{{ selectedDateLabel }}</h3>
          </div>
          <span class="lessons-count">{{
            selectedLessons.length === 0
              ? 'Brak lekcji'
              : selectedLessons.length === 1
                ? '1 lekcja'
                : `${selectedLessons.length} lekcje`
          }}</span>
        </div>

        <form class="lesson-form" @submit.prevent="addLesson">
          <input
            ref="timeInput"
            v-model="lessonForm.time"
            type="time"
            placeholder="Godzina"
            @input="clearValidation(timeInput)"
          />
          <input v-model="lessonForm.title" type="text" placeholder="Temat" />
          <input v-model="lessonForm.student" type="text" placeholder="Imię i nazwisko ucznia" />
          <p v-if="formError" class="form-error">{{ formError }}</p>
          <select v-model="lessonForm.location">
            <option value="Online">Online</option>
            <option value="Studio">Studio</option>
          </select>
          <button class="add-lesson-button" type="submit">Dodaj lekcję</button>
        </form>

        <div v-if="selectedLessons.length > 0" class="lesson-list">
          <article
            v-for="(lesson, index) in selectedLessons"
            :key="`${lesson.time}-${lesson.title}`"
            class="lesson-item"
          >
            <div>
              <p class="lesson-time">{{ lesson.time }}</p>
              <p class="lesson-title">{{ lesson.title }}</p>
            </div>
            <div class="lesson-meta">
              <span>{{ lesson.student }}</span>
              <span>{{ lesson.location }}</span>
            </div>
            <button class="remove-lesson-button" type="button" @click="removeLesson(index)">
              Usuń
            </button>
          </article>
        </div>

        <div v-else class="lesson-empty">Brak zaplanowanych lekcji tego dnia.</div>
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
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
}

.calendar-card,
.lessons-card {
  background: var(--surface-strong);
  border-radius: 28px;
  padding: 24px;
  box-shadow: var(--shadow-soft);
  border: 1px solid var(--border);
  color: var(--text);
}

:root[data-theme='dark'] .calendar-card,
:root[data-theme='dark'] .lessons-card {
  background: #111827;
  border-color: rgba(148, 163, 184, 0.22);
  color: #f8fafc;
}

.calendar-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
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

.nav-button:hover,
.month-select:hover,
.calendar-button:hover {
  background: var(--primary-color-hover);
  color: white;
  transform: translateY(-1px);
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
  min-height: 72px;
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
  margin-bottom: 18px;
}

.lessons-header h3 {
  margin: 4px 0 0;
  font-size: 1.25rem;
}

.lessons-count {
  color: var(--accent-strong);
  font-weight: 700;
}

.lesson-form {
  display: grid;
  gap: 10px;
  margin-bottom: 16px;
}

.lesson-form input,
.lesson-form select {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 12px;
  background: var(--surface-soft);
  color: var(--text);
}

.add-lesson-button,
.remove-lesson-button {
  border: none;
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 700;
  cursor: pointer;
}

.add-lesson-button {
  background: var(--primary-color);
  color: white;
}

.remove-lesson-button {
  background: var(--surface-soft);
  color: var(--text);
  border: 1px solid var(--border);
}

.lesson-list {
  display: grid;
  gap: 16px;
}

.lesson-item {
  display: grid;
  gap: 10px;
  padding: 18px;
  border-radius: 20px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
}

.lesson-time {
  margin: 0;
  font-size: 0.95rem;
  color: var(--accent-strong);
  font-weight: 700;
}

.lesson-title {
  margin: 2px 0 0;
  font-size: 1rem;
  color: var(--text);
}

.lesson-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--muted);
  font-size: 0.95rem;
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
