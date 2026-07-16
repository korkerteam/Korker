<script setup>
import { computed, ref } from 'vue'

const monthLabel = 'lipiec 2026'
const weekdayLabels = ['Po', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Ni']
const selectedDay = ref(15)

const calendarCells = [
  null,
  null,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
]

const lessonsByDay = {
  15: [
    { time: '10:00', title: 'Matematyka - algebra', student: 'Marta', location: 'Online' },
    { time: '13:00', title: 'Angielski - konwersacje', student: 'Kamil', location: 'Studio' },
  ],
  16: [{ time: '09:00', title: 'Fizyka - kinetyka', student: 'Ola', location: 'Online' }],
  18: [
    {
      time: '17:00',
      title: 'Język polski - analiza tekstu',
      student: 'Bartek',
      location: 'Studio',
    },
  ],
}

const selectedLessons = computed(() => lessonsByDay[selectedDay.value] || [])
const selectedDateLabel = computed(() => `Środa, ${selectedDay.value} lipca 2026`)

function hasLessons(day) {
  return day !== null && Array.isArray(lessonsByDay[day]) && lessonsByDay[day].length > 0
}

function selectDay(day) {
  if (day === null) return
  selectedDay.value = day
}
</script>

<template>
  <section class="calendar-view-simple">
    <div class="calendar-layout">
      <div class="calendar-card">
        <div class="calendar-top">
          <div>
            <p class="calendar-weekday">Śr</p>
            <h2>{{ monthLabel }}</h2>
            <p class="calendar-meta">Dzień 196, Tydzień 29</p>
          </div>
          <button class="calendar-button">Dzisiaj</button>
        </div>

        <div class="calendar-grid">
          <div class="weekday" v-for="weekday in weekdayLabels" :key="weekday">
            {{ weekday }}
          </div>

          <button
            v-for="(day, index) in calendarCells"
            :key="index"
            class="day"
            :class="{
              empty: day === null,
              active: day === selectedDay,
              clickable: day !== null,
              hasLesson: hasLessons(day),
            }"
            :disabled="day === null"
            @click="selectDay(day)"
          >
            <span>{{ day || '' }}</span>
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

        <div v-if="selectedLessons.length > 0" class="lesson-list">
          <article v-for="lesson in selectedLessons" :key="lesson.time" class="lesson-item">
            <div>
              <p class="lesson-time">{{ lesson.time }}</p>
              <p class="lesson-title">{{ lesson.title }}</p>
            </div>
            <div class="lesson-meta">
              <span>{{ lesson.student }}</span>
              <span>{{ lesson.location }}</span>
            </div>
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

.calendar-button {
  border: none;
  background: var(--accent-strong);
  color: white;
  padding: 12px 22px;
  border-radius: 16px;
  cursor: pointer;
  font-weight: 700;
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
}

.day.clickable {
  cursor: pointer;
}

.day.clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
}

.lesson-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent-strong);
  display: block;
  margin-top: 6px;
}

.day.empty {
  background: transparent;
  opacity: 0;
  cursor: default;
}

.day.active {
  background: var(--accent-strong);
  color: white;
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
